"""
Song Parser Module

Parses the old song JSON format into an intermediate representation
that can be processed by the rest of the pipeline.
"""
from typing import Dict, List, Any, Optional


class SongParser:
    """
    Parser for converting old song JSON format to intermediate representation.
    """
    
    def parse(self, old_song: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse old song format into intermediate representation.
        
        Args:
            old_song: Old song JSON data
            
        Returns:
            Dictionary with parsed song data in intermediate format
        """
        parsed_song = {
            "uid": old_song["uid"],
            "language_of_origin": old_song.get("language", "ben"),
            "title_main": self._parse_title(old_song), 
            "author_uid": old_song.get("author"),
            "author_display": self._parse_author_display(old_song),
            "verses": self._parse_verses(old_song)
        }
        
        # Optional fields
        if "notes" in old_song:
            parsed_song["notes"] = self._parse_notes(old_song["notes"])
            
        if "audio" in old_song and old_song["audio"]:
            parsed_song["audio_available"] = True
            parsed_song["audio_files"] = self._parse_audio(old_song["audio"])
        else:
            parsed_song["audio_available"] = False
            
        return parsed_song
    
    def _parse_title(self, old_song: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Parse the title from old format to new title_main format.
        
        Args:
            old_song: Old song data
            
        Returns:
            List of title objects in different scripts
        """
        return [
            {
                "script_code": "Beng",
                "text": old_song["title"]
            }
        ]
    
    def _parse_author_display(self, old_song: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Parse the author information.
        
        Args:
            old_song: Old song data
            
        Returns:
            List of author display objects in different scripts
        """
        author_map = {
            "bt": "শ্রীল ভক্তিৱিনোদ ঠাকুর",
            "ndt": "শ্রীল নরোত্তম দাস ঠাকুর",
            "ldt": "শ্রীল লোচন দাস ঠাকুর",
            "vct": "শ্রীল ৱিশ্ৱনাথ চক্রৱর্তী ঠাকুর",
            "vdt": "শ্রীল ৱৃন্দাৱন দাস ঠাকুর",
            "kkg": "শ্রীল কৃষ্ণদাস কৱিরাজ গোস্ৱামী",
            "bsst": "শ্রীল ভক্তিসিদ্ধান্ত সরস্ৱতী গোস্ৱামী প্রভুপাদ",
            "rg": "শ্রীল রূপ গোস্ৱামী",
            "rdg": "শ্রীল রঘুনাথ দাস গোস্ৱামী",
            "pdt": "শ্রীল প্রেমানন্দ দাস ঠাকুর",
            "?": "অজানা লেখক"
        }
        
        author_uid = old_song.get("author")
        if not author_uid or author_uid not in author_map:
            return []
        
        return [
            {
                "script_code": "Beng",
                "text": author_map[author_uid]
            }
        ]
    
    def _parse_verses(self, old_song: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse verses from old format to new format.

        Args:
            old_song: Old song data

        Returns:
            List of parsed verse objects
        """
        parsed_verses = []
        raw_verses = old_song.get("verses", [])

        for idx, verse_data in enumerate(raw_verses):
            lines_for_processing = verse_data.get("lines", [])

            parsed_verse = {
                "verse_number": idx + 1,
                "source_text_master": self._extract_verse_text(lines_for_processing)
            }

            # Add translation if available
            if "translation" in verse_data:
                translations = []
                for lang_code, trans_text in verse_data["translation"].items():
                    if trans_text and trans_text != "UNDEFINED":
                        translations.append({
                            "language_code": lang_code,
                            "text": [trans_text]
                        })
                if translations:
                    parsed_verse["translations"] = translations
            
            # Extract word-to-word translations from synonyms if has_synonyms is true
            if old_song.get("has_synonyms", False) and lines_for_processing:
                word_to_words = self._extract_word_to_word_translations(lines_for_processing)
                if word_to_words:
                    parsed_verse["word_to_words"] = word_to_words

            parsed_verses.append(parsed_verse)

        return parsed_verses

    def _extract_word_to_word_translations(self, lines: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Extract word-to-word translations from verse lines,
        handling lookaheads and overrides.

        Args:
            lines: List of lines with word objects.

        Returns:
            List of word-to-word translation objects for different languages.
        """
        raw_phrases_by_lang: Dict[str, List[tuple[List[Dict[str, Any]], str]]] = {}

        for line_data in lines:
            i = 0
            while i < len(line_data):
                current_word_obj = line_data[i]
                current_synonyms = current_word_obj.get("s", {})
                
                max_words_consumed_by_langs_at_i = 1 

                if not current_synonyms:
                    i += max_words_consumed_by_langs_at_i
                    continue

                for lang_code, meaning_text in current_synonyms.items():
                    if not meaning_text or meaning_text == "NULL" or meaning_text.startswith("⬅"):
                        continue

                    phrase_word_objects = [current_word_obj]
                    num_pulled_words_for_this_lang = 0
                    
                    if i + 1 < len(line_data):
                        next_word_obj = line_data[i+1]
                        if next_word_obj.get("s", {}).get(lang_code) == "⬅1":
                            phrase_word_objects.append(next_word_obj)
                            num_pulled_words_for_this_lang = 1
                            if i + 2 < len(line_data):
                                next_next_word_obj = line_data[i+2]
                                if next_next_word_obj.get("s", {}).get(lang_code) == "⬅2":
                                    phrase_word_objects.append(next_next_word_obj)
                                    num_pulled_words_for_this_lang = 2
                    
                    if lang_code not in raw_phrases_by_lang:
                        raw_phrases_by_lang[lang_code] = []
                    raw_phrases_by_lang[lang_code].append((phrase_word_objects, meaning_text))
                    
                    max_words_consumed_by_langs_at_i = max(max_words_consumed_by_langs_at_i, 1 + num_pulled_words_for_this_lang)
                
                i += max_words_consumed_by_langs_at_i

        result = []
        lang_to_script = {"eng": "Latn", "ben": "Beng", "hin": "Deva", "guj": "Gujr"} 
        latin_standard = {"eng": "IAST"} 

        for lang_code, phrase_meaning_list in raw_phrases_by_lang.items():
            if not phrase_meaning_list:
                continue

            script_code = lang_to_script.get(lang_code, "Latn") 
            entry: Dict[str, Any] = {
                "language_code": lang_code,
                "script_code": script_code,
                "words": []
            }
            if script_code == "Latn" and lang_code in latin_standard:
                entry["standard"] = latin_standard[lang_code]

            for phrase_objects, meaning in phrase_meaning_list:
                display_phrase_parts = []
                if lang_code == "eng":
                    for wo in phrase_objects:
                        bengali_word = wo.get("w", "")
                        override_eng = wo.get("o", {}).get("eng")
                        if override_eng:
                            display_phrase_parts.append(override_eng)
                        else:
                            display_phrase_parts.append(bengali_word)
                else:
                    for wo in phrase_objects:
                        display_phrase_parts.append(wo.get("w", ""))
                
                final_display_phrase = " ".join(part for part in display_phrase_parts if part)
                if final_display_phrase and meaning:
                     entry["words"].append([final_display_phrase, meaning])
            
            if entry["words"]:
                result.append(entry)

        return result
    
    def _extract_verse_text(self, lines: List[List[Dict[str, Any]]]) -> List[str]:
        """
        Extract plain text from verse lines.
        This method concatenates the 'w' (word) and 'h' (hint) fields
        from each word object in the lines.
        
        Args:
            lines: List of lines with word objects
            
        Returns:
            List of plain text lines
        """
        result = []
        
        for line in lines:
            line_text = ""
            for word_obj in line:
                word = word_obj.get("w", "")
                hint = word_obj.get("h", "")
                line_text += word + hint
            
            result.append(line_text.strip())
        return result
    
    def _parse_notes(self, notes: List[str]) -> List[Dict[str, str]]:
        """
        Parse notes into the new format.
        
        Args:
            notes: List of notes from old format
            
        Returns:
            List of notes in new format
        """
        return [
            {
                "language_code": "ben",
                "text": note
            }
            for note in notes
        ]
    
    def _parse_audio(self, audio_list: List[Any]) -> List[Dict[str, Any]]:
        """
        Parse audio entries into new format.
        
        Args:
            audio_list: List of audio entries from old format
            
        Returns:
            List of audio file objects in new format
        """
        result = []
        
        for idx, audio in enumerate(audio_list):
            audio_entry = {
                "uid": f"{audio.get('id', f'audio_{idx}')}",
                "filename": audio.get("filename", f"audio_{idx}.mp3")
            }
            
            if "artist" in audio:
                audio_entry["artist_code"] = audio["artist"]
                
            if "duration" in audio:
                audio_entry["duration_seconds"] = audio["duration"]
                
            result.append(audio_entry)
            
        return result