import { UserLanguage } from './../../interfaces/IUserLanguage';
import transliterate from "./transliterator";
// import Settings from "app/utils/settings/Settings";

import Authors from "../../interfaces/IAuthors";

export default class DataTransform {
  public static transformSongTitle(titleFrombackend: string, language: string, userLanguage: string): string {
    if (!titleFrombackend) {
      return "Error parsing title :/";
    }
    const titleSplit = titleFrombackend.split(" ~ "); // english overrides
    const ROMAN =
      userLanguage === UserLanguage.eng ||
      userLanguage === UserLanguage.rus ||
      userLanguage === UserLanguage.spa ||
      userLanguage === UserLanguage.ger;
    const tl = ROMAN ? titleSplit.length - 1 : 0;

    let title = "";
    title = transliterate(titleSplit[tl], language, userLanguage);
    title = DataTransform.capitalizeWords(title);

    if (tl > 0 && !Number.isNaN(Number(titleSplit[0].substr(0, 4)))) {
      title = titleSplit[0].substr(0, 4) + title;
    }

    title = title.replace(/^(\d{0,4})(‘|\(){0,1}(.)/, (_m, a, b, c) => {
      return (a || "") + (b || "") + c.toUpperCase();
    });

    return title;
  }

  public static transformAuthor(authorCodeFrombackend: string, language: string, userLanguage: string): string {
    const authorName = Authors[authorCodeFrombackend] || authorCodeFrombackend;

    const authorSplit = authorName.split(" ~ ");
    const ROMAN =
      userLanguage === UserLanguage.eng ||
      userLanguage === UserLanguage.rus ||
      userLanguage === UserLanguage.spa ||
      userLanguage === UserLanguage.ger;
    const al = ROMAN ? authorSplit.length - 1 : 0;

    let author = "";
    author = transliterate(authorSplit[al], language, userLanguage);
    author = DataTransform.capitalizeWords(author);

    return author;
  }

  public static transformContent(content: string, language: string, userLanguage: string): string {
    return transliterate(content, language, userLanguage).replace("@ ", "");
  }

  public static transformMatha(titleOrFounder: string, userLanguage: string): string {
    return DataTransform.capitalizeWords(transliterate(titleOrFounder, "ben", userLanguage));
  }

  // https://stackoverflow.com/a/51874002/4951344
  public static deaccent(accentedStr: string): string {
    return accentedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Don't use lodash.startCase() or CSS capitalize as they break words on special characters like hyphens
  private static capitalizeWords(str: string): string {
    return str.replace(/(?:^|\s)\S/g, word => word.toUpperCase());
  }
}
