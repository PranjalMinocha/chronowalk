export interface ChronoWalkSceneManifest {
  id: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  experienceYear: number;
  archivalImage: {
    localPath: string;
    title: string;
    creator: string;
    created: string;
    repository: string;
    sourceUrl: string;
    reproductionNumber: string;
    rights: string;
  };
  grounding: {
    documented: string[];
    reconstructed: string[];
  };
}

export const PENN_STATION_1940: ChronoWalkSceneManifest = {
  id: "penn-interior-1940",
  location: {
    name: "Pennsylvania Station",
    latitude: 40.7506,
    longitude: -73.9935,
  },
  experienceYear: 1940,
  archivalImage: {
    localPath: "/chronowalk/penn-station-waiting-room-1910.jpg",
    title: "Pennsylvania Station, main waiting room, New York, N.Y.",
    creator: "Detroit Publishing Company",
    created: "Between 1905 and 1915",
    repository: "Library of Congress Prints and Photographs Division",
    sourceUrl: "https://www.loc.gov/pictures/resource/det.4a19906/",
    reproductionNumber: "LC-DIG-det-4a19906",
    rights: "No known restrictions on publication",
  },
  grounding: {
    documented: [
      "The original station's main waiting room used monumental Roman-inspired Beaux-Arts architecture.",
      "The room contained coffered vaults, travertine walls, Corinthian columns, arched windows, and globe lamps.",
      "The archival photograph directly anchors the room's proportions and visible architectural details.",
    ],
    reconstructed: [
      "Traveler movement, clothing colors, and ambient activity are AI reconstructions.",
      "Areas beyond the archival photograph are plausible continuations rather than measured replicas.",
      "The selected 1940 atmosphere is inferred from the documented station and period context.",
    ],
  },
};

export const CHRONOWALK_SCENES: Record<string, ChronoWalkSceneManifest> = {
  [PENN_STATION_1940.id]: PENN_STATION_1940,
};
