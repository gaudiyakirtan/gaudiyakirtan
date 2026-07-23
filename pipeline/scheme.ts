// --- Core Language and Script Identifiers ---
type ISO639_3_Code = string; // e.g., "eng", "ben", "hin", "san"
type ISO15924_ScriptCode = string; // e.g., "Latn", "Deva", "Beng"
type TransliterationStandard = "IAST" | "BBT_Roman" | "GVP_Roman" | "Simple_Roman_Eng" | string;
type TranslationStandard = "BBT_English_Translation" | "GVP_English_Translation" | string;

// --- Reusable Scripted Text Structures (for transliterations or original script displays) ---
interface ScriptedText {
  script_code: ISO15924_ScriptCode;
  standard?: TransliterationStandard; // Optional, mainly for "Latn" script
  text: string;
  language_code?: ISO639_3_Code; // Optional: if this specific display is a conceptual translation of a name/title
}

// --- Reusable Language-Specific Text Structures (for pure translations like notes, topic descriptions) ---
interface LanguageSpecificText {
  language_code: ISO639_3_Code;
  text: string;
}

// --- Topic Schema ---
interface TopicInstance {
  uid: string; // UID for the topic, e.g., "bhakti_topic", "saranagati_topic"
  display_names: ScriptedText[]; // How the topic name is rendered in various scripts/languages
                                 // e.g., [{script_code: "Latn", standard: "IAST", text: "Bhakti"},
                                 //       {language_code: "eng", script_code: "Latn", text: "Devotion"}]
}

// --- Audio Schemas ---
interface AudioFile {
  uid: string;
  filename: string;
  artist_code?: string; // Links to a separate global artist entity
  artist_display?: ScriptedText[]; // Display names for the artist for this specific track
  duration_seconds?: number;
  source_info?: string;
  quality_notes?: string;
}

// --- Metadata Schemas ---
interface SourceInfoText { // For source_title, source_author
  language_code: ISO639_3_Code; // The language of the source
  script_code: ISO15924_ScriptCode; // The script of the source
  text: string;
}

interface MeterInfo {
  uid: string; // UID for the meter, e.g., "payar_meter", "tripadi_meter"
  name_scripted?: ScriptedText[]; // Name of the meter in various scripts/transliterations
}

interface PublicationInfo {
  book_title_scripted?: ScriptedText[]; // Book title in various scripts/transliterations
  edition?: string;
  page_number?: string;
}

// --- Verse-Specific Schemas ---
interface DisplayScriptVerse { // For verse.display_scripts
  script_code: ISO15924_ScriptCode;
  standard?: TransliterationStandard;
  text: string[]; // Array of lines
}

interface WordToWordEntry { // For verse.word_to_words
  language_code: ISO639_3_Code; // Language of the meanings/synonyms
  source_word_script_code: ISO15924_ScriptCode; // Script in which source words are displayed for this W2W entry
  source_word_standard?: TransliterationStandard; // Standard for the displayed source words
  words: [string, string][]; // Array of [source_word_segment, meaning_in_target_language]
}

interface VerseTranslation { // For verse.translations
  language_code: ISO639_3_Code; // Target language of the translation
  standard?: TranslationStandard;
  translator_uid?: string; // Links to a translator entity
  text: string[]; // Array of lines
}

interface Verse {
  verse_number?: number;
  source_text_master: string[]; // Array of lines (Flagged ISO 15919 Latin)
  display_scripts?: DisplayScriptVerse[];
  word_to_words?: WordToWordEntry[];
  translations?: VerseTranslation[];
}

// --- Main Song Schema ---
interface Song {
  uid: string;
  language_of_origin: ISO639_3_Code;

  title_main: ScriptedText[];
  source_title?: SourceInfoText;

  author_uid?: string; // Links to a global author entity
  author_display?: ScriptedText[];
  source_author?: SourceInfoText;

  topics?: TopicInstance[]; // Array of topic instances associated with the song

  audio_available?: boolean;
  audio_files?: AudioFile[];

  related_songs_uids?: string[]; // Links to other song UIDs
  meter_info?: MeterInfo; // Links to a global meter entity via UID
  publication_info?: PublicationInfo;
  notes?: LanguageSpecificText[]; // Language-specific notes (translations/explanations)

  verses: Verse[];
}