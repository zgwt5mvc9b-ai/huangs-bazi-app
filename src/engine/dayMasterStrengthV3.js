import { normalizePillars } from "./normalizePillars.js";

const ELEMENT_GENERATES = {
  Wood: "Fire",
  Fire: "Earth",
  Earth: "Metal",
  Metal: "Water",
  Water: "Wood",
};

const SEASON_SUPPORT = {
  Wood: {
    Wood: 1.4,
    Fire: 1.1,
    Earth: 0.85,
    Metal: 0.7,
    Water: 1.15,
  },
  Fire: {
    Wood: 1.15,
    Fire: 1.4,
    Earth: 1.1,
    Metal: 0.75,
    Water: 0.7,
  },
  Earth: {
    Wood: 0.8,
    Fire: 1.15,
    Earth: 1.35,
    Metal: 1.05,
    Water: 0.85,
  },
  Metal: {
    Wood: 0.75,
    Fire: 0.7,
    Earth: 1.15,
    Metal: 1.4,
    Water: 1.1,
  },
  Water: {
    Wood: 1.1,
    Fire: 0.75,
    Earth: 0.7,
    Metal: 1.15,
    Water: 1.4,
  },
};

const BRANCH_SEASON_ELEMENT = {
  yin: "Wood",
  mao: "Wood",
  chen: "Earth",
  si: "Fire",
  wu: "Fire",
  wei: "Earth",
  shen: "Metal",
  you: "Metal",
  xu: "Earth",
  hai: "Water",
  zi: "Water",
  chou: "Earth",
};

const STEM_POSITION_WEIGHT = {
  year: 0.8,
  month: 1.35,
  day: 0,
  hour: 0.9,
};

const BRANCH_MAIN_WEIGHT = {
  year: 0.55,
  month: 1.25,
  day: 0.75,
  hour: 0.65,
};

const HIDDEN_STEM_DECAY = [1, 0.55, 0.35];

function getProducingElement(element) {
  return Object.keys(ELEMENT_GENERATES).find(
    (producer) => ELEMENT_GENERATES[producer] === element
  );
}

function addElementScore(scores, element, amount) {
  if (!element || !Number.isFinite(amount)) return;

  scores[element] = (scores[element] || 0) + amount;
}

function classifyDayMaster(score) {
  if (score >= 72) return "Very Strong";
  if (score >= 58) return "Strong";
  if (score >= 43) return "Balanced";
  return "Weak";
}

function getStatus(score) {
  if (score >= 72) return "Excessive";
  if (score >= 58) return "Supported";
  if (score >= 43) return "Balanced";
  if (score >= 28) return "Under-supported";
  return "Depleted";
}

export function calculateDayMasterStrengthV3(pillars) {
  const normalized = normalizePillars(pillars);

  const dayElement = normalized?.day?.stemElement;
  const dayStem = normalized?.day?.stem;

  if (!dayElement) {
    return {
      score: 0,
      label: "Unknown",
      status: "Unknown",
      dayElement: null,
      supportingElement: null,
      seasonElement: null,
      elementScores: {},
      explanation: "Day Master element could not be determined.",
    };
  }

  const supportingElement = getProducingElement(dayElement);
  const monthBranchKey = normalized?.month?.branchKey;
  const seasonElement = BRANCH_SEASON_ELEMENT[monthBranchKey] || null;

  const elementScores = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };

  ["year", "month", "day", "hour"].forEach((position) => {
    const pillar = normalized[position];
    if (!pillar) return;

    const seasonMultiplier =
      seasonElement && pillar.stemElement
        ? SEASON_SUPPORT[seasonElement]?.[pillar.stemElement] || 1
        : 1;

    if (position !== "day") {
      addElementScore(
        elementScores,
        pillar.stemElement,
        (STEM_POSITION_WEIGHT[position] || 0.6) * seasonMultiplier
      );
    }

    const branchMultiplier =
      seasonElement && pillar.branchElement
        ? SEASON_SUPPORT[seasonElement]?.[pillar.branchElement] || 1
        : 1;

    addElementScore(
      elementScores,
      pillar.branchElement,
      (BRANCH_MAIN_WEIGHT[position] || 0.5) * branchMultiplier
    );

    (pillar.hiddenStems || []).forEach((hiddenStem, index) => {
      const hiddenMultiplier =
        seasonElement && hiddenStem.element
          ? SEASON_SUPPORT[seasonElement]?.[hiddenStem.element] || 1
          : 1;

      addElementScore(
        elementScores,
        hiddenStem.element,
        (BRANCH_MAIN_WEIGHT[position] || 0.5) *
          (HIDDEN_STEM_DECAY[index] || 0.25) *
          hiddenMultiplier
      );
    });
  });

  const selfScore = elementScores[dayElement] || 0;
  const resourceScore = elementScores[supportingElement] || 0;
  const totalScore = Object.values(elementScores).reduce(
    (sum, value) => sum + value,
    0
  );

  const rawSupportRatio =
    totalScore > 0 ? (selfScore + resourceScore * 0.85) / totalScore : 0;

  const score = Math.round(Math.max(0, Math.min(100, rawSupportRatio * 100)));

  const label = classifyDayMaster(score);
  const status = getStatus(score);

  return {
    dayStem,
    dayElement,
    supportingElement,
    seasonElement,
    elementScores,
    selfScore: Number(selfScore.toFixed(2)),
    resourceScore: Number(resourceScore.toFixed(2)),
    totalScore: Number(totalScore.toFixed(2)),
    supportRatio: Number(rawSupportRatio.toFixed(3)),
    score,
    label,
    status,
    explanation:
      "Day Master strength is estimated from visible stems, branch elements, hidden stems, month season influence, and resource support.",
          strengthScore: score,
    strengthLabel: label,
    reasoningFactors: {
      dayElement,
      supportingElement,
      seasonElement,
      elementScores,
      selfScore: Number(selfScore.toFixed(2)),
      resourceScore: Number(resourceScore.toFixed(2)),
      totalScore: Number(totalScore.toFixed(2)),
      supportRatio: Number(rawSupportRatio.toFixed(3)),
    },
  };
}