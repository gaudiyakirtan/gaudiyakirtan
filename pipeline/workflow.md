**I. Core Goal: Establish a Clean, Lossless, and Editable Source Text**

The primary challenge is the current source data format and the inconsistencies observed. The team aims to create a new, reliable "master source" for all songs.

**II. Source Text Schema & Transliteration Pipeline (Key Decisions & Discussions)**

1.  **Master Source Format:**
    *   **Decision:** Shift from "flagged Bengali" to **flagged ISO 15919 Latin** as the primary internal source text.
        *   Reason: Lossless, can accurately represent all necessary phonetic distinctions.
        *   This will be the *editable* source.
    *   All existing songs (from current app JSON and Madhukar's new additions) will need to be converted/input into this format.

2.  **Flagging in the ISO Latin Source:** Madhukar will be primarily responsible for this.
    *   **Consonant Conjuncts / Line Breaks ("Pullback" Cases):**
        *   A special marker/flag will be used in the ISO Latin source to indicate where a consonant (e.g., 'r') from the beginning of a line needs to be "pulled back" to the end of the previous line for correct rendering in Indic scripts (and proper hyphenation in Roman).
        *   Example: `samasta-śāstrai- [FLAG] ruktas` would ensure the 'r' in 'ruktas' joins 'śāstrair'.
    *   **Hyphenation for Alphabets (Roman/Latin output):**
        *   Special markers/flags for hyphens that should *only* appear in Roman/Latin alphabet outputs (and be ignored for Indic script rendering).
        *   AI might assist Madhukar by suggesting hyphen placements, which he will then review/correct.
    *   **Dropped Inherent Vowels (Bengali Pronunciation):**
        *   Manual flagging for special cases where inherent vowels are dropped or their pronunciation shifts in Bengali (e.g., *tomra*, *majani*). This cannot be easily solved algorithmically for all cases.
    *   **B/V and J/Y Distinctions:**
        *   The ISO Latin source will explicitly use 'v' and 'b', and 'j' and 'y' as distinct characters where phonetically appropriate.
        *   The Asamese Bengali characters (ৱ for 'va', য় for 'ya') can be used in an intermediate Bengali step if helpful for Madhukar, before converting to the final ISO Latin source.

3.  **Conversion Process (from flagged ISO Latin source to display formats):**
    *   **Step 1: Pre-processing for Aksharamukha (Conditional):**
        *   `IF output_script IS NOT Bengali AND output_script IS NOT Oriya THEN`
            *   `Convert all instances of "ẏ" (y with dot above) in the ISO Latin source to "y" (plain y).`
        *   `ELSE (output is Bengali or Oriya)`
            *   `No change to "ẏ".`
    *   **Step 2: Aksharamukha Conversion:**
        *   Run the (potentially pre-processed) flagged ISO Latin source through the Aksharamukha library to convert to the target display script (e.g., Devanagari, Bengali, other Indic, Cyrillic, specific Latin standards).
        *   Aksharamukha is expected to handle the Asamese 'va' (ৱ) and 'ya' (য়) correctly if they are present in an intermediate Bengali representation used to generate the ISO source.
    *   **Step 3: Post-processing / Customization (Conditional):**
        *   Apply specific conversion rules *after* Aksharamukha for different desired Latin output standards (e.g., GVP, BBT). This involves a small table of character mappings (e.g., ISO 'ṛ' to GVP 'ṛ', ISO 'ṁ' to BBT 'ṁ/n', etc.). Chandra will work on this.
        *   Handle flagged "pullback" cases: remove the flag and move the designated consonant.
        *   Handle flagged "alphabet hyphens": render them if the output is a Latin script; ignore them if Indic.
    *   **Cyrillic:** Needs examples to be shown to Radhika to confirm the Aksharamukha output or if post-processing is needed.

**III. Data Management & Content Structure**

1.  **Moving Away from Complex JSON:**
    *   The current JSON structure (with 'W' for word, 'H' for concatenation/synonyms from Jago Paul's system) is deemed too complex and difficult to edit.
    *   **Decision:** The new primary source will be simpler, likely "raw text" per song (perhaps in a simpler JSON structure or Markdown, TBD), containing the flagged ISO Latin verses.
    *   This makes manual editing and flagging by Madhukar much easier.

2.  **Word-for-Word Synonyms & Translations:**
    *   **Decision:** AI (LLMs like GPT/Claude) will be used to generate:
        *   Initial word-for-word splits from the new ISO Latin source.
        *   Synonyms for these words.
        *   Initial translations into other languages (using existing English translations as a base when available).
    *   Madhukar will review and correct these AI-generated outputs.
    *   The goal is consistency and to save manual labor, especially for new songs and new languages.
    *   Different translation standards (e.g., BBT, GVP) will be maintained as options, potentially by guiding the AI with style guides or using specific existing translations as references.

3.  **Adding New Songs:**
    *   Madhukar has a significant number of new songs. These will be input directly into the new flagged ISO Latin format.

4.  **UIDs and Metadata:**
    *   Existing UIDs will be reused. A master list (`_list.json`) associating UIDs with titles and authors already exists and can be leveraged.

**IV. App Functionality & UI (Briefly Mentioned)**

*   **Display Settings:**
    *   "Verse Script": Allows user to choose the script for the main verse text (Source ISO, Devanagari, Bengali, etc.).
    *   "Language": Determines the language for translations and word-for-word transliterations (e.g., English, Russian). The transliteration *style* for Latin output will be tied to this (e.g., selecting English might default to IAST/BBT, selecting another standard might use GVP).
*   Search: Fuzzy search was demonstrated by Aditya. Further benchmarking planned.
*   App UI: Aditya showed mockups for homepage, library, topics, books, recent songs.

**V. Action Items & Next Steps (Content/Schema Focused):**

1.  **Madhukar & Chandra:**
    *   Prepare examples of Aksharamukha output for Russian Cyrillic (using the flagged ISO Latin source) to show Radhika for validation.
    *   Finalize the small table of post-Aksharamukha conversion rules for GVP and BBT Latin standards.
2.  **Madhukar:**
    *   Begin compiling/converting all existing and new song texts into the **flagged ISO 15919 Latin** format. This includes:
        *   Accurate B/V and J/Y distinctions.
        *   Flagging for "pullback" conjuncts.
        *   Flagging for "alphabet-only" hyphens.
        *   Flagging for dropped inherent vowels in Bengali.
    *   Provide Aditya with this "master source" text.
3.  **Aditya:**
    *   Investigate extracting the "most correct" current app output (which seems to handle 'v' better than the stored JSON) to potentially ease Madhukar's initial B/V conversion task for existing songs. *Fallback: Madhukar manually derives it.*
    *   Develop the pipeline: Flagged ISO Latin -> (Conditional Pre-processing for ẏ) -> Aksharamukha -> (Conditional Post-processing for Latin standards/flags).
    *   Implement AI-assisted generation of word-for-word splits, synonyms, and translations based on the new ISO Latin source.
    *   Determine the best simple format (JSON, Markdown) to store the new flagged ISO Latin source text per song.
4.  **Team:**
    *   Decide on the specific characters/syntax for the different types of flags in the ISO Latin source (pullbacks, alphabet-hyphens, dropped vowels).
    *   Discuss and benchmark search options (fuzzy, current GK search, semantic AI search).
