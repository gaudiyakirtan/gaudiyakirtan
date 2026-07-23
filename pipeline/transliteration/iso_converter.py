"""
ISO Converter Module

Converts Bengali text to ISO 15919 Latin format with the
appropriate flags for pullbacks, hyphens, and dropped vowels.
"""
import re
from typing import Dict, List, Any, Tuple

# Flag constants
FLAG_PULLBACK = "[FLAG_PULLBACK_A]"
FLAG_HYPHEN_ALPHA = "[FLAG_HYPHEN_ALPHA]"
FLAG_DROPPED_VOWEL_BENG = "[FLAG_DROPPED_VOWEL_BENG]"

class ISOConverter:
    """Converts Bengali text to ISO 15919 Latin format with flags."""
    
    def __init__(self):
        """Initialize the converter with character mapping tables."""
        # Initialize character mapping from Bengali to ISO 15919
        # Based on the TransliterationUtils.ts and transliterator.ts files
        self.bb_ind_vwl = ['অ','আ','ই','ঈ','উ','ঊ','ঋ','ৠ','ঌ','ৡ','এ','ঐ','ও','ঔ']
        self.bb_depend_vwl = ['া','ি','ী','ু','ূ','ৃ','ৄ','ৢ','ৣ','ে','ৈ','ো','ৌ']
        self.bb_con = ['ক','খ','গ','ঘ','ঙ','চ','ছ','জ','ঝ','ঞ','ট','ঠ','ড','ঢ','ণ','ড়','ঢ়','ত','থ','দ','ধ','ন','প','ফ','ব','ভ','ম','য','য়','র','ল','ৱ','শ','ষ','স','হ']
        # for independent‐vowel interpunct rule (অ + any consonant + ঁ)
        self.bb_interpuncterfy = ['অ'] + self.bb_con + ['ঁ']

        # Transliteration mappings from Bengali to ISO Latin
        # corrected nasalized‐independent vowels
        self.t_bb_ind_vwl_n = {'অঁ':'ã','আঁ':'ā̃','ইঁ':'ĩ','ঈঁ':'ī̃','উঁ':'ũ','ঊঁ':'ū̃','এঁ':'ẽ','ঐঁ':'aĩ','ওঁ':'õ','ঔঁ':'aũ'}
        self.t_bb_ind_vwl = {'অ':'a','আ':'ā','ই':'i','ঈ':'ī','উ':'u','ঊ':'ū','ঋ':'ṛ','ৠ':'ṝ','ঌ':'ḷ','ৡ':'ḹ','এ':'e','ঐ':'ai','ও':'o','ঔ':'au','ং':'ṁ','ঃ':'ḥ'}
        self.t_bb_dpd_vwl_n = {'াঁ':'ā̃','িঁ':'ĩ','ীঁ':'ī̃','ুঁ':'ũ','ূঁ':'ū̃','েঁ':'ẽ','ৈঁ':'aĩ','োঁ':'o','ৌঁ':'aũ'}
        self.t_bb_dpd_vwl = {'া':'ā','ি':'i','ী':'ī','ু':'u','ূ':'ū','ৃ':'ṛ','ৄ':'ṝ','ৢ':'ḷ','ৣ':'ḹ','ে':'e','ৈ':'ai','ো':'o','ৌ':'au'}
        
        self.t_bb_con = {
            'ক্':'k','কঁ':'kã','ক':'ka','খ্':'kh','খঁ':'khã','খ':'kha','গ্':'g','গঁ':'gã','গ':'ga','ঘ্':'gh','ঘঁ':'ghã','ঘ':'gha','ঙ্':'ṅ','ঙ':'ṅa',
            'চ্':'c','চঁ':'cã','চ':'ca','ছ্':'ch','ছঁ':'chã','ছ':'cha','জ্':'j','জঁ':'jã','জ':'ja','ঝ্':'jh','ঝঁ':'jhã','ঝ':'jha','ঞ্':'ñ','ঞ':'ña','জ্ঞ':'jña','জ্ঞ্':'jñ',
            'ত্':'t','তঁ':'tã','ত':'ta','থ্':'th','থঁ':'thã','থ':'tha','দ্':'d','দঁ':'dã','দ':'da','ধ্':'dh','ধঁ':'dhã','ধ':'dha','ন্':'n','নঁ':'nã','ন':'na','ৎ':'t',
            'ট্':'ṭ','টঁ':'ṭã','ট':'ṭa','ঠ্':'ṭh','ঠঁ':'ṭhã','ঠ':'ṭha','ড্':'ḍ','ডঁ':'ḍã','ড':'ḍa','ঢ্':'ḍh','ঢঁ':'ḍhã','ঢ':'ḍha','ণ্':'ṇ','ণ':'ṇa','ড়্':'ḓ','ড়ঁ':'ḓã','ড়':'ḓa','ঢ়্':'ḓh','ঢ়ঁ':'ḓhã','ঢ়':'ḓha',
            'প্':'p','পঁ':'pã','প':'pa','ফ্':'ph','ফঁ':'phã','ফ':'pha','ব্':'b','বঁ':'bã','ব':'ba','ভ্':'bh','ভঁ':'bhã','ভ':'bha','ম্':'m','মঁ':'mã','ম':'ma',
            'য্':'y','যঁ':'yã','য':'ya','য়্':'y','য়ঁ':'yã','য়':'ya','র্':'r','রঁ':'rã','র':'ra','ল্':'l','লঁ':'l ̌','ল':'la','ৱ্':'v','ৱঁ':'vã','ৱ':'va',
            'শ্':'ś','শঁ':'śã','শ':'śa','ষ্':'ṣ','ষঁ':'ṣã','ষ':'ṣa','স্':'s','সঁ':'sã','স':'sa','হ্':'h','হঁ':'hã','হ':'ha'
        }
        
        # Words with B/V distinctions
        self.bv_distinction_words = {
            'বাস': 'vāsa',  # residence
            'বিশ্ব': 'viśva',  # universe
            'বেদ': 'veda',  # scriptures
            'বৈষ্ণব': 'vaiṣṇava',  # devotee
        }
        
        # Words with J/Y distinctions
        self.jy_distinction_words = {
            'যাত্রা': 'yātrā',  # journey
            'যোগ': 'yoga',  # yoga
            'যজ্ঞ': 'yajña',  # sacrifice
        }
        
        # Words with common dropped vowels in Bengali
        self.dropped_vowel_words = [
            'করব',  # karba -> karb
            'চলব',  # calba -> calb
            'তোমরা',  # tomarā -> tomrā
        ]
        
        # Common pullback patterns - words ending with consonants that might need to be pulled to next line
        self.pullback_words = [
            'শাস্ত্র',  # śāstra (r might be pulled)
            'বন্ধ',  # bandha
            'অন্ত',  # anta
        ]
        
        # Regular expression for detecting hyphenation points
        self.hyphen_pattern = re.compile(r'([কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ])([কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ])')
        
        # digit mapping
        self.t_bb_num = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'}
    
    def convert(self, parsed_song: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert a parsed song to include ISO 15919 Latin text with flags.
        
        Args:
            parsed_song: Song data in intermediate format
            
        Returns:
            Song data with ISO Latin transliteration and flags
        """
        # Create a deep copy to avoid modifying the input
        iso_song = parsed_song.copy()
        
        # Process each verse
        for verse in iso_song["verses"]:
            bengali_lines = verse["source_text_master"]
            iso_lines = []
            
            for line in bengali_lines:
                iso_line = self._transliterate_line(line, iso_song["language_of_origin"])
                iso_lines.append(iso_line)

            # Replace Bengali source with ISO Latin source
            verse["source_text_master"] = iso_lines

            if "word_to_words" in verse:
                # Process word_to_words to transliterate Bengali words
                for word_dict in verse["word_to_words"]:
                    if "words" in word_dict:
                        for i, word_pair in enumerate(word_dict["words"]):
                            if len(word_pair) >= 1:
                                # Transliterate only the Bengali word (first item in each pair)
                                bengali_word = word_pair[0]
                                transliterated_word = self._transliterate_line(bengali_word, iso_song["language_of_origin"])
                                word_dict["words"][i][0] = transliterated_word
        
        # Also update the title with ISO Latin
        has_latin_title = False
        for title in iso_song["title_main"]:
            if title["script_code"] == "Latn" and title.get("standard") == "IAST":
                has_latin_title = True
                break
                
        if not has_latin_title and len(iso_song["title_main"]) > 0:
            for title in iso_song["title_main"]:
                if title["script_code"] == "Beng":
                    # Add ISO Latin version
                    iso_song["title_main"].append({
                        "script_code": "Latn",
                        "standard": "IAST",
                        "text": self._transliterate_line(title["text"], iso_song["language_of_origin"]),
                    })
                    break
        
        return iso_song
    
    def _transliterate_line(self, bengali_line: str, lang:str) -> str:
        """
        Transliterate a line of Bengali text to ISO 15919 Latin with flags.
        
        Args:
            bengali_line: Line of Bengali text
            
        Returns:
            Transliterated line in ISO Latin with flags
        """
        return self._apply_flags(transliterate(bengali_line, lang)).strip()
        
        
        # Implementation based on the transBenRom function in transliterator.ts
        
        # First, prepare the line by handling special regex patterns
        bb_interpuncterfy = '|'.join(['অ'] + self.bb_con + ['ঁ'])
        regex_a = re.compile(f"({'|'.join(self.bb_interpuncterfy)})(ই|উ)")
        
        # Handle interpunct
        bengali_line = regex_a.sub(r'\1·\2', bengali_line)
        
        # Apply character mappings
        result = bengali_line
        
        # Apply nasalized vowels first
        for key, value in self.t_bb_ind_vwl_n.items():
            result = result.replace(key, value)
            
        # Apply independent vowels
        for key, value in self.t_bb_ind_vwl.items():
            result = result.replace(key, value)
        
        # Process dependent vowels with consonants
        regex_b = re.compile(f"({'|'.join(self.bb_con)})(({'|'.join(self.bb_depend_vwl)}))")
        result = regex_b.sub(r'\1্\2', result)
        
        # Apply nasalized dependent vowels
        for key, value in self.t_bb_dpd_vwl_n.items():
            result = result.replace(key, value)
            
        # Apply dependent vowels
        for key, value in self.t_bb_dpd_vwl.items():
            result = result.replace(key, value)
            
        # Apply consonants
        for key, value in self.t_bb_con.items():
            result = result.replace(key, value)
        
        # RIGHT‐SINGLE‐QUOTE apostrophe
        result = result.replace('ঽ', '’')

        # final “y” → “ẏ” cluster rule
        result = re.sub(r'([kgṅcjñṭḍṇtdnpbmyrlśṣsh])(y)', r'\1ẏ', result)

        # Bengali digits → ASCII
        for bdig, adag in self.t_bb_num.items():
            result = result.replace(bdig, adag)

        # TS‐style post‐cleanup chain
        for old, new in [
            ('rtt','rt'),('rmm','rm'),('rbb','rb'),('rvv','rv'),
            ('rdd','rd'),('rkk','rk'),('rjj','rj'),('ryy','ry'),
            ('rẏy','rẏ'),('jĩ','jñī'),('jyā','jñā')
        ]:
            result = result.replace(old, new)

        # Apply flags
        result = self._apply_flags(result)
        
        return result
    
    def _apply_flags(self, iso_line: str) -> str:
        """
        Apply flags to ISO Latin line.
        
        Args:
            iso_line: Line in ISO Latin
            
        Returns:
            Line with flags added
        """
        # 1. Pullback flags
        for word in self.pullback_words:
            # This is simplified - in real case this would be more complex
            # to detect actual positions where pullbacks need to happen
            if word in iso_line:
                position = iso_line.find(word) + len(word)
                if position < len(iso_line):
                    iso_line = iso_line[:position] + FLAG_PULLBACK + iso_line[position:]
        
        # 2. Hyphen flags
        # Look for existing hyphens and replace with flagged hyphens
        iso_line = iso_line.replace('-', FLAG_HYPHEN_ALPHA)
        
        # 3. Dropped vowel flags
        for word in self.dropped_vowel_words:
            if word in iso_line:
                position = iso_line.find(word) + len(word)
                iso_line = iso_line[:position] + FLAG_DROPPED_VOWEL_BENG + iso_line[position:]
        
        return iso_line

import re

# BEN-ROM TRANSLITERATION SECTION --
# transliterate bengali song written in bangla to roman

bb_ind_vwl = ['অ','আ','ই','ঈ','উ','ঊ','ঋ','ৠ','ঌ','ৡ','এ','ঐ','ও','ঔ']
bb_depend_vwl = ['া','ি','ী','ু','ূ','ৃ','ৄ','ৢ','ৣ','ে','ৈ','ো','ৌ']
bb_con = ['ক','খ','গ','ঘ','ঙ','চ','ছ','জ','ঝ','ঞ','ট','ঠ','ড','ঢ','ণ','ড়','ঢ়','ত','থ','দ','ধ','ন','প','ফ','ব','ভ','ম','য','য়','র','ল','ৱ','শ','ষ','স','হ']

bb_ind_vwl = "|".join(bb_ind_vwl)
bb_depend_vwl = "|".join(bb_depend_vwl)
bb_con = "|".join(bb_con)

bb_interpuncterfy = "|".join(['অ'] + bb_con.split('|') + ['ঁ'])

t_bb_ind_vwl_n = {
    'অঁ':'ã','আঁ':'ā̃','ইঁ':'ĩ','ঈঁ':'ī̃','উঁ':'ũ',
    'ঊঁ':'ū̃','এঁ':'ẽ','ঐঁ':'aĩ','ওঁ':'õ','ঔঁ':'aũ'
}
t_bb_ind_vwl = {
    'অ':'a','আ':'ā','ই':'i','ঈ':'ī','উ':'u','ঊ':'ū',
    'ঋ':'ṛ','ৠ':'ṝ','ঌ':'ḷ','ৡ':'ḹ','এ':'e','ঐ':'ai',
    'ও':'o','ঔ':'au','ং':'ṁ','ঃ':'ḥ'
}
t_bb_dpd_vwl_n = {
    'াঁ':'ā̃','িঁ':'ĩ','ীঁ':'ī̃','ুঁ':'ũ','ূঁ':'ū̃',
    'েঁ':'ẽ','ৈঁ':'aĩ','োঁ':'o','ৌঁ':'aũ'
}
t_bb_dpd_vwl = {
    'া':'ā','ি':'i','ী':'ī','ু':'u','ূ':'ū','ৃ':'ṛ',
    'ৄ':'ṝ','ৢ':'ḷ','ৣ':'ḹ','ে':'e','ৈ':'ai','ো':'o','ৌ':'au'
}
t_bb_con = {
    'ক্':'k','কঁ':'kã','ক':'ka','খ্':'kh','খঁ':'khã','খ':'kha',
    'গ্':'g','গঁ':'gã','গ':'ga','ঘ্':'gh','ঘঁ':'ghã','ঘ':'gha',
    'ঙ্':'ṅ','ঙ':'ṅa','চ্':'c','চঁ':'cã','চ':'ca',
    'ছ্':'ch','ছঁ':'chã','ছ':'cha','জ্':'j','জঁ':'jã','জ':'ja',
    'ঝ্':'jh','ঝঁ':'jhã','ঝ':'jha','ঞ্':'ñ','ঞ':'ña',
    'জ্ঞ':'jña','জ্ঞ্':'jñ','ত্':'t','তঁ':'tã','ত':'ta',
    'থ্':'th','থঁ':'thã','থ':'tha','দ্':'d','দঁ':'dã','দ':'da',
    'ধ্':'dh','ধঁ':'dhã','ধ':'dha','ন্':'n','নঁ':'nã','ন':'na','ৎ':'t',
    'ট্':'ṭ','টঁ':'ṭã','ট':'ṭa','ঠ্':'ṭh','ঠঁ':'ṭhã','ঠ':'ṭha',
    'ড্':'ḍ','ডঁ':'ḍã','ড':'ḍa','ঢ্':'ḍh','ঢঁ':'ḍhã','ঢ':'ḍha',
    'ণ্':'ṇ','ণ':'ṇa','ড়্':'ḓ','ড়ঁ':'ḓã','ড়':'ḓa',
    'ঢ়্':'ḓh','ঢ়ঁ':'ḓhã','ঢ়':'ḓha','প্':'p','পঁ':'pã','প':'pa',
    'ফ্':'ph','ফঁ':'phã','ফ':'pha','ব্':'b','বঁ':'bã','ব':'ba',
    'ভ্':'bh','ভঁ':'bhã','ভ':'bha','ম্':'m','মঁ':'mã','ম':'ma',
    'য্':'y','যঁ':'yã','য':'ya','য়্':'y','য়ঁ':'yã','য়':'ya',
    'র্':'r','রঁ':'rã','র':'ra','ল্':'l','লঁ':'l ̌','ল':'la',
    'ৱ্':'v','ৱঁ':'vã','ৱ':'va','শ্':'ś','শঁ':'śã','শ':'śa',
    'ষ্':'ṣ','ষঁ':'ṣã','ষ':'ṣa','স্':'s','সঁ':'sã','স':'sa',
    'হ্':'h','হঁ':'hã','হ':'ha'
}
t_bb_num = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'}

def transBenRom(s: str) -> str:
    if not s:
        return ""
    regexA = re.compile(f"({bb_interpuncterfy})(ই|উ)")
    regexB = re.compile(f"({bb_con})({bb_depend_vwl})")
    regexC = re.compile(r'([kgṅcjñṭḍṇtdnpbmyrlśṣsh])(y)')
    s = regexA.sub(lambda m: f"{m.group(1)}·{m.group(2)}", s)
    for key, val in t_bb_ind_vwl_n.items():
        s = re.sub(re.escape(key), val, s)
    for key, val in t_bb_ind_vwl.items():
        s = re.sub(re.escape(key), val, s)
    s = regexB.sub(lambda m: f"{m.group(1)}্{m.group(2)}", s)
    for key, val in t_bb_dpd_vwl_n.items():
        s = re.sub(re.escape(key), val, s)
    for key, val in t_bb_dpd_vwl.items():
        s = re.sub(re.escape(key), val, s)
    for key, val in t_bb_con.items():
        s = re.sub(re.escape(key), val, s)
    s = s.replace('ঽ', '’')
    for key, val in t_bb_num.items():
        s = s.replace(key, val)
    return s

# BEN-INDIC TRANSLITERATION SECTION --
# transliterate from bangla --> TO INDIC SCRIPTS

t_ben = {}

t_ben['san'] = {}
t_ben['dev'] = {
    "অ":"अ","আ":"आ","ই":"इ","ঈ":"ई","উ":"उ","ঊ":"ऊ","ঋ":"ऋ","ৠ":"ॠ","ঌ":"ऌ","ৡ":"ॡ",
    "এ":"ए","ঐ":"ऐ","ও":"ओ","ঔ":"औ",
    "া":"ा","ি":"ि","ী":"ी","ু":"ु","ূ":"ू","ৃ":"ृ","ৄ":"ॄ","ৢ":"ॢ","ৣ":"ॣ",
    "ে":"े","ৈ":"ै","ো":"ो","ৌ":"ौ",
    "ং":"ं","ঃ":"ः","ঁ":"ँ","ঽ":"ऽ","্":"्",
    "ক":"क","খ":"ख","গ":"ग","ঘ":"घ","ঙ":"ङ",
    "চ":"च","ছ":"छ","জ":"ज","ঝ":"झ","ঞ":"ञ",
    "ত":"त","থ":"थ","দ":"द","ধ":"ध","ন":"न","ৎ":"त्",
    "ট":"ट","ঠ":"ठ","ড":"ड","ঢ":"ढ","ণ":"ण","ড়":"ड़","ঢ়":"ढ़",
    "প":"प","ফ":"फ","ব":"ब","ভ":"भ","ম":"म",
    "য":"य","য়":"य","র":"र","ল":"ल","ৱ":"व",
    "শ":"श","ষ":"ष","স":"स","হ":"ह",
    "০":"०","১":"१","২":"२","৩":"३","৪":"४","৫":"५","৬":"६","৭":"७","৮":"८","৯":"९"
}

t_ben['odi'] = {
    "অ":"ଅ","আ":"ଆ","ই":"ଇ","ঈ":"ଈ","উ":"ଉ","ঊ":"ଊ","ঋ":"ଋ","ৠ":"ୠ","ঌ":"ଌ","ৡ":"ୡ",
    "এ":"ଏ","ঐ":"ଐ","ও":"ଓ","ঔ":"ଔ",
    "া":"ା","ি":"ି","ী":"ୀ","ু":"ୁ","ূ":"ୂ","ৃ":"ୃ","ৄ":"ୄ","ৢ":"ୢ","ৣ":"ୣ",
    "ে":"େ","ৈ":"ୈ","ো":"ୋ","ৌ":"ୌ",
    "ং":"ଂ","ঃ":"ଃ","ঁ":"ଁ","ঽ":"ଽ","্":"୍",
    "ক":"କ","খ":"ଖ","গ":"ଗ","ঘ":"ଘ","ঙ":"ଙ",
    "চ":"ଚ","ছ":"ଛ","জ":"ଜ","ঝ":"ଝ","ঞ":"ଞ",
    "ত":"ତ","থ":"ଥ","দ":"ଦ","ধ":"ଧ","ন":"ନ","ৎ":"ତ୍",
    "ট":"ଟ","ঠ":"ଠ","ড":"ଡ","ঢ":"ଢ","ণ":"ଣ","ড়":"ଡ଼","ঢ়":"ଢ଼",
    "প":"ପ","ফ":"ଫ","ব":"ବ","ভ":"ଭ","ম":"ମ",
    "য":"ଯ","য়":"ୟ","র":"ର","ল":"ଲ","ৱ":"ବ",
    "শ":"ଶ","ষ":"ଷ","স":"ସ","হ":"ହ",
    "০":"୦","১":"୧","২":"୨","৩":"୩","৪":"୪","৫":"୫","৬":"୬","৭":"୭","৮":"୮","৯":"୯"
}

t_ben['kan'] = {
    "অ":"ಅ","আ":"ಆ","ই":"ಇ","ঈ":"ಈ","উ":"ಉ","ঊ":"ಊ","ঋ":"ಋ","ৠ":"ೠ","ঌ":"ೣ","ৡ":"ೣ",
    "এ":"ಏ","ঐ":"ಐ","ও":"ಓ","ঔ":"ಔ",
    "া":"ಾ","ি":"ಿ","ী":"ೀ","ু":"ು","ূ":"ೂ","ৃ":"ೃ","ৄ":"ೄ","ৢ":"ೢ","ৣ":"ೣ",
    "ে":"ೇ","ৈ":"ೈ","ো":"ೋ","ৌ":"ೌ",
    "ং":"ಂ","ঃ":"ಃ","ঁ":"ँ","ঽ":"ಽ","্":"್",
    "ক":"ಕ","খ":"ಖ","গ":"ಗ","ঘ":"ಘ","ঙ":"ಙ",
    "চ":"ಚ","ছ":"ಛ","জ":"ಜ","ঝ":"ಝ","ঞ":"ಞ",
    "ত":"ತ","থ":"ಥ","দ":"ದ","ধ":"ಧ","ন":"ನ","ৎ":"ತ್",
    "ট":"ಟ","ঠ":"ಠ","ড":"ಡ","ঢ":"ಢ","ণ":"ಣ","ড়":"ಡ","ঢ়":"ಢ",
    "প":"ಪ","ফ":"ಫ","ব":"ಬ","ভ":"ಭ","ম":"ಮ",
    "য":"ಯ","য়":"ಯ","র":"ರ","ল":"ಲ","ৱ":"ವ",
    "শ":"ಶ","ষ":"ಷ","স":"ಸ","হ":"ಹ",
    "০":"೦","১":"೧","২":"೨","৩":"೩","৪":"೪","৫":"೫","৬":"೬","৭":"೭","৮":"೮","৯":"೯"
}

t_ben['tel'] = {
    "অ":"అ","আ":"ఆ","ই":"ఇ","ঈ":"ఈ","উ":"ఉ","ঊ":"ఊ","ঋ":"ఋ","ৠ":"ౠ","ঌ":"ౡ","ৡ":"ౡ",
    "এ":"ఏ","ঐ":"ఐ","ও":"ఓ","ঔ":"ఔ",
    "া":"ా","ি":"ి","ী":"ీ","ু":"ు","ূ":"ూ","ৃ":"ృ","ৄ":"ౄ","ৢ":"ౢ","ৣ":"ౣ",
    "ে":"ే","ৈ":"ై","ো":"ో","ৌ":"ౌ",
    "ং":"ం","ঃ":"ః","ঁ":"ఁ","ঽ":"ఽ","্":"్",
    "ক":"క","খ":"ఖ","গ":"గ","ঘ":"ఘ","ঙ":"ఙ",
    "চ":"చ","ছ":"ఛ","জ":"జ","ঝ":"ఝ","ঞ":"ఞ",
    "ত":"త","থ":"థ","দ":"ద","ধ":"ధ","ন":"న","ৎ":"త్",
    "ট":"ట","ঠ":"ఠ","ড":"డ","ঢ":"ఢ","ণ":"ణ","ড়":"డ","ঢ়":"ఢ",
    "প":"ప","ফ":"ఫ","ব":"బ","ভ":"భ","ম":"మ",
    "য":"య","য়":"య","র":"ర","ল":"ల","ৱ":"వ",
    "শ":"శ","ষ":"ష","স":"స","হ":"హ",
    "০":"౦","১":"౧","২":"౨","৩":"౩","৪":"౪","৫":"౫","৬":"౬","৭":"౭","৮":"౮","৯":"౯"
}

t_ben['guj'] = {
    "অ":"અ","আ":"આ","ই":"ઇ","ঈ":"ઈ","উ":"ઉ","ঊ":"ઊ","ঋ":"ઋ","ৠ":"ૠ","ঌ":"ૣ","ৡ":"ૣ",
    "এ":"એ","ঐ":"ઐ","ও":"ઓ","ঔ":"ઔ",
    "া":"ા","ি":"િ","ী":"ી","ু":"ુ","ূ":"ૂ","ৃ":"ૃ","ৄ":"ૄ","ৢ":"ૢ","ৣ":"ૣ",
    "ে":"ે","ৈ":"ૈ","ো":"ો","ৌ":"ૌ",
    "ং":"ં","ঃ":"ઃ","ঁ":"ઁ","ঽ":"ઽ","্":"્",
    "ক":"ક","খ":"ખ","গ":"ગ","ঘ":"ઘ","ঙ":"ઙ",
    "চ":"ચ","ছ":"છ","জ":"જ","ঝ":"ઝ","ঞ":"ઞ",
    "ত":"ત","থ":"থ","দ":"দ","ধ":"ধ","ন":"ন","ৎ":"ત્",
    "ট":"ટ","ঠ":"ઠ","ড":"ડ","ঢ":"ઢ","ণ":"ણ","ড়":"ડ","ঢ়":"ઢ",
    "প":"પ","ফ":"ફ","ব":"ব","ভ":"ভ","ম":"ম",
    "য":"ય","য়":"ય","র":"ર","ল":"ল","ৱ":"વ",
    "শ":"શ","ষ":"ષ","স":"স","হ":"হ",
    "০":"૦","১":"૧","২":"૨","৩":"૩","৪":"૪","৫":"૫","৬":"૬","৭":"૭","৮":"૮","৯":"૯"
}

t_ben['pan'] = {
    "অ":"ਅ","আ":"ਆ","ই":"ਇ","ঈ":"ਈ","উ":"উ","ঊ":"ਊ","ঋ":"ਰਿ","ৠ":"ਰਿ","ঌ":"ਲ੍ਰरि","ৡ":"ਲ੍ਰरि",
    "এ":"ਏ","ঐ":"ਐ","ও":"ਓ","ঔ":"ਔ",
    "া":"ਾ","ি":"ਿ","ী":"ੀ","ু":"ੁ","ূ":"ੂ","ৃ":"੍ਰਿ","ৄ":"੍ਰਿ","ৢ":"੍ਲ੍ਰਰि","ৣ":"੍ਲ੍ਰरि",
    "ে":"ੇ","ৈ":"ੈ","ো":"ੋ","ৌ":"ੌ",
    "ং":"ਂ","ঃ":"ਃ","ঁ":"ँ","ঽ":"ऽ","্":"੍",
    "ক":"ਕ","খ":"ਖ","গ":"ਗ","ঘ":"ਘ","ঙ":"ਙ",
    "চ":"ਚ","ছ":"ਛ","জ":"ਜ","ঝ":"ਝ","ঞ":"ਞ",
    "ত":"ত","থ":"ਥ","দ":"ਦ","ধ":"ਧ","ন":"ন","ৎ":"त੍",
    "ট":"ট","ঠ":"ਠ","ড":"ড","ঢ":"ਢ","ণ":"ण","ড়":"ੜ","ঢ়":"ੜ",
    "প":"প","ফ":"ਫ","ব":"ਬ","ভ":"ਭ","ম":"ম",
    "য":"য","য়":"য","র":"ৰ","ল":"ল","ৱ":"ৱ",
    "শ":"শ","ষ":"শ","स":"س","হ":"হ",
    "০":"੦","১":"੧","২":"੨","৩":"੩","৪":"੪","৫":"੫","৬":"੬","৭":"੭","৮":"੮","৯":"੯"
}

t_ben['mal'] = {
    "অ":"അ","আ":"ആ","ই":"ഇ","ঈ":"ഈ","উ":"ഉ","ঊ":"ഉ","ঋ":"ഋ","ৠ":"ൠ","ঌ":"ൌ","ৡ":"ൌ",
    "এ":"ഏ","ঐ":"ഐ","ও":"ഓ","ঔ":"ഔ",
    "া":"ാ","ি":"ി","ী":"ീ","ু":"ു","ূ":"ൂ","ৃ":"ൃ","ৄ":"ൄ","ৢ":"ൢ","ৣ":"ൣ",
    "ে":"േ","ৈ":"ൈ","ো":"ോ","ৌ":"ൌ",
    "ং":"ം","ঃ":"ഃ","ঁ":"ं","ঽ":"ഽ","্":"്",
    "ক":"ക","খ":"খ","ਗ":"ਗ","ਘ":"ਘ","ঙ":"ङ",
    "চ":"ച","ছ":"छ","জ":"জ","ঝ":"ঝ","ঞ":"ഞ",
    "ত":"ത","থ":"థ","দ":"ദ","ध":"ध","ন":"ന","ৎ":"ත්",
    "ট":"ട","ঠ":"ഠ","ড":"ഡ","ঢ":"ಢ","ণ":"ണ","ড়":"ഡ","ঢ়":"ഢ",
    "প":"പ","ফ":"ഫ","ব":"ബ","ভ":"ഭ","ম":"മ",
    "য":"य","য়":"य","র":"র","ल":"ല","ৱ":"വ",
    "श":"श","ष":"ष","স":"स","ह":"ഹ",
    "০":"൦","১":"൧","२":"൨","৩":"൩","৪":"൪","৫":"൫","৬":"൬","৭":"൭","৮":"൮","৯":"൯"
}

t_ben['tam'] = {
    "অ":"அ","আ":"ஆ","ই":"இ","ঈ":"ఈ","উ":"உ","ঊ":"உ","ঋ":"রি","ৠ":"রি","ঌ":"ல்ரி","ৡ":"ல்ரি",
    "এ":"ஏ","ঐ":"ஐ","ও":"ஓ","ঔ":"ஔ",
    "া":"ா","ি":"ி","ী":"ீ","ু":"ு","ূ":"ூ","ৃ":" ்ரி","ৄ":" ்ரி","ৢ":" ்ல்ரி","ৣ":" ்ல்ரி",
    "ে":"ே","ৈ":"ை","ো":"ோ","ৌ":"ௌ",
    "ং":"ஂ","ঃ":"ஃ","ঁ":"ँ","ঽ":"ऽ","্":"்",
    "ক":"க","খ":"க","গ":"க","ঘ":"க","ঙ":"ங",
    "চ":"ச","ছ":"ச","জ":"ஜ","ঝ":"ச","ঞ":"ஞ",
    "ত":"த","থ":"த","দ":"த","ধ":"த","ন":"ந","ৎ":"த்",
    "ट":"ட","ठ":"ட","ड":"ட","ढ":"ட","ण":"ண","ড়":"र","ঢ়":"र",
    "प":"ப","फ":"ப","ব":"ப","ভ":"ப","ম":"ம",
    "য":"ய","য়":"ய","र":"ர","ल":"ல","ৱ":"व",
    "श":"ஷ","ष":"ஷ","স":"ஸ","হ":"ஹ",
    "০":"௦","১":"௧","২":"௨","৩":"௩","৪":"௪","৫":"௫","৬":"௬","৭":"௭","৮":"௮","৯":"௯"
}

def transBenIndic(s: str, script: str) -> str:
    return regexConvert(s, t_ben.get(script, {}))

# ROM-RUS TRANSLITERATION SECTION --
# transliterate roman -> TO RUSSIAN

t_rom_rus = {
    "i":"и","ī":"ӣ","u":"у","ū":"ӯ","ṛ":"р̣","ṝ":"р̣̄","ḷ":"лр̣","ḷ":"लр̣",
    "ai":"ай","o":"о","au":"ау",
    "ṁ":"м̇","ḥ":"х̣",
    "k":"к","g":"г","ṅ":"н̇",
    "c":"ч","j":"дж","ñ":"н̃",
    "t":"т","d":"д","n":"н",
    "ṭ":"т̣","ḍ":"д̣","ṇ":"н̣","ḓ":"д̣",
    "p":"п","b":"б","m":"м",
    "y":"й","r":"р","l":"л","v":"в",
    "ś":"ш́","ṣ":"ш","s":"с","h":"х",
    "^e":"э"
}

def transRomRus(s: str) -> str:
    return regexConvert(s, t_rom_rus)

# COMMON SECTION

def transliterate(str_in: str, songLang: str, targetLang: str="user") -> str:
    if not str_in:
        return ""
    userLanguage = "eng"
    if targetLang == "user":
        targetLang = userLanguage
    if targetLang == "ger":
        targetLang = "eng"
    if targetLang == "spa":
        targetLang = "eng"
    if targetLang == "hin":
        targetLang = "dev"
    if songLang == "hin":
        songLang = "dev"
    if songLang == "ori":
        songLang = "ben"
    if songLang == "asa":
        songLang = "ben"

    s = str_in
    if targetLang in ["eng", "rus", "spa", "ger"]:
        s = (s.replace('_', '-')
             .replace('•', ' ')
             .replace('॥', '')
             .replace('।', ''))
        # note: the JS also had a regex for ॥digits॥ → (digits)
        s = re.sub(r'॥([০১২৩৪৫৬৭৮৯]+)॥', lambda m: f"({m.group(1)})", s)
    elif songLang != "dev":
        s = s.replace('_', '').replace('•', '')

    if targetLang == "ben":
        s = s.replace('ৱ', 'ব')

    s = s.replace('ঞি', 'ইঁ')
    s = s.replace('ঞী', 'ইঁ')
    s = s.replace('ঞা', 'য়া')
    s = s.replace('ড়', 'ড়')
    s = s.replace('ঢ়', 'ঢ়')
    s = s.replace('য়', 'য়')
    s = s.replace('ব়', 'র')
    s = s.replace('ো', 'ো')
    s = s.replace('ৌ', 'ৌ')

    separators = " -!?,.()’~‘\"•_"
    output = ""
    word = ""
    z = len(s) - 1

    def transliterateWord():
        nonlocal word, output
        isIndicSong = songLang in t_ben
        isIndicTarget = targetLang in t_ben
        if songLang == "ben" and isIndicTarget:
            word = transBenIndic(word, targetLang)
        if songLang == "ben" and targetLang == "eng":
            word = transBenRom(word)
        if songLang == "ben" and targetLang == "rus":
            word = transRomRus(transBenRom(word))
        # devConvert not defined here; JS had it but we leave as no-op
        if songLang == "dev" and targetLang == "ben_convert":
            word = word
        if isIndicSong and targetLang == "ben":
            word = word
        if isIndicSong and isIndicTarget:
            word = transBenIndic(word, targetLang)
        if isIndicSong and targetLang == "eng":
            word = transBenRom(word)
        if isIndicSong and targetLang == "rus":
            word = transRomRus(transBenRom(word))

        # post-cleanup
        for old, new in [
            ("rtt","rt"),("rmm","rm"),("rbb","rb"),("rvv","rv"),
            ("rdd","rd"),("rkk","rk"),("rjj","rj"),("ryy","ry"),
            ("rẏy","rẏ"),("jĩ","jñī"),("jyā","jñā")
        ]:
            word = word.replace(old, new)
        output += word

    for idx, ch in enumerate(s):
        word += ch
        if ch in separators:
            fc = ch
            word = word[:-1]
            transliterateWord()
            output += fc
            word = ""
        elif idx == z:
            transliterateWord()
            word = ""

    return output

def regexConvert(s: str, hashTable: dict) -> str:
    if not s:
        return ""
    for rule, replaceWith in hashTable.items():
        s = re.sub(rule, replaceWith, s)
    # then per-char fallback
    return ''.join(hashTable.get(c, c) for c in s)