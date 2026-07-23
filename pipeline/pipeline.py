#!/usr/bin/env python3
"""
Song Pipeline - Main script for converting song JSONs from old to new format.

The pipeline follows these main stages:
1. Parse old JSON format
2. Convert to ISO 15919 Latin with appropriate flags
3. Apply transliteration to various scripts
4. Generate word-to-word entries with Claude API (if enabled)
5. Output the new JSON format
"""
import argparse
import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Union

# Import modules for each pipeline stage
from parsers.song_parser import SongParser
from transliteration.iso_converter import ISOConverter
from transliteration.script_generator import ScriptGenerator

def setup_logging() -> None:
    """Configure logging for the pipeline."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler()]
    )


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Song JSON conversion pipeline")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Input JSON file or directory containing JSON files")
    parser.add_argument("--output", "-o", type=str, required=True,
                        help="Output directory for new format JSON files")
    parser.add_argument("--single", "-s", action="store_true",
                        help="Process a single file instead of a directory")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable verbose logging")

    # Add Claude API related arguments
    parser.add_argument("--use-claude", action="store_true",
                        help="Use Claude API to generate word-to-word translations")
    parser.add_argument("--claude-api-key", type=str,
                        help="API key for Claude. If not provided, looks for CLAUDE_API_KEY environment variable")
    parser.add_argument("--claude-model", type=str, default="claude-3-haiku-20240307",
                        help="Claude model to use (default: claude-3-haiku-20240307)")
    parser.add_argument("--target-languages", type=str, default="eng,hin,ben,guj",
                        help="Comma-separated list of target languages for translations (ISO 639-3 codes)")

    return parser.parse_args()


def process_song(input_path: str, output_dir: str, use_claude: bool = False,
                 claude_api_key: Optional[str] = None, claude_model: Optional[str] = None,
                 target_languages: Optional[List[str]] = None) -> None:
    """
    Process a single song file through the pipeline.

    Args:
        input_path: Path to the input JSON file
        output_dir: Directory to write the output JSON file
        use_claude: Whether to use Claude API for word-to-word translations
        claude_api_key: API key for Claude API
        claude_model: Claude model to use
        target_languages: List of target language codes for translations
    """
    logging.info(f"Processing song: {input_path}")

    # 1. Parse old JSON format
    with open(input_path, "r", encoding="utf-8") as f:
        old_song_data = json.load(f)

    song_parser = SongParser()
    parsed_song = song_parser.parse(old_song_data)

    # 2. Convert to ISO 15919 Latin with flags
    iso_converter = ISOConverter()
    iso_song = iso_converter.convert(parsed_song)

    # 3. Generate transliterations in various scripts
    script_generator = ScriptGenerator()
    transliterated_song = script_generator.generate_scripts(iso_song)

    # Generate output file path and write the song
    output_path = os.path.join(output_dir, os.path.basename(input_path))

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(transliterated_song, f, ensure_ascii=False, indent=2)

    logging.info(f"Successfully processed song: {input_path} -> {output_path}")


def process_directory(input_dir: str, output_dir: str, use_claude: bool = False,
                      claude_api_key: Optional[str] = None, claude_model: Optional[str] = None,
                      target_languages: Optional[List[str]] = None) -> None:
    """
    Process all song files in a directory.

    Args:
        input_dir: Directory containing input JSON files
        output_dir: Directory to write output JSON files
        use_claude: Whether to use Claude API for word-to-word translations
        claude_api_key: API key for Claude API
        claude_model: Claude model to use
        target_languages: List of target language codes for translations
    """
    input_path = Path(input_dir)
    json_files = list(input_path.glob("*.json"))

    logging.info(f"Found {len(json_files)} JSON files to process")

    for json_file in json_files:
        try:
            process_song(
                str(json_file),
                output_dir,
                use_claude=use_claude,
                claude_api_key=claude_api_key,
                claude_model=claude_model,
                target_languages=target_languages
            )
        except Exception as e:
            logging.error(f"Error processing {json_file}: {e}")


def main() -> None:
    """Main entry point for the pipeline."""
    args = parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Create output directory if it doesn't exist
    os.makedirs(args.output, exist_ok=True)

    # Parse target languages
    target_languages = args.target_languages.split(",") if args.target_languages else []

    # Log Claude API usage
    if args.use_claude:
        if CLAUDE_API_AVAILABLE:
            logging.info(f"Claude API enabled. Model: {args.claude_model}")
            logging.info(f"Target languages for translations: {', '.join(target_languages)}")
        else:
            logging.warning("Claude API requested but not available. Word-to-word translations will use placeholders.")

    if args.single:
        process_song(
            args.input,
            args.output,
            use_claude=args.use_claude,
            claude_api_key=args.claude_api_key,
            claude_model=args.claude_model,
            target_languages=target_languages
        )
    else:
        process_directory(
            args.input,
            args.output,
            use_claude=args.use_claude,
            claude_api_key=args.claude_api_key,
            claude_model=args.claude_model,
            target_languages=target_languages
        )


if __name__ == "__main__":
    setup_logging()
    main()