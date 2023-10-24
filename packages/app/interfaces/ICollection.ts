import { ImageURISource } from "react-native";

import DataTransform from "../utils/transliteration/DataTransform";

export interface ICollection {
  type: "collection" | "song" | "heading";
  uid: string;
  title: string;
  imagePath?: ImageURISource;
  count?: number;
  children?: ICollection[];
}

export interface ICollections {
  children: ICollection[];
}

export function getCollectionUid(collection: ICollection): string | undefined {
  return collection.uid.split("@")[0];
}

export function getCollectionTitle(collection: ICollection): string {
  const title = collection.title.replace(/\s\[.+\]$/, ""); // remove [TEXT]
  return DataTransform.transformSongTitle(title, "ben");
}

export function getCollectionDescription(collection: ICollection): string {
  const description = collection.title.replace(/^.+\s\[(.+)\]$/, (_m: string, a: string) => {
    return a; // keep [TEXT]
  });
  return DataTransform.transformSongTitle(description, "ben");
}
