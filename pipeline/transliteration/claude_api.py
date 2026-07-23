"""
Claude API Integration Module

Provides functionality to generate word-to-word translations for song verses
using Anthropic's Claude AI model via API.
"""
import os
import json
import logging
import requests
from typing import Dict, List, Any, Tuple, Optional, Union

# Configure logging
logger = logging.getLogger(__name__)


class ClaudeAPIClient:
    """Client for interacting with Claude AI API to generate word-to-word translations."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Claude API client.

        Args:
            api_key: Claude API key. If None, will try to load from CLAUDE_API_KEY environment variable.
        """
        self.api_key = api_key or os.environ.get("CLAUDE_API_KEY")
        if not self.api_key:
            logger.warning("No Claude API key provided. Set CLAUDE_API_KEY environment variable.")
        
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-haiku-20240307"  # Default model, can be changed
    
    def set_model(self, model_name: str) -> None:
        """
        Set the Claude model to use.

        Args:
            model_name: Name of the Claude model (e.g., "claude-3-opus-20240229", "claude-3-sonnet-20240229")
        """
        self.model = model_name

    def _build_prompt_for_word_to_word(
        self, 
        original_lines: List[str],
        target_language_code: str,
        existing_translations: Optional[Dict[str, str]] = None,
        context_text: Optional[str] = None
    ) -> str:
        """
        Build a prompt for word-to-word translation generation.

        Args:
            original_lines: List of original verse lines
            target_language_code: ISO 639-3 language code for target translation
            existing_translations: Optional dictionary of existing word translations to maintain consistency
            context_text: Optional context about the song to help with translation

        Returns:
            Formatted prompt string for Claude API
        """
        language_map = {
            "eng": "English",
            "hin": "Hindi",
            "ben": "Bengali",
            "guj": "Gujarati",
            "san": "Sanskrit",
            # Add more languages as needed
        }
        
        target_language = language_map.get(target_language_code, target_language_code)
        
        prompt = f"""You are a skilled translator specializing in Bengali/Sanskrit devotional texts. 
I need a word-to-word translation of the following verse into {target_language}.

ORIGINAL VERSE:
{' '.join(original_lines)}

Please provide a word-to-word translation in the following format, breaking down each word or meaningful phrase:
[source_word, translation]

Guidelines:
1. Keep translations concise and accurate
2. For devotional terms, use appropriate devotional vocabulary
3. Consider the devotional Vaishnava context
4. Maintain consistency in translating repeated terms
5. For compound words, translate as meaningful units"""

        # Add any existing translations as context to maintain consistency
        if existing_translations and len(existing_translations) > 0:
            prompt += "\n\nPlease maintain consistency with these existing translations:"
            for word, translation in existing_translations.items():
                prompt += f"\n{word}: {translation}"

        # Add song context if available
        if context_text:
            prompt += f"\n\nCONTEXT ABOUT THE SONG:\n{context_text}"

        # Ask for structured JSON response
        prompt += """\n\nPlease format your response as a valid JSON array of arrays, with no explanations before or after:
[
  ["source_word_1", "translation_1"],
  ["source_word_2", "translation_2"],
  ...
]
"""
        return prompt

    def generate_word_to_word(
        self,
        original_lines: List[str],
        target_language_code: str,
        existing_translations: Optional[Dict[str, str]] = None,
        context_text: Optional[str] = None
    ) -> List[Tuple[str, str]]:
        """
        Generate word-to-word translations using Claude API.

        Args:
            original_lines: List of original verse lines
            target_language_code: ISO 639-3 language code for target translation
            existing_translations: Optional dictionary of existing word translations to maintain consistency
            context_text: Optional context about the song to help with translation

        Returns:
            List of (source_word, translation) tuples
        """
        if not self.api_key:
            raise ValueError("Claude API key is required. Set CLAUDE_API_KEY environment variable or pass in constructor.")

        prompt = self._build_prompt_for_word_to_word(
            original_lines, 
            target_language_code, 
            existing_translations, 
            context_text
        )

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        data = {
            "model": self.model,
            "max_tokens": 1000,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3  # Lower temperature for more deterministic results
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=data, timeout=60)
            response.raise_for_status()
            
            response_data = response.json()
            content = response_data.get("content", [])
            if not content or not content[0].get("text"):
                raise ValueError(f"Unexpected API response format: {response_data}")
                
            result_text = content[0]["text"]
            
            # Try to parse JSON response
            try:
                # Find JSON array in the response
                json_start = result_text.find('[')
                json_end = result_text.rfind(']') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = result_text[json_start:json_end]
                    translations = json.loads(json_str)
                    return [(src, trans) for src, trans in translations]
                else:
                    raise ValueError("Could not find JSON array in response")
            except json.JSONDecodeError:
                logger.error(f"Failed to parse Claude response as JSON: {result_text}")
                # Fallback to simple parsing if JSON parsing fails
                words = []
                for line in result_text.split("\n"):
                    if ":" in line:
                        parts = line.split(":", 1)
                        source = parts[0].strip().strip('"`[]')
                        translation = parts[1].strip().strip('"`[]')
                        if source and translation:
                            words.append((source, translation))
                return words
                
        except requests.RequestException as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            raise

    def extract_existing_translations(self, word_to_words: List[Dict[str, Any]], target_language_code: str) -> Dict[str, str]:
        """
        Extract existing translations from word_to_words entries to maintain consistency.

        Args:
            word_to_words: Existing word-to-word translation entries
            target_language_code: Target language code to filter translations

        Returns:
            Dictionary mapping source words to their translations
        """
        translations = {}
        
        for entry in word_to_words:
            if entry.get("language_code") == target_language_code and "words" in entry:
                for source_word, translation in entry.get("words", []):
                    if source_word and translation and translation != "NULL":
                        translations[source_word] = translation
        
        return translations