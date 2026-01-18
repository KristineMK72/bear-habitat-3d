// /data/bears.ts
export type Bear = {
  slug: "black-bear" | "grizzly-bear" | "polar-bear" | "kodiak-bear";
  name: string;
  scientific: string;
  heroSubtitle: string;
  shortBlurb: string;
  where: string[];
  habitat: string[];
  diet: string[];
  funFacts: string[];
  conservation: {
    status: string;
    notes: string[];
  };
  // Optional future hooks:
  rangeGeoJSON?: string; // e.g. "/data/ranges/black_bear.geojson"
  sightingsGeoJSON?: string; // e.g. "/data/gbif/bear_observations.geojson"
};

export const BEARS: Bear[] = [
  {
    slug: "black-bear",
    name: "American Black Bear",
    scientific: "Ursus americanus",
    heroSubtitle: "The most widespread bear in North America.",
    shortBlurb:
      "Highly adaptable and found in forests, swamps, and mountains across much of the U.S.",
    where: ["Alaska", "Minnesota", "Wisconsin", "Michigan", "Pennsylvania", "North Carolina", "Florida", "California"],
    habitat: ["Forests", "Swamps", "Mountains", "Mixed woodland edges"],
    diet: ["Berries & nuts", "Insects", "Carrion", "Plants", "Occasional fish/meat"],
    funFacts: [
      "Color can vary from black to cinnamon to brown depending on region.",
      "Excellent climbers—especially younger bears.",
      "A true generalist: survives near people more often than other bears.",
    ],
    conservation: {
      status: "Least Concern (varies by region)",
      notes: [
        "Main risks are habitat fragmentation and human–bear conflict.",
        "Secure trash = fewer conflicts (and fewer bears euthanized).",
      ],
    },
    // rangeGeoJSON: "/data/ranges/black_bear.geojson",
    // sightingsGeoJSON: "/data/gbif/bear_observations.geojson",
  },
  {
    slug: "grizzly-bear",
    name: "Grizzly Bear (Brown Bear – Lower 48)",
    scientific: "Ursus arctos horribilis",
    heroSubtitle: "A heavyweight icon of the Northern Rockies.",
    shortBlurb:
      "In the contiguous U.S., grizzlies persist mainly in the Northern Rockies and Greater Yellowstone ecosystems.",
    where: ["Montana", "Wyoming", "Idaho"],
    habitat: ["Mountain valleys", "Alpine meadows", "River corridors", "Forested slopes"],
    diet: ["Roots & bulbs", "Berries", "Insects", "Ungulates (sometimes)", "Fish (where available)"],
    funFacts: [
      "The shoulder hump is muscle used for digging.",
      "Can cover surprising distances in a day when foraging.",
      "Often at the center of conservation and land-use debates.",
    ],
    conservation: {
      status: "Protected in many areas (management varies)",
      notes: [
        "Key challenges: connectivity between populations + conflict reduction.",
        "Road density and attractants often drive risk hotspots.",
      ],
    },
  },
  {
    slug: "polar-bear",
    name: "Polar Bear",
    scientific: "Ursus maritimus",
    heroSubtitle: "Sea-ice specialist of the Arctic coast.",
    shortBlurb:
      "In the U.S., polar bears are primarily found along Alaska’s northern coast and sea-ice habitats.",
    where: ["Alaska (Arctic coast)"],
    habitat: ["Sea ice", "Coastal tundra", "Barrier islands"],
    diet: ["Seals (primary)", "Carrion (opportunistic)"],
    funFacts: [
      "Built for swimming: large paws act like paddles.",
      "Relies heavily on sea ice for hunting.",
      "A powerful case study in climate-linked habitat change.",
    ],
    conservation: {
      status: "Threatened (U.S.) / Vulnerable globally (commonly cited)",
      notes: [
        "Sea-ice loss is the biggest long-term driver of population stress.",
        "Human safety planning is critical in Arctic communities.",
      ],
    },
  },
  {
    slug: "kodiak-bear",
    name: "Kodiak Bear",
    scientific: "Ursus arctos middendorffi",
    heroSubtitle: "Island giant found only on Kodiak Archipelago.",
    shortBlurb:
      "One of the largest bears on Earth, shaped by island ecology and rich coastal food systems.",
    where: ["Alaska (Kodiak Archipelago)"],
    habitat: ["Coastal forests", "River systems", "Alpine terrain", "Meadows"],
    diet: ["Salmon", "Berries", "Plants", "Carrion", "Occasional ungulates"],
    funFacts: [
      "Often cited as among the world’s largest bears (with polar bears).",
      "Island isolation creates a distinct population.",
      "Salmon runs can dramatically influence body size and density.",
    ],
    conservation: {
      status: "Stable (management varies)",
      notes: [
        "Sustainable management focuses on habitat, hunting regulation, and conflict prevention.",
        "Great candidate for a ‘food web’ mini visual on the page.",
      ],
    },
  },
];

export function getBearBySlug(slug: string) {
  return BEARS.find((b) => b.slug === slug);
}
