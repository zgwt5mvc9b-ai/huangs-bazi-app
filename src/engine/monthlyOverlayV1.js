import { calculateYearPillar, calculateMonthPillar } from "./pillars.js";
import {
  ELEMENTS,
  STEM_WEIGHT,
  BRANCH_MAIN_ELEMENT_WEIGHT,
  HIDDEN_STEM_WEIGHT,
} from "../data/baziConstants.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function scoreMonthPillarElements(monthPillar) {
  const scores = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));

  scores[monthPillar.stem.element] += STEM_WEIGHT;
  scores[monthPillar.branch.element] += BRANCH_MAIN_ELEMENT_WEIGHT;

  monthPillar.branch.hiddenStems.forEach((hiddenStem) => {
    scores[hiddenStem.element] += HIDDEN_STEM_WEIGHT;
  });

  return scores;
}

function getDominantElement(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function getMonthlyRead(dominantElement, usefulGodV4) {
  const favourable = usefulGodV4?.favourableElements || [];
  const secondaryFavourable = usefulGodV4?.secondaryFavourableElements || [];
  const caution = usefulGodV4?.cautionElements || [];

  if (favourable.includes(dominantElement) || secondaryFavourable.includes(dominantElement)) {
    return "Good";
  }
  if (caution.includes(dominantElement)) {
    return "Caution";
  }
  return "Neutral";
}

function buildMonthlyNote({ chinese, branchAnimal, dominantElement, read }) {
  const lead = `${chinese} (${branchAnimal}) brings ${dominantElement} energy this month`;

  if (read === "Good") {
    return `${lead} — supportive, a good window to act on plans.`;
  }
  if (read === "Caution") {
    return `${lead} — adds to what you're already managing carefully, so pace yourself.`;
  }
  return `${lead} — fairly neutral for this chart.`;
}

export function buildMonthlyOverlayV1({ selectedYear, usefulGodV4 }) {
  // Mid-month day (15th) keeps every call safely inside that month's solar
  // boundary, away from Jie Qi cutover dates near the start of each month.
  const yearPillar = calculateYearPillar({ year: selectedYear, month: 6, day: 15 });

  const months = MONTH_NAMES.map((monthName, index) => {
    const monthNumber = index + 1;
    const monthPillar = calculateMonthPillar(
      { month: monthNumber, day: 15 },
      yearPillar
    );

    const elementScores = scoreMonthPillarElements(monthPillar);
    const dominantElement = getDominantElement(elementScores);
    const read = getMonthlyRead(dominantElement, usefulGodV4);

    const chinese = `${monthPillar.stem.zh}${monthPillar.branch.zh}`;
    const branchAnimal = monthPillar.branch.animal;

    return {
      month: monthNumber,
      monthName,
      year: selectedYear,
      chinese,
      stemName: monthPillar.stem.label,
      branchAnimal,
      elementScores,
      dominantElement,
      read,
      note: buildMonthlyNote({ chinese, branchAnimal, dominantElement, read }),
    };
  });

  return {
    version: "monthly-overlay-v1",
    selectedYear,
    months,
  };
}

export default buildMonthlyOverlayV1;
