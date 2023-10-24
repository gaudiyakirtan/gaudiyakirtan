import { Text } from 'app/design/typography'
import { View } from 'app/design/view'
import DataTransform from 'app/utils/transliteration/DataTransform'
import ISong, {IVerse} from 'app/interfaces/ISong'
import transliterate from 'app/utils/transliteration/transliterator'
import { UserLanguage } from 'app/utils/settings/UserLanguage'

function Verse({verse, songLanguage, userLanguage, hasSynonyms, key}: {verse: IVerse, songLanguage: string, userLanguage: string, hasSynonyms: boolean, key: string}) {
    let scriptLines = verse.lines.map((line, index) => line.map(word => `${word.w}${word.h}`).join(''))
    let userLanguageScriptLines = scriptLines.map(line => transliterate(line, songLanguage, userLanguage));
    let userLanguageWordForWord = formWordForWord({verse, songLanguage, userLanguage, hasSynonyms});

    return (
        <View key={key}>
            {/* original script language */}
            {scriptLines.map((line, index) => <Text className='text-center' key={index}>{line}</Text> )}

            {/* user language script*/}
            {userLanguageScriptLines.map((line, index) => <Text className='text-center' key={index}>{line}</Text> )}

            {/* word-to-word */}
            {userLanguageWordForWord}

            {/* translation */}
            <Text className='text-center'>{verse.translation[userLanguage]}</Text>
        </View>
    )
}

// const formOriginalScript = (): JSX.Element {
//     const theme = Theme.getCurrentTheme();
//     const linesJSX: JSX.Element[] = [];

//     if (this.props.song.language === Settings.get().userLanguage) {
//       return <></>;
//     }

//     this.props.verse.lines.forEach((line, index) => {
//       const lineStr = this.concatenateWords(line, true);
//       linesJSX.push(
//         <View style={{ alignItems: "center" }} key={index}>
//           <Text color={theme.subtext} fontSize={this.fontSize - 2}>
//             {transliterate(lineStr, this.props.song.language, this.props.song.language)}
//           </Text>
//         </View>
//       );
//     });

//     return <View>{linesJSX}</View>;
//   }

//   private formTransliteratedVerse(): JSX.Element {
//     const theme = Theme.getCurrentTheme();
//     const linesJSX: JSX.Element[] = [];

//     this.props.verse.lines.forEach((line, index) => {
//       const lineStr = this.concatenateWords(line, false);
//       linesJSX.push(
//         <View style={{ alignItems: "center" }} key={index}>
//           <Text color={theme.accent} fontSize={this.fontSize + 1} fontWeight="900">
//             {transliterate(lineStr, this.props.song.language)}
//           </Text>
//         </View>
//       );
//     });

//     return <View>{linesJSX}</View>;
//   }

//   private concatenateWords(line: ILine, original: boolean): string {
//     const userLanguage = Settings.get().userLanguage as string;
//     let lineStr = "";
//     line.forEach(word => {
//       const override =
//         !original && ["eng", "rus", "spa", "ger"].indexOf(userLanguage) > -1 ? word.o.eng : false;
//       lineStr += `${override || word.w}${word.h}`;
//     });
//     return lineStr;
//   }

function formWordForWord({verse, songLanguage, userLanguage, hasSynonyms}) {
    // const theme = Theme.getCurrentTheme();

    if (songLanguage === userLanguage) {
      return <></>;
    }
    // if (Object.keys(this.props.song.has_synonyms).indexOf(this.userLanguage) > -1) return <></>;
    if (!(hasSynonyms && userLanguage === UserLanguage.eng)) {
      return <></>;
    }

    // const wordTextColor = theme.accent;
    // const meaningTextColor = theme.subtext;
    const wordForWordJSX: JSX.Element[] = [];

    verse.lines.forEach((line, lineIndex) => {
      wordForWordJSX.push(
        // <Text fontsize={this.fontsize - 2} key={`l${lineIndex}`}>
        <Text key={`l${lineIndex}`}>
          {`${`${lineIndex + 1}`
            .split("")
            .map(c => {
              return "⁰¹²³⁴⁵⁶⁷⁸⁹"[c];
            })
            .join("")} `}
        </Text>
      );

      let carry = "";
      for (let i = 0; i < line.length; i++) {
        const word = line[i];
        let lookAhead = "";

        if (i < line.length - 1) {
          if (line[i + 1].s[userLanguage] === "⬅1") {
            lookAhead = ` ${line[i + 1].w}`;
          }
        }
        if (i < line.length - 2) {
          if (line[i + 2].s[userLanguage] === "⬅2") {
            lookAhead += ` ${line[i + 2].w}`;
          }
        }
        if (
          word.s[userLanguage] &&
          word.s[userLanguage] !== "NULL" &&
          word.s[userLanguage][0] !== "⬅"
        ) {
          wordForWordJSX.push(
            // <Text color={wordTextColor} fontSize={this.fontSize - 2} key={`w${lineIndex}${i}`}>
            <Text  key={`w${lineIndex}${i}`}>
              {`${carry.trim()}${transliterate(word.w + lookAhead, songLanguage, userLanguage)} — `}
            </Text>
          );
          carry = "";
          wordForWordJSX.push(
            // <Text color={meaningTextColor} fontSize={this.fontSize - 2} key={`s${lineIndex}${i}`}>
            <Text  key={`s${lineIndex}${i}`}>
              {`${word.s[userLanguage]};  `}
            </Text>
          );
        } else {
          carry = word.h;
        }
      }
    });

    return <Text>{wordForWordJSX}</Text>;
  }

export default Verse;