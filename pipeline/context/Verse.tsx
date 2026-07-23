/* eslint-disable react/no-array-index-key */
import React from "react";
import { StyleSheet, View } from "react-native";

import ISong, { IVerse, ILine } from "../../../../data/models/server/ISong";
import transliterate from "../../../../utils/transliteration/transliterator";
import Text from "../../../lib/text/Text";
import Settings from "../../../../utils/settings/Settings";
import Theme from "../../../../utils/theme/Theme";
import Color from "../../../../utils/theme/Color";
import { UserLanguage } from "../../../../utils/settings/UserLanguage";

interface IProps {
  verse: IVerse;
  index: number;
  song: ISong;
}

export default class Verse extends React.Component<IProps> {
  private fontSize: number;

  public constructor(props: IProps) {
    super(props);
    this.fontSize = Settings.get().lyricsFontSize;
  }

  public render(): JSX.Element {
    const theme = Theme.getCurrentTheme();
    const s = Settings.get();
    this.fontSize = s.lyricsFontSize;
    const userLanguage = Settings.get().userLanguage;
    const styles = this.getStyles();

    return (
      <View style={{ ...styles.verseCard, ...styles.androidShadow, ...styles.iosShadow }}>
        {s.lyricsShowScript && <View>{this.formOriginalScript()}</View>}
        {s.lyricsShowVerse && (
          <View style={styles.spaceAbove}>{this.formTransliteratedVerse()}</View>
        )}
        {s.lyricsShowWordForWord && <View style={styles.spaceAbove}>{this.formWordForWord()}</View>}
        {s.lyricsShowTranslation &&
          this.props.song.has_translations &&
          this.props.verse.translation[userLanguage] &&
          // Object.keys(this.props.song.has_translations).indexOf(this.userLanguage) > -1 &&
          this.props.song.language !== userLanguage &&
          this.props.verse.translation[userLanguage] !== "UNDEFINED" && (
            <View style={styles.spaceAbove}>
              <Text color={theme.subtext} fontSize={this.fontSize - 1} textAlign="justify">
                {this.props.verse.translation[userLanguage]}
              </Text>
            </View>
          )}
      </View>
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getStyles() {
    const theme = Theme.getCurrentTheme();
    return StyleSheet.create({
      spaceAbove: { marginTop: 15 },
      verseCard: {
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 15,
        borderRadius: 20,
        backgroundColor: theme.cardBackground
      },
      androidShadow: {
        elevation: 6
      },
      iosShadow: {
        shadowColor: "#000000" as Color,
        shadowOffset: {
          width: 0,
          height: 4
        },
        shadowOpacity: 0.2,
        shadowRadius: 8
      }
    });
  }

  private formOriginalScript(): JSX.Element {
    const theme = Theme.getCurrentTheme();
    const linesJSX: JSX.Element[] = [];

    if (this.props.song.language === Settings.get().userLanguage) {
      return <></>;
    }

    this.props.verse.lines.forEach((line, index) => {
      const lineStr = this.concatenateWords(line, true);
      linesJSX.push(
        <View style={{ alignItems: "center" }} key={index}>
          <Text color={theme.subtext} fontSize={this.fontSize - 2}>
            {transliterate(lineStr, this.props.song.language, this.props.song.language)}
          </Text>
        </View>
      );
    });

    return <View>{linesJSX}</View>;
  }

  private formTransliteratedVerse(): JSX.Element {
    const theme = Theme.getCurrentTheme();
    const linesJSX: JSX.Element[] = [];

    this.props.verse.lines.forEach((line, index) => {
      const lineStr = this.concatenateWords(line, false);
      linesJSX.push(
        <View style={{ alignItems: "center" }} key={index}>
          <Text color={theme.accent} fontSize={this.fontSize + 1} fontWeight="900">
            {transliterate(lineStr, this.props.song.language)}
          </Text>
        </View>
      );
    });

    return <View>{linesJSX}</View>;
  }

  private concatenateWords(line: ILine, original: boolean): string {
    const userLanguage = Settings.get().userLanguage as string;
    let lineStr = "";
    line.forEach(word => {
      const override =
        !original && ["eng", "rus", "spa", "ger"].indexOf(userLanguage) > -1 ? word.o.eng : false;
      lineStr += `${override || word.w}${word.h}`;
    });
    return lineStr;
  }

  private formWordForWord(): JSX.Element {
    const theme = Theme.getCurrentTheme();
    const userLanguage = Settings.get().userLanguage;

    if (this.props.song.language === userLanguage) {
      return <></>;
    }
    // if (Object.keys(this.props.song.has_synonyms).indexOf(this.userLanguage) > -1) return <></>;
    if (!(this.props.song.has_synonyms && userLanguage === UserLanguage.eng)) {
      return <></>;
    }

    const wordTextColor = theme.accent;
    const meaningTextColor = theme.subtext;
    const wordForWordJSX: JSX.Element[] = [];

    this.props.verse.lines.forEach((line, lineIndex) => {
      wordForWordJSX.push(
        <Text fontSize={this.fontSize - 2} key={`l${lineIndex}`}>
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
            <Text color={wordTextColor} fontSize={this.fontSize - 2} key={`w${lineIndex}${i}`}>
              {`${carry.trim()}${transliterate(word.w + lookAhead, this.props.song.language)} — `}
            </Text>
          );
          carry = "";
          wordForWordJSX.push(
            <Text color={meaningTextColor} fontSize={this.fontSize - 2} key={`s${lineIndex}${i}`}>
              {`${word.s[userLanguage]};  `}
            </Text>
          );
        } else {
          carry = word.h;
        }
      }
    });

    return <Text textAlign="justify">{wordForWordJSX}</Text>;
  }
}
