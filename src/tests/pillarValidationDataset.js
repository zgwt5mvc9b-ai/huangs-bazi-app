// IMPORTANT:
// These expected values come from Joey Yap reference charts.
// Do NOT change expected values to match current engine output.
// If this test fails, fix the engine calculation, not this dataset.

export const PILLAR_VALIDATION_DATASET = [
  {
  name: "Joshua",
  birthDate: "1999-01-26",
  birthTime: "22:00",

  expectedYearStemZh: "戊",
  expectedYearBranchZh: "寅",

  expectedDayStemZh: "戊",
  expectedDayBranchZh: "寅",
  expectedDayMaster: "Earth",
},

  {
    name: "Ma Weini",
    birthDate: "1982-08-15",
    birthTime: "21:00",

    expectedDayStemZh: "庚",
    expectedDayBranchZh: "午",
    expectedDayMaster: "Metal",
  },

  {
    name: "Suyin C",
    birthDate: "1987-12-03",
    birthTime: "03:45",

    expectedDayStemZh: "丙",
    expectedDayBranchZh: "戌",
    expectedDayMaster: "Fire",
  },

  {
    name: "Yue Qing Amanda",
    birthDate: "1986-09-07",
    birthTime: "00:00",

    expectedDayStemZh: "甲",
    expectedDayBranchZh: "寅",
    expectedDayMaster: "Wood",
  },

  {
    name: "Wong Lee Lee",
    birthDate: "1980-03-06",
    birthTime: null,

    expectedDayStemZh: "戊",
    expectedDayBranchZh: "寅",
    expectedDayMaster: "Earth",
  },
];