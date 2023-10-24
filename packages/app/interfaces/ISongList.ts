import { IAudio } from "./ISong";

export interface ISong {
  uid: string;
  md5: string;
  title: string;
  fuzzyTitle: string;
  fuzzyContent: string;
  author: string;
  language: string;
  audio: Array<IAudio>;
}

type ISongList = ISong[];
export default ISongList;
