# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Python scripts: `python <script_name>.py`
- Run tests: `python -m unittest discover tests`
- Single test: `python -m unittest tests.test_<module>`
- Linting: `flake8 .`
- Type checking: `mypy .`

## Code Style Guidelines
- Follow PEP 8 for Python code
- Use type hints for all function parameters and return values
- Import order: standard library, third-party, local application
- Use snake_case for functions/variables, PascalCase for classes
- Error handling: use try/except with specific exceptions
- Use meaningful variable names that reflect transliteration concepts
- Document functions with docstrings in Google style format
- For transliteration code: include comments for complex Unicode operations

## Project Structure
- Create separate modules for different pipeline stages:
  - parsing (old JSON → internal format)
  - flagging (handling special characters and markers)
  - transliteration (convert between scripts)
  - output (internal format → new JSON)
- When processing song files, use batch operations where possible