// /data/bears.ts
export type Bear = {
  slug: "black-bear" | "grizzly-bear" | "polar-bear" | "kodiak-bear";
  name: string;
  scientific: string;

  heroSubtitle: string;
  shortBlurb: string;

  where: string[];
  coreRangeSummary: string;

  habitat: string[];
  diet: string[];

  size: {
    heightShoulder?: string;
    standingUpright?: string;
    weightMale?: string;
    weightFemale?: string;
    lifespanWild?: string;
  };

  conservation: {
    status: string;
    notes: string[];
  };

  funFacts: string[];

  // NEW: optional photo shown on bear detail pages
  image?: {
    src: string; // direct image URL
    credit?: string; // short credit line
    page?: string; // source/credit page
    licenseHint?: string; // optional “check page for license”
  };

  // Map camera defaults + optional region chips
  view: {
    center: [number, number]; // [lng, lat]
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  regions?: { id: string; label: string; center: [number, number]; zoom: number }[];

  // Future hooks if you want to wire data layers per bear
  rangeGeoJSON?: string;
  sightingsGeoJSON?: string;
};

export const BEARS: Bear[] = [
  {
    slug: "black-bear",
    name: "American Black Bear",
    scientific: "Ursus americanus",
    heroSubtitle: "The most widespread bear in North America.",
    shortBlurb:
      "Highly adaptable omnivore found in forests and wild edges across much of the U.S. and Canada.",
    where: [
      "Alaska",
      "Pacific Northwest",
      "Rockies",
      "Upper Midwest",
      "Appalachians",
      "Southeast (including Florida)",
      "Northeast",
    ],
    coreRangeSummary:
      "Widely distributed across North America; commonly associated with forested habitats but often uses mixed landscapes near human communities.",
    habitat: ["Forests", "Swamps", "Mountains", "Mixed woodland edges"],
    diet: [
      "Omnivore: plants + animals",
      "Berries, fruit, sedges, insects",
      "Occasional fish/honeycomb",
      "Can be attracted to unsecured human food/garbage",
    ],
    size: {
      lifespanWild:
        "Can live into the 20s; NPS notes broad omnivory and adaptability (varies by region).",
    },
    conservation: {
      status: "Least Concern (IUCN); managed by states/provinces",
      notes: [
        "Human–bear conflict is often driven by food attractants—secure trash is a major prevention step.",
        "Diet is extremely flexible; they will eat “almost anything.”",
      ],
    },
    funFacts: [
      "Curved claws help with tree climbing (better climbers than brown bears).",
      "Excellent sense of smell; very food-motivated and smart around attractants.",
    ],

    // NEW image
    image: {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/American%20Black%20Bear%20059.jpg",
      credit: "Wikimedia Commons — American Black Bear 059",
      page: "https://commons.wikimedia.org/wiki/File:American_Black_Bear_059.jpg",
      licenseHint: "See file page for license",
    },

    view: { center: [-98, 39], zoom: 3.7, pitch: 45, bearing: 0 },
    regions: [
      { id: "upper-midwest", label: "Upper Midwest", center: [-93, 46], zoom: 5.2 },
      { id: "appalachians", label: "Appalachians", center: [-82.5, 36.5], zoom: 5.7 },
      { id: "pacific-nw", label: "Pacific NW", center: [-122.5, 47.5], zoom: 5.4 },
    ],
  },

  {
    slug: "grizzly-bear",
    name: "Grizzly Bear (Lower 48)",
    scientific: "Ursus arctos horribilis",
    heroSubtitle: "A heavyweight icon of the Northern Rockies.",
    shortBlurb:
      "In the contiguous U.S., grizzlies persist mainly in the Greater Yellowstone and Northern Continental Divide ecosystems, with recovery efforts focused on connectivity and conflict reduction.",
    where: ["Montana", "Wyoming", "Idaho"],
    coreRangeSummary:
      "Concentrated in a few key ecosystems in the Northern Rockies; management focuses on population recovery, dispersal/connectivity, and reducing human-caused mortality.",
    habitat: ["Mountain valleys", "Alpine meadows", "River corridors", "Forested slopes"],
    diet: [
      "Highly variable/opportunistic omnivore",
      "Plants, roots, berries, insects",
      "Mammals/fish/carrion when available",
      "Can be attracted to human food/garbage",
    ],
    size: {
      lifespanWild: "Often 15–30 years (varies by ecosystem).",
    },
    conservation: {
      status: "Protected/managed under U.S. frameworks; status varies by population/ecosystem",
      notes: [
        "Dispersal can be substantial; males may travel long distances between ecosystems.",
        "Diet varies widely by season, year, and location.",
      ],
    },
    funFacts: [
      "Shoulder hump is muscle used for digging.",
      "Can run fast for short bursts; behavior and diet shift seasonally.",
    ],

    // NEW image
    image: {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Grizzlybear55.jpg",
      credit: "Wikimedia Commons — Grizzlybear55",
      page: "https://commons.wikimedia.org/wiki/File:Grizzlybear55.jpg",
      licenseHint: "See file page for license",
    },

    view: { center: [-110.5, 45.5], zoom: 5.2, pitch: 50, bearing: -10 },
    regions: [
      { id: "yellowstone", label: "Greater Yellowstone", center: [-110.6, 44.6], zoom: 6.2 },
      { id: "ncde", label: "Northern Continental Divide", center: [-113.7, 48.7], zoom: 5.8 },
    ],
  },

  {
    slug: "polar-bear",
    name: "Polar Bear",
    scientific: "Ursus maritimus",
    heroSubtitle: "Sea-ice specialist of the Arctic coast.",
    shortBlurb:
      "In the U.S., polar bears occur in Alaska and are largely dependent on sea ice for hunting; sea-ice decline is a central threat.",
    where: ["Alaska (Arctic coast)"],
    coreRangeSummary:
      "Circumpolar Arctic species; U.S. range is Alaska, with life history closely tied to sea ice.",
    habitat: ["Sea ice", "Coastal tundra", "Barrier islands"],
    diet: ["Primarily seals", "Carrion/opportunistic foods when available"],
    size: {
      lifespanWild: "Varies; strongly influenced by sea-ice conditions and food availability.",
    },
    conservation: {
      status: "Threatened (U.S. ESA); Vulnerable (IUCN Red List)",
      notes: [
        "Largely dependent on sea ice; reduced ice can limit hunting opportunities.",
        "U.S. agencies manage conservation with an emphasis on habitat change and coexistence planning.",
      ],
    },
    funFacts: ["Built for swimming; large paws help as paddles.", "Often travels with the seasonal ice edge."],

    // NEW image
    image: {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Polar%20bear%20after%20unlucky%20hunt%20for%20a%20seal.jpg",
      credit: "Wikimedia Commons — Polar bear after unlucky hunt for a seal",
      page: "https://commons.wikimedia.org/wiki/File:Polar_bear_after_unlucky_hunt_for_a_seal.jpg",
      licenseHint: "See file page for license",
    },

    view: { center: [-156, 71], zoom: 4.7, pitch: 50, bearing: 10 },
    regions: [
      { id: "north-slope", label: "North Slope", center: [-150.2, 70.3], zoom: 6.0 },
      { id: "chukchi", label: "Chukchi Sea", center: [-164, 70.8], zoom: 5.6 },
    ],
  },

  {
    slug: "kodiak-bear",
    name: "Kodiak Bear",
    scientific: "Ursus arctos middendorffi",
    heroSubtitle: "Island giant found only on the Kodiak Archipelago.",
    shortBlurb:
      "A distinct brown bear population limited to Alaska’s Kodiak Archipelago; size and ecology are strongly shaped by coastal food systems.",
    where: ["Alaska (Kodiak Archipelago)"],
    coreRangeSummary:
      "Endemic to the Kodiak Archipelago; often cited among the largest bears, supported by rich seasonal foods like salmon.",
    habitat: ["Coastal forests", "River systems", "Alpine terrain", "Meadows"],
    diet: ["Salmon", "Berries", "Plants", "Carrion", "Occasional ungulates"],
    size: {
      standingUpright: "Up to ~10 feet tall when upright (large males)",
      heightShoulder: "~3–5 feet on all fours",
      weightMale: "Up to ~1,500 lb (very large males)",
      weightFemale: "Females smaller/lighter than males",
      lifespanWild: "Individuals documented into the 20s–30s (records vary).",
    },
    conservation: {
      status: "Managed population (Alaska); local management focuses on sustainability and safety",
      notes: [
        "Island isolation makes this population distinct.",
        "ADF&G notes extreme size potential in large males.",
      ],
    },
    funFacts: [
      "Often described as one of the largest bears; size is heavily influenced by food availability.",
      "ADF&G has documented wild individuals into their 30s.",
    ],

    // NEW image
    image: {
      src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kodiak%20Bear%20standing%20on%20hind%20legs%2C%20USFWS%2011394.jpg",
      credit: "USFWS via Wikimedia Commons — Kodiak Bear (USFWS 11394)",
      page: "https://commons.wikimedia.org/wiki/File:Kodiak_Bear_standing_on_hind_legs,_USFWS_11394.jpg",
      licenseHint: "See file page for license",
    },

    view: { center: [-153.5, 57.4], zoom: 6.6, pitch: 55, bearing: -15 },
    regions: [{ id: "kodiak-island", label: "Kodiak Island", center: [-153.4, 57.6], zoom: 7.3 }],
  },
];

export function getBearBySlug(slug: string) {
  return BEARS.find((b) => b.slug === slug);
}
