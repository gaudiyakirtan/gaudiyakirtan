export enum UserLanguage {
  eng = "eng",
  rus = "rus",
  spa = "spa",
  ger = "ger",
  ben = "ben",
  hin = "hin",
  odi = "odi",
  tel = "tel",
  kan = "kan",
  guj = "guj",
  pan = "pan",
  tam = "tam",
  mal = "mal"
}

export interface IUserLanguageInfo {
  englishTitle: string;
  nativeTitle: string;
  firstAlphabet: string;
}

// Languages appear in the order specified in the below object
export const UserLanguagesInfo: { [key in UserLanguage]: IUserLanguageInfo } = {
  // Most prominently used
  eng: {
    englishTitle: "English",
    nativeTitle: "English",
    firstAlphabet: "E"
  },
  rus: {
    englishTitle: "Russian",
    nativeTitle: "Pусский",
    firstAlphabet: "P"
  },
  spa: {
    englishTitle: "Spanish",
    nativeTitle: "Español",
    firstAlphabet: "S"
  },
  ger: {
    englishTitle: "German",
    nativeTitle: "Deutsch",
    firstAlphabet: "D"
  },
  ben: {
    englishTitle: "Bengali",
    nativeTitle: "বাংলা",
    firstAlphabet: "বা"
  },
  hin: {
    englishTitle: "Hindi",
    nativeTitle: "हिन्दी",
    firstAlphabet: "हि"
  },
  odi: {
    englishTitle: "Odia",
    nativeTitle: "ଓଡ଼ିଆ",
    firstAlphabet: "ଓ"
  },
  tel: {
    englishTitle: "Telugu",
    nativeTitle: "తెలుగు",
    firstAlphabet: "తె"
  },
  kan: {
    englishTitle: "Kannada",
    nativeTitle: "ಕನ್ನಡ",
    firstAlphabet: "ಕ"
  },
  guj: {
    englishTitle: "Gujarati",
    nativeTitle: "ગુજરાતી",
    firstAlphabet: "ગુ"
  },
  pan: {
    englishTitle: "Punjabi",
    nativeTitle: "ਪੰਜਾਬੀ",
    firstAlphabet: "ਪੰ"
  },
  tam: {
    englishTitle: "Tamil",
    nativeTitle: "தமிழ்",
    firstAlphabet: "த"
  },
  mal: {
    englishTitle: "Malayalam",
    nativeTitle: "മലയാളം",
    firstAlphabet: "മ"
  }
};

export function getLanguageTitle(userLanguage: UserLanguage): string {
  const langInfo = UserLanguagesInfo[userLanguage];
  if (!langInfo) {
    return "Unknown language";
  }
  const isEnglish = userLanguage === UserLanguage.eng;
  return langInfo.nativeTitle + (isEnglish ? "" : ` (${langInfo.englishTitle})`);
}
