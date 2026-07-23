"""
Script Generator Module

Generates transliterations of the ISO 15919 Latin text into
various scripts using Aksharamukha or similar transliteration tools.
"""
import re
from typing import Dict, List, Any, Union
import aksharamukha.transliterate as ak_trans

# TODO: Make the flags come from a config file and make it dynamic
# Import flag constants
from transliteration.iso_converter import (
    FLAG_PULLBACK, FLAG_HYPHEN_ALPHA, FLAG_DROPPED_VOWEL_BENG
)

class AksharamukhaTransliterator:
    """
    Wrapper for Aksharamukha transliteration.

    Uses the Aksharamukha Python package to perform transliteration
    between different scripts, with special handling for
    diacritics and specific Bengali/Sanskrit character features.
    """

    def __init__(self):
        # TODO: Put this in a config file and also as a command line argument and parameter
        # Define script code mappings between ISO codes and Aksharamukha codes
        self.script_code_map = {
            "Latn": "ISO", # ISO 15919 Latin
            "Deva": "Devanagari",
            "Beng": "Bengali",
            "Orya": "Oriya",
            "Gujr": "Gujarati",
            "Knda": "Kannada",
            "Telu": "Telugu",
            "Cyrl": "RussianCyrillic",
            "Mlym": "Malayalam",
            "Taml": "Tamil",
            # Add more mappings as needed
        }

    def transliterate(self, text: str, from_script: str, to_script: str) -> str:
        """
        Transliterate text from one script to another using Aksharamukha.

        Args:
            text: The text to transliterate
            from_script: Source script code (ISO format)
            to_script: Target script code (ISO format)

        Returns:
            Transliterated text
        """
        # Map script codes to Aksharamukha format
        from_ak_script = self.script_code_map.get(from_script)
        to_ak_script = self.script_code_map.get(to_script)

        if from_ak_script and to_ak_script:
            try:
                # Use Aksharamukha for general transliteration
                result = ak_trans.process(from_ak_script, to_ak_script, text)

                # Special handling for Bengali numerals in verse markers
                if "॥" in result:
                    # Find pattern like ॥১॥ and replace Bengali digits with target script digits
                    import re
                    pattern = r"॥([০-৯]+)॥"

                    def replace_numerals(match):
                        beng_num = match.group(1)
                        target_num = beng_num

                        return f"॥{target_num}॥"

                    result = re.sub(pattern, replace_numerals, result)

                return result
            except Exception as e:
                # If there's an error, return a placeholder with the error
                return f"[Error transliterating to {to_script}: {str(e)}]"
        else:
            # For script codes not mapped, return a placeholder
            return f"[{to_script}]{text}[/{to_script}]"


class ScriptGenerator:
    """Generates transliterations in various scripts from ISO 15919 Latin text."""

    def __init__(self):
        """Initialize the script generator."""
        # TODO: Put this in a config file and also as a command line argument and parameter
        # Target script codes to generate
        self.target_scripts = [
            {"script_code": "Deva", "name": "Devanagari"},
            {"script_code": "Beng", "name": "Bengali"},
            {"script_code": "Orya", "name": "Oriya"},
            {"script_code": "Gujr", "name": "Gujarati"},
            {"script_code": "Latn", "standard": "IAST", "name": "IAST Latin"},
            {"script_code": "Knda", "name": "Kannada"},
            {"script_code": "Telu", "name": "Telugu"},
            {"script_code": "Cyrl", "name": "RussianCyrillic"},
            {"script_code": "Mlym", "name": "Malayalam"},
            {"script_code": "Taml", "name": "Tamil"},
        ]

        # Initialize Aksharamukha transliterator
        self.aksharamukha = AksharamukhaTransliterator()

        # TODO: find a package that does this bewteen scripts
        # Map script codes back to word-to-word language codes
        # (so we know which entries to re-emit in each script)
        self.script_to_language = {
            "Latn": "eng",
            "Deva":  "hin",
            "Beng":  "ben",
            "Gujr":  "guj"
        }

        # TODO: Put this in a config file and also as a command line argument and parameter
        # Post-processing rules for different Latin standards
        self.latin_standards = {
            "BBT_Roman": {
                "ḓ": "ḍ",
            },
            "GVP_Roman": {
            }
        }
    
    def generate_scripts(self, iso_song: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate transliterations in various scripts based on the ISO Latin source.

        Args:
            iso_song: Song data with ISO Latin source text

        Returns:
            Song data with transliterations in various scripts
        """
        # Create a deep copy to avoid modifying the input
        result_song = iso_song.copy()

        # Process each verse
        for verse in result_song["verses"]:
            iso_lines = verse.get("source_text_master", [])

            # Create display_scripts array if it doesn't exist
            if "display_scripts" not in verse:
                verse["display_scripts"] = []

            # Generate each target script
            for script_info in self.target_scripts:
                script_code = script_info["script_code"]

                # Skip generating ISO Latin source again if it's already there
                if script_code == "Latn" and "standard" in script_info and script_info["standard"] == "IAST":
                    # Clean up source text by replacing Bengali characters with Latin equivalents
                    # The _clean_flags method now calls _clean_single_line which includes full Bengali character replacement
                    cleaned_latin_lines = self._clean_flags(iso_lines)

                    verse["display_scripts"].append({
                        "script_code": script_code,
                        "standard": script_info.get("standard"),
                        "text": cleaned_latin_lines
                    })
                    continue

                # For other scripts, generate transliteration following the pipeline diagram:
                # 1. Pre-processing (for Aksharamukha)
                # 2. Aksharamukha conversion
                # 3. Post-processing
                transliterated_lines = []
                for line in iso_lines:
                    # Step 1: Pre-processing for Aksharamukha
                    preprocessed_line = self._preprocess_for_script(line, script_code)

                    # Step 2: Aksharamukha conversion
                    transliterated_line = self._transliterate_to_script(preprocessed_line, "Latn", script_code)

                    # Step 3: Post-processing
                    postprocessed_line = self._postprocess_for_script(transliterated_line, script_code)

                    transliterated_lines.append(postprocessed_line)

                verse["display_scripts"].append({
                    "script_code": script_code,
                    "standard": script_info.get("standard"),
                    "text": transliterated_lines
                })

            # Also generate additional Latin standards (BBT, GVP)
            for standard, mappings in self.latin_standards.items():
                latin_lines = []
                for line in iso_lines:
                    # Start with IAST (but remove flags)
                    clean_line = self._clean_single_line(line)

                    # The _clean_single_line method now includes full Bengali character replacement
                    # No need for additional replacements here

                    # Apply standard-specific mappings
                    mapped_line = self._apply_mapping_to_line(clean_line, mappings)
                    latin_lines.append(mapped_line)

                verse["display_scripts"].append({
                    "script_code": "Latn",
                    "standard": standard,
                    "text": latin_lines
                })

        for verse in result_song.get("verses", []):
            w2w = verse.get("word_to_words", [])
            # find your IAST/Latn entry
            latn = next((e for e in w2w if e.get("script_code") == "Latn"), None)
            if not latn:
                continue
            # for each other script, only if it doesn't already exist
            for script_code, lang in self.script_to_language.items():
                if script_code == "Latn":
                    continue
                if any(e.get("script_code") == script_code for e in w2w):
                    continue
                # transliterate each Latin word exactly as‐is
                new_words: List[Tuple[str, str]] = []
                for word, translation in latn["words"]:
                    if all(not c.isalpha() for c in word):
                        new_words.append((word, translation))
                    else:
                        tr = self.aksharamukha.transliterate(word, "Latn", script_code)
                        new_words.append((tr, translation))
                w2w.append({
                    "language_code": lang,
                    "script_code":  script_code,
                    "standard":     None,
                    "words":        new_words
                })

        return result_song
    
    def _preprocess_for_script(self, iso_line: str, script_code: str) -> str:
        """
        Apply preprocessing to ISO line before Aksharamukha conversion.

        Args:
            iso_line: Line in ISO Latin format
            script_code: Target script code

        Returns:
            Preprocessed line
        """
        # Apply step 1 of the pipeline: conditionally process "ẏ"
        if script_code not in ["Beng", "Orya"]:
            iso_line = iso_line.replace("ẏ", "y")

        # Handle pullback flags
        iso_line = iso_line.replace(FLAG_PULLBACK, "")

        # Handle hyphen flags based on target script
        if script_code == "Latn":
            # For Latin, keep hyphens
            iso_line = iso_line.replace(FLAG_HYPHEN_ALPHA, "-")
        else:
            # For Indic scripts, remove hyphens
            iso_line = iso_line.replace(FLAG_HYPHEN_ALPHA, "")

        # Handle dropped vowel flags
        iso_line = iso_line.replace(FLAG_DROPPED_VOWEL_BENG, "")

        return iso_line
    
    def _transliterate_to_script(self, preprocessed_line: str, from_script: str, to_script: str) -> str:
        """
        Transliterate preprocessed line to the target script using Aksharamukha.
        
        Args:
            preprocessed_line: Preprocessed line in ISO Latin
            from_script: Source script code
            to_script: Target script code
            
        Returns:
            Transliterated line in target script
        """
        # Call Aksharamukha transliterator
        return self.aksharamukha.transliterate(preprocessed_line, from_script, to_script)
    
    def _postprocess_for_script(self, transliterated_line: str, script_code: str) -> str:
        """
        Apply post-processing to transliterated line.
        
        Args:
            transliterated_line: Line after Aksharamukha conversion
            script_code: Target script code
            
        Returns:
            Post-processed line
        """
        # This would handle the post-processing logic from step 3 of the pipeline
        # For now, just return the transliterated line
        return transliterated_line
    
    def _clean_flags(self, iso_lines) -> Union[str, List[str]]:
        """
        Remove all flags from ISO Latin lines.

        Args:
            iso_lines: Line or list of lines with flags

        Returns:
            Clean line(s) without flags
        """
        if isinstance(iso_lines, list):
            return [self._clean_single_line(line) for line in iso_lines]
        return self._clean_single_line(iso_lines)

    def _clean_single_line(self, line: str) -> str:
        """
        Clean flags from a single line and handle any Bengali characters in Latin text.

        Args:
            line: Line of text with flags

        Returns:
            Clean line without flags and with Bengali characters converted to Latin
        """
        result = line
        result = result.replace(FLAG_PULLBACK, "")
        result = result.replace(FLAG_HYPHEN_ALPHA, "-")
        result = result.replace(FLAG_DROPPED_VOWEL_BENG, "")

        return result

    def _apply_latin_standard(self, iast_line, mappings: Dict[str, str]):
        """
        Apply Latin standard-specific mappings to IAST line or lines.
        
        Args:
            iast_line: Line or list of lines in IAST format
            mappings: Mapping from IAST to target standard
            
        Returns:
            Line(s) in target Latin standard
        """
        if isinstance(iast_line, list):
            return [self._apply_mapping_to_line(line, mappings) for line in iast_line]
        return self._apply_mapping_to_line(iast_line, mappings)
    
    def _apply_mapping_to_line(self, line: str, mappings: Dict[str, str]) -> str:
        """Apply character mappings to a single line."""
        result = line
        for iast_char, standard_char in mappings.items():
            result = result.replace(iast_char, standard_char)
        return result