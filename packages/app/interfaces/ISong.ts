export interface IWord {
  w: string;
  h: string;
  s: { [language: string]: string };
  o: { [language: string]: string };
}

export type ILine = IWord[];

export interface IVerse {
  lines: ILine[];
  translation: { [language: string]: string };
}

export interface IAudio {
  uid: string;
  fn: string;
  meta: {
    artist?: string;
  };
}

export default interface ISong {
  uid: string;
  title: string;
  author: string;
  language: string;
  notes: string[];
  audio: IAudio[];
  has_synonyms: boolean;
  has_translations: boolean;
  legend: { [key in keyof IWord]: string };
  verses: IVerse[];
}

export function getArtistId(audioUid: string): string | undefined{
  return audioUid.split("-")[0];
}
