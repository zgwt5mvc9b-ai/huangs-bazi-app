import { getBranch } from "../data/baziConstants.js";

// Shen Sha (神煞) auxiliary stars. Starting with three that were validated
// against real reference output (Ma Weini's chart: Peach Blossom = Mao/
// Rabbit, Sky Horse = Shen/Monkey, Noble People = Wei/Goat, all matching).
// Other commonly-requested stars (Intelligence, Solitary, etc.) need their
// own lookup tables verified the same way before being added - deliberately
// left out of this first pass rather than guessing.

// Year-branch trio groups, used by both Peach Blossom and Sky Horse.
const TRIO_GROUPS = [
  { branches: ["yin", "wu", "xu"], peachBlossom: "mao", skyHorse: "shen" },
  { branches: ["shen", "zi", "chen"], peachBlossom: "you", skyHorse: "yin" },
  { branches: ["hai", "mao", "wei"], peachBlossom: "zi", skyHorse: "si" },
  { branches: ["si", "you", "chou"], peachBlossom: "wu", skyHorse: "hai" },
];

// Day Stem -> Noble People (Tian Yi Guiren) branches.
const NOBLE_PEOPLE_BY_DAY_STEM = {
  jia: ["chou", "wei"],
  wu: ["chou", "wei"],
  geng: ["chou", "wei"],
  yi: ["zi", "shen"],
  ji: ["zi", "shen"],
  bing: ["hai", "you"],
  ding: ["hai", "you"],
  ren: ["mao", "si"],
  gui: ["mao", "si"],
  xin: ["yin", "wu"],
};

function findTrioGroup(branchKey) {
  return TRIO_GROUPS.find((group) => group.branches.includes(branchKey));
}

function branchPresentInPillars(pillars, branchKey) {
  return Object.values(pillars)
    .filter(Boolean)
    .some((pillar) => pillar.branch.key === branchKey);
}

export function buildShenShaV1({ pillars }) {
  if (!pillars?.year || !pillars?.day) return null;

  const yearBranchKey = pillars.year.branch.key;
  const dayStemKey = pillars.day.stem.key;

  const trioGroup = findTrioGroup(yearBranchKey);
  const peachBlossomBranchKey = trioGroup?.peachBlossom || null;
  const skyHorseBranchKey = trioGroup?.skyHorse || null;
  const nobleBranchKeys = NOBLE_PEOPLE_BY_DAY_STEM[dayStemKey] || [];

  const branchLabel = (key) => {
    if (!key) return null;
    const branch = getBranch(key);
    return { key, zh: branch.zh, animal: branch.animal };
  };

  const stars = [];

  if (peachBlossomBranchKey) {
    stars.push({
      key: "peachBlossom",
      name: "Peach Blossom",
      zh: "桃花",
      branch: branchLabel(peachBlossomBranchKey) || { key: peachBlossomBranchKey },
      theme: "Charm, attractiveness, romantic and social opportunities.",
      caution: "Can also bring romantic complications or scattered attention.",
      active: branchPresentInPillars(pillars, peachBlossomBranchKey),
    });
  }

  if (skyHorseBranchKey) {
    stars.push({
      key: "skyHorse",
      name: "Sky Horse",
      zh: "驛馬",
      branch: branchLabel(skyHorseBranchKey) || { key: skyHorseBranchKey },
      theme: "Travel, movement, relocation, change of environment.",
      caution: "Can also show as restlessness or difficulty settling.",
      active: branchPresentInPillars(pillars, skyHorseBranchKey),
    });
  }

  if (nobleBranchKeys.length) {
    stars.push({
      key: "noblePeople",
      name: "Noble People",
      zh: "天乙貴人",
      branches: nobleBranchKeys.map((key) => branchLabel(key) || { key }),
      theme: "Helpful mentors or benefactors who appear at key moments.",
      caution: null,
      active: nobleBranchKeys.some((key) => branchPresentInPillars(pillars, key)),
    });
  }

  return {
    version: "shen-sha-v1",
    stars,
  };
}

export default buildShenShaV1;
