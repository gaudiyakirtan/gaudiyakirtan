# Gaudiya Kirtan Song Pipeline

This repository contains a pipeline for converting song data from the old JSON format to a new, standardized format based on ISO 15919 Latin transliteration as the master source.

> **Location & how to run.** This pipeline is vendored inside the monorepo at `pipeline/`. Run every
> script **from this directory** (`cd pipeline`) — they resolve the platform data dirs relative to
> here as `../web/src/data`, `../ios/gk-ios/Resources`, `../andorid/app/src/main/assets`, and stage a
> local copy under `converted/`. Upstream raw inputs (the Gīti-guccha PDF, the 2024 song-order docx)
> and media/cover provenance are documented in [`SOURCES.md`](./SOURCES.md). Use the shared venv at
> `~/workspace/.venv` (has Aksharamukha): `~/workspace/.venv/bin/python <script>.py`.

## Project Goals

1. Convert existing JSON song files to use ISO 15919 Latin as the master source format
2. Handle special flags for:
   - Pullback conjuncts at line breaks
   - Alphabet-only hyphens
   - Dropped inherent vowels in Bengali
   - B/V and J/Y distinctions
3. Generate transliterations in various scripts using Aksharamukha
4. Produce word-to-word entries and translations using Claude AI for missing translations
5. Fix mixed-script issues and word truncations in word-to-word translations

## Pipeline Diagram

```
Old JSON Format
     ↓
Parse to Intermediate Format (Converting legacy ⬅1 markers to flags)
     ↓
Convert to ISO 15919 Latin with Flags
     ↓
Fix Mixed Script Issues
     ↓
Generate Transliterations (multi-script)
     ↓
Fix Word Truncations in Word-to-Word Entries
     ↓
Fix Compound Word Markers and Punctuation Entries
     ↓
Generate Word-to-Word Entries (with Claude API support)
     ↓
Write to New JSON Format
```

## Directory Structure

- `parsers/`: Modules for parsing old JSON format
- `transliteration/`: Modules for ISO conversion, script generation, and Claude API integration
  - `mixed_script_fixes.py`: Fixes mixed-script issues (e.g., Bengali characters in Latin text)
  - `fix_word_truncation.py`: Fixes truncated words in word-to-word translations
- `output/`: Modules for writing the new JSON format
- `tests/`: Test cases
- `songs/`: Original song JSON files
- `converted/`: Output directory for converted song files

## Usage

### Basic Usage

To convert a single song file:

```
python pipeline.py --input songs/S27.json --output converted/ --single
```

To convert all songs in a directory:

```
python pipeline.py --input songs/ --output converted/
```

### Claude API Integration

The pipeline supports generating word-to-word translations using Anthropic's Claude AI. This is especially useful for songs that have missing or incomplete translations.

To enable Claude API integration:

```
python pipeline.py --input songs/ --output converted/ --use-claude --claude-api-key YOUR_API_KEY
```

You can also set the `CLAUDE_API_KEY` environment variable instead of passing it through the command line:

```
export CLAUDE_API_KEY=your_api_key_here
python pipeline.py --input songs/ --output converted/ --use-claude
```

#### Claude API Options

- `--use-claude`: Enable Claude API for word-to-word translations
- `--claude-api-key`: Specify your Claude API key (optional if set in environment)
- `--claude-model`: Specify the Claude model to use (default: "claude-3-haiku-20240307")
- `--target-languages`: Comma-separated list of target languages for translations using ISO 639-3 codes (default: "eng,hin,ben,guj")

Example with all options:

```
python pipeline.py --input songs/ --output converted/ --use-claude \
  --claude-model claude-3-sonnet-20240229 \
  --target-languages eng,hin,ben,guj,san
```

#### How Claude API Translation Works

The Claude AI integration:

1. Identifies verses that need word-to-word translations
2. Uses any existing translations as context to guide new translations
3. Maintains consistency across verses by reusing translations for repeated words
4. Generates translations for all target languages specified
5. Preserves existing translations while filling in missing ones

The translations use the meaning and context of the original text to provide accurate word-to-word meanings.

## Text Processing Features

### Mixed Script Fixes

The pipeline includes a specialized module for handling mixed-script issues, where Bengali characters appear in Latin text (e.g., "tuয়ā" instead of "tuyā").

Key features:
- Character-level replacement for Bengali characters in Latin text
- Special handling for verse markers with Bengali numerals (preserves "॥১॥" etc.)
- Word-level replacements for common problematic patterns
- Comprehensive mappings from Bengali to Latin characters

You can use this module directly in your code:

```python
from transliteration.mixed_script_fixes import MixedScriptFixer

fixer = MixedScriptFixer()
clean_text = fixer.fix_mixed_script_text("tuয়ā dhana")  # Returns "tuyā dhana"
```

### Word Truncation Fixing

The pipeline fixes truncated words in word-to-word translations by comparing them with words in the IAST display scripts. This addresses issues where words like "abhimān" should be "abhimāna".

Key features:
- Multi-strategy word matching algorithm:
  1. Exact matching (if the word already exists)
  2. Prefix matching (when a truncated word is a prefix of a full word)
  3. Common ending handling (e.g., adding 'a' to the end of consonant-ending words)
  4. Edit distance/similarity-based matching for complex cases
  5. Normalized matching (comparing without diacritics)
- Special handling for compound words with hyphens

You can use this module directly in your code:

```python
from transliteration.fix_word_truncation import find_best_match, fix_word_truncations

# Fix truncated words in a full song
fixed_song = fix_word_truncations(song_data)

# Or use the core matching function directly
best_match = find_best_match("abhimān", ["abhimāna", "gelā", "nāhi"])  # Returns "abhimāna"
```

### Compound Word Handling

The pipeline includes specialized handling for compound word markers (⬅1, ⬅2, etc.) in word-to-word translations. These markers are used in the original data to indicate that a word should be combined with the preceding word to form a compound.

Key features:
- Converts legacy pullback markers (⬅1, ⬅2) to structured flag notation ([FLAG_PULLBACK_A])
- Combines compound words in word-to-word translations (e.g., "harināma mahāmantra" instead of separate entries)
- Handles multi-word compounds (up to three words in sequence)
- Replaces punctuation entries with descriptive labels (e.g., "apostrophe" instead of "NULL")
- Special handling for empty string + punctuation combinations

This module works at two stages in the pipeline:
1. During parsing - converting ⬅1 markers to modern flag notation
2. After word truncation fixes - combining compound words and fixing punctuation entries

You can use this module directly in your code:

```python
from transliteration.word_compound_handler import fix_compound_words, handle_legacy_pullback_markers

# Fix compound words in a full song
fixed_song = fix_compound_words(song_data)

# Convert legacy pullback markers in source data
updated_lines = handle_legacy_pullback_markers(verse_lines)
```

## Dependencies

The pipeline requires the following Python packages:

- Python 3.7+
- `typing-extensions>=4.0.0`
- `pyyaml>=6.0`
- `requests>=2.27.0` (for API calls)
- `aksharamukha>=1.0.0` (for transliteration)
- `python-dotenv>=0.20.0` (for environment variables)

You can install all dependencies with:

```
pip install -r requirements.txt
```

## Development

To run tests:

```
python -m unittest discover tests
```

Or run specific test modules:

```
python -m unittest tests.test_fix_word_truncation
```

## License

(License information)