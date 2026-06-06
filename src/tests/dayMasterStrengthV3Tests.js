import { buildBaziChart } from "../engine/buildBaziChart.js";
import { PILLAR_VALIDATION_DATASET } from "./pillarValidationDataset.js";

for (const person of PILLAR_VALIDATION_DATASET) {
  const chart = buildBaziChart({
    name: person.name,
    birthDate: person.birthDate,
    birthTime: person.birthTime,
    useBirthTime: !!person.birthTime,
    gender: "female",
    birthCountry: "Singapore",
  });

  const strength =
    chart?.dayMasterStrengthV3 ||
    chart?.dayMasterStrength ||
    {};

  console.log({
    name: person.name,
    dayMaster: `${chart?.pillars?.day?.stem?.zh} ${chart?.pillars?.day?.stem?.element}`,
    monthPillar: `${chart?.pillars?.month?.stem?.zh}${chart?.pillars?.month?.branch?.zh}`,
    seasonElement: strength.seasonElement,
    strengthScore: strength.strengthScore ?? strength.score,
    strengthLabel: strength.strengthLabel ?? strength.label,
    status: strength.status,
    supportRatio: strength.supportRatio,
    elementScores: strength.elementScores,
  });
}