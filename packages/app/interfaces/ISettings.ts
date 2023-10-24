/**
 * FORMAT :
 *  - Keep 'ISettings' a flat list rather than a nested structure so that it's easy to
 *    update old settings that are in a different format than the latest format.
 *
 *  - Use 'null' instead of 'undefined' because 'undefined' is not a valid JSON value, and
 *    when saving to file using JSON.stringify(), it ignores keys with 'undefined' value.
 *
 * FORMAT UPDATE :
 *  - Source of truth for the settings format is the below 'ISettings' and not the old settings that are on user's file.
 *
 *  - Whenever the format changes (i.e, fields are added or deleted or default value is changed),
 *    Settings.init() automatically updates the saved settings with the new format.
 */

import { UserLanguage } from "./IUserLanguage";

export enum FontSize {
  default = 14,
  max = 24,
  min = 10
}

export default interface ISettings {
  dataVersion: string;
  collDataVersion: string;
  isDarkTheme: boolean;
  userLanguage: UserLanguage;
  // userMatha: UserMatha;
  lyricsShowScript: boolean;
  lyricsShowVerse: boolean;
  lyricsShowWordForWord: boolean;
  lyricsShowTranslation: boolean;
  lyricsFontSize: number;
  // downloadsSortBy: DownloadsSortBy;
  downloadsSortDesc: boolean;
}

export const defaultSettings: ISettings = {
  dataVersion: "0",
  collDataVersion: "0",
  isDarkTheme: true,
  userLanguage: UserLanguage.eng,
  // userMatha: "IPBYS",
  lyricsShowScript: true,
  lyricsShowVerse: true,
  lyricsShowWordForWord: true,
  lyricsShowTranslation: true,
  lyricsFontSize: FontSize.default,
  // downloadsSortBy: "modificationTime",
  downloadsSortDesc: true
};
