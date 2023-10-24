export const MathaBlackList = {
  A1: true,
  A2: true,
  A4: true,
  E2: true,
  E4: true,
  GV1: true,
  GV2: true,
  GV3: true,
  GV4: true,
  GV5: true,
  GV6: true,
  GV7: true,
  GV8: true,
  GV9: true,
  GV10: true,
  GV11: true,
  GV12: true,
  GV13: true,
  GV14: true,
  GV15: true,
  GV16: true,
  GV49: true,
  M1: true,
  M2: true,
  M3: true,
  M4: true,
  M5: true,
  M6: true,
  M7: true,
  M8: true,
  M9: true,
  M10: true,
  M11: true,
  M12: true,
  M13: true,
  M14: true
};

export const Mathas = {
  other: {
    founder: "শ্রীল ভক্তিসিদ্ধান্ত সরস্ৱতী গোস্ৱামী প্রভুপাদ",
    pic: require("../../images/mathaFounders/sidh.jpg"),
    allow: ["M1", "M2", "GV1", "GV2", "A16"]
  },
  "শ্রী•চৈতন্য মঠ": {
    founder: "শ্রীল ভক্তি•ৱিলাস তীর্থ গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/tirt.jpg"),
    allow: ["M14", "M3", "GV3", "GV4", "GV49", "A16", "E4"]
  },
  "শ্রী•চৈতন্য সরস্ৱত মঠ": {
    founder: "শ্রীল ভক্তি•রক্ষক শ্রীধর গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/srid.jpg"),
    allow: ["E4"]
  },
  "শ্রী•গৌড়ীয় বেদান্ত সমিতি": {
    founder: "শ্রীল ভক্তি•প্রজ্ঞান কেশৱ গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/praj.jpg"),
    allow: ["M9", "M8", "M10", "GV9", "GV8", "GV14", "GV15", "GV16", "A1", "A2", "A4", "A14", "E2"]
  },
  "শ্রী•গোপীনাথ গৌড়ীয় মঠ": {
    founder: "শ্রীল ভক্তি•প্রমোদ পুরী গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/prom.jpg"),
    allow: ["E4"]
  },
  "শ্রী•চৈতন্য গৌড়ীয় মঠ": {
    founder: "শ্রীল ভক্তি•দয়িত মাধৱ গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/madh.jpg"),
    allow: ["M7", "GV6", "GV7", "GV13", "A16", "E4"]
  },
  ISKCON: {
    founder: "শ্রীল ভক্তিৱেদান্ত স্ৱামী প্রভুপাদ",
    pic: require("../../images/mathaFounders/prab.jpg"),
    allow: ["M4", "M5", "M6", "GV5", "E4"]
  },
  "সরস্ৱত গৌড়ীয় আসন ও মিশন": {
    founder: "শ্রীল ভক্তি•শ্রীরূপ সিদ্ধানতী গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/srir.jpg"),
    allow: ["E4"]
  },
  "শ্রী•সন্ত গোস্ৱামী গৌড়ীয় মঠ": {
    founder: "শ্রীল ভক্তি কুমুদ সন্ত গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/kumu.jpg"),
    allow: ["M13", "GV12", "A16", "E4"]
  },
  IKCM: {
    founder: "শ্রীল ভক্তি•ৱৈভব পুরী গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/vaib.jpg"),
    allow: ["E4"]
  },
  IPBYS: {
    founder: "শ্রীল ভক্তিৱেদান্ত নারায়ণ গোস্ৱামী মহারাজ",
    pic: require("../../images/mathaFounders/nara.jpg"),
    allow: [
      "M11",
      "M12",
      "M10",
      "GV10",
      "GV11",
      "GV14",
      "GV15",
      "GV16",
      "A1",
      "A2",
      "A4",
      "A14",
      "E2"
    ]
  }
};

export type UserMatha = keyof typeof Mathas;
