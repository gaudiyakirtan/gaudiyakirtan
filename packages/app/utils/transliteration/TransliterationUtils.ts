export default class TransliterationUtils {
  public static unDiac(s: string): string {
    // āḍḓẽḥīḷḹṁñṅṇõṛṝśṣṭūẏ
    return s
      .replace(/ã|ā̃|ā/g, "a")
      .replace(/ĩ|ī̃|ī/g, "i")
      .replace(/ũ|ū̃|ū/g, "u")

      .replace(/ẽ/g, "e")
      .replace(/õ/g, "o")

      .replace(/ṛ|ṝ/g, "r")
      .replace(/ḷ|ḹ/g, "l")

      .replace(/ḍ|ḓ|ɽ/g, "d")
      .replace(/ṅ|ṇ|ñ/g, "n")
      .replace(/ś|ṣ/g, "s")
      .replace(/ṁ/g, "m")
      .replace(/ḥ/g, "h")
      .replace(/ṭ/g, "t")
      .replace(/ẏ/g, "y")
      .replace(/·/g, "");
  }

  public static fuzzy(s: string): string {
    return (
      // guroh sri
      // guroḥsri
      // gurohsri
      TransliterationUtils.unDiac(s.replace(/(ḥ|h\W|h$)/g, ""))
        .replace(/\/|\\|-|!|,|\.|\(|\)|’|~|\?|‘/g, "") // unPunc
        .replace(/(.)\1/g, "$1") // deDble // thissis a doubble bubble wordd yes.
        .replace(/[0-9]/g, "")

        // similar
        .replace(/ia/g, "ya")
        .replace(/f/g, "ph")
        .replace(/w/g, "b")
        .replace(/v/g, "b")
        .replace(/r/g, "d")
        .replace(/y/g, "j")
        .replace(/o/g, "a")

        .replace(/(s|c|k|g|j|d|t|c|b|p)h/g, "$1") // deAspirate // kha gha jha dha tha cha bha pha => ka ga ...
        .replace(/n(k|g|c|j|t|d)/g, "$1") // deNasal // kandiya kandiya ==> kadiya kadiya
        .replace(/\s/g, "") // we waited to remove the spaces cuz denasal was too strong! => emon gaur

        .replace(/a|e|i|o|u/g, "") // deVowel
        .replace(/(.)\1/g, "$1") // deDble
        .replace(/n$/, "") // terminal n won't get any results!
    );
  }

  // these are more search utils than transliteration utils
  public static getScore(a: string, b: string): number {
    const str1 = TransliterationUtils.unDiac(a) // entry
      .replace(/(\s|\W)/g, "")
      .replace(/v/g, "b")
      .replace(/r/g, "d")
      .replace(/y/g, "j")
      .replace(/o/g, "a")
      .toLowerCase();

    const str2 = TransliterationUtils.unDiac(b) // searchText
      .replace(/(\s|\W)/g, "")
      .replace(/f/g, "ph")
      .replace(/w/g, "b")
      .replace(/v/g, "b")
      .replace(/r/g, "d")
      .replace(/y/g, "j")
      .replace(/o/g, "a")
      .toLowerCase();

    if (str1.length > 0 && str2.length > 0) {
      const pairs1 = TransliterationUtils.getBigrams(str1);
      const pairs2 = TransliterationUtils.getBigrams(str2);
      const union = pairs1.length + pairs2.length;
      let hits = 0;
      for (let x = 0; x < pairs1.length; x++) {
        for (let y = 0; y < pairs2.length; y++) {
          if (pairs1[x] === pairs2[y]) {
            hits++;
          }
        }
      }
      if (hits > 0) {
        const score = (2.0 * hits) / union;
        return score < 1.0 ? score : 1.0;
      }
    }
    return 0.0;
  }

  private static getBigrams(string: string): Array<string> {
    const s = string.toLowerCase();
    const v = s.split("");
    for (let i = 0; i < v.length; i++) {
      v[i] = s.slice(i, i + 2);
    }
    return v;
  }
}
