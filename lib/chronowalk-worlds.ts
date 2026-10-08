import type {
  StructuredExample,
  StructuredScene,
} from "@/lib/lingbot-world-prompts";

export const CHRONOWALK_YEARS = [1940, 1985, 2024] as const;

export type ChronoWalkYear = (typeof CHRONOWALK_YEARS)[number];
export type ChronoWalkMode = "exterior";

export interface ChronoWalkCell {
  id: string;
  name: string;
  shortName: string;
  bbl: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  initialHeading: number;
  description: string;
}

export interface ChronoWalkEvidence {
  year: ChronoWalkYear;
  label: string;
  headline: string;
  referenceYear: string;
  image: string;
  imageLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  rights: string;
  confidence: "Documented" | "Documented + inferred";
  facts: string[];
}

export type ChronoWalkEvidenceByYear = Partial<
  Record<ChronoWalkYear, ChronoWalkEvidence>
>;

export const DEFAULT_CELL_ID = "times-square-portal";

// Every local evidence image is represented by one portal in its applicable
// era. A cell may intentionally be absent from other eras rather than borrowing
// an unrelated photograph and pretending it documents that moment.
export const CHRONOWALK_CELLS: Record<string, ChronoWalkCell> = {
  "times-square-portal": {
    id: "times-square-portal",
    name: "1451–1455 Broadway",
    shortName: "Times Square",
    bbl: "1-00994-0001",
    latitude: 40.7555,
    longitude: -73.9867,
    radiusMeters: 6,
    initialHeading: 350,
    description:
      "The Broadway and West 42nd Street parcel now occupied by Times Square Tower.",
  },
  "flatiron-portal": {
    id: "flatiron-portal",
    name: "Flatiron Building",
    shortName: "Flatiron",
    bbl: "1-00851-0001",
    latitude: 40.74106,
    longitude: -73.9897,
    radiusMeters: 6,
    initialHeading: 0,
    description:
      "The triangular landmark parcel at Fifth Avenue, Broadway, and East 23rd Street.",
  },
  "penn-waiting-room-portal": {
    id: "penn-waiting-room-portal",
    name: "Original Penn Station Waiting Room",
    shortName: "Penn Interior",
    bbl: "1-00781-0001",
    latitude: 40.75058,
    longitude: -73.99358,
    radiusMeters: 6,
    initialHeading: 90,
    description:
      "The monumental waiting room of McKim, Mead & White's original Pennsylvania Station.",
  },
  "penn-exterior-portal": {
    id: "penn-exterior-portal",
    name: "Original Penn Station Exterior",
    shortName: "Penn Exterior",
    bbl: "1-00781-0001",
    latitude: 40.75036,
    longitude: -73.99191,
    radiusMeters: 6,
    initialHeading: 275,
    description:
      "The original station's Seventh Avenue frontage and monumental stone colonnade.",
  },
  "madison-square-garden-portal": {
    id: "madison-square-garden-portal",
    name: "Madison Square Garden",
    shortName: "MSG",
    bbl: "1-00781-0001",
    latitude: 40.75027,
    longitude: -73.99148,
    radiusMeters: 6,
    initialHeading: 130,
    description:
      "The circular arena above Penn Station between Seventh and Eighth Avenues.",
  },
  "empire-state-portal": {
    id: "empire-state-portal",
    name: "Empire State Building",
    shortName: "Empire State",
    bbl: "1-00835-0041",
    latitude: 40.74844,
    longitude: -73.98566,
    radiusMeters: 6,
    initialHeading: 5,
    description:
      "The Art Deco tower and Fifth Avenue tax lot between West 33rd and West 34th Streets.",
  },
  "chrysler-building-portal": {
    id: "chrysler-building-portal",
    name: "Chrysler Building",
    shortName: "Chrysler",
    bbl: "1-01297-0023",
    latitude: 40.75162,
    longitude: -73.9755,
    radiusMeters: 6,
    initialHeading: 330,
    description:
      "The Art Deco landmark at Lexington Avenue and East 42nd Street.",
  },
};

export const CHRONOWALK_EVIDENCE: Record<
  string,
  ChronoWalkEvidenceByYear
> = {
  "times-square-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "The pre-tower Broadway parcel",
      referenceYear: "c. 1940 tax photograph",
      image: "/chronowalk/times-square-1940-tax-photo.jpg",
      imageLabel: "1451–1455 Broadway, Manhattan, circa 1940",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://www.archives.nyc/blog/2017/8/10/tax-records-time-machines-property-cards-municipal-archives",
      rights: "NYC Municipal Archives research reference",
      confidence: "Documented + inferred",
      facts: [
        "Parcel identity: Manhattan Block 994, Lot 1",
        "Façade and street relationship locked to the tax photograph",
        "Occluded side streets and colors are model inferences",
      ],
    },
    1985: {
      year: 1985,
      label: "Mid-1980s",
      headline: "The parcel before redevelopment",
      referenceYear: "mid-1980s tax photograph",
      image: "/chronowalk/times-square-1980-tax-photo.jpg",
      imageLabel: "Manhattan Block 994, Lot 1 in the mid-1980s",
      sourceLabel: "NYC Department of Finance tax-photo survey",
      sourceUrl:
        "https://photos.1940s.nyc/720-jpg/dof_1_00994_0001.jpg",
      rights: "NYC Municipal Archives research reference",
      confidence: "Documented + inferred",
      facts: [
        "Same tax lot as the 1940s frame",
        "Visible massing, window rhythm, curb and storefront band are source-locked",
        "Fine signage and hidden surfaces are not treated as verified facts",
      ],
    },
    2024: {
      year: 2024,
      label: "Current",
      headline: "Times Square Tower",
      referenceYear: "modern façade photograph",
      image: "/chronowalk/times-square-tower-2021.jpg",
      imageLabel: "Times Square Tower modern façade",
      sourceLabel: "Wikimedia Commons · Epicgenius",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Times_Sq_Sep_2021_128.jpg",
      rights: "Creative Commons Attribution-ShareAlike 4.0",
      confidence: "Documented",
      facts: [
        "Times Square Tower occupies the same mapped parcel",
        "Glass curtain wall and exposed diagonal bracing are source-locked",
        "Current city orthophotography supplies geographic context",
      ],
    },
  },
  "flatiron-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "Flatiron at the start of the tax survey",
      referenceYear: "c. 1940 tax photograph",
      image: "/chronowalk/flatiron-1940-tax-photo.jpg",
      imageLabel: "Flatiron Building tax photograph, circa 1940",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://photos.1940s.nyc/720-jpg/nynyma_rec0040_1_00851_0001.jpg",
      rights: "NYC Municipal Archives research reference",
      confidence: "Documented + inferred",
      facts: [
        "Parcel identity: Manhattan Block 851, Lot 1",
        "Triangular massing, façade bays, crown, and intersection are source-locked",
        "Colors and occluded sidewalk details are model inferences",
      ],
    },
    1985: {
      year: 1985,
      label: "Mid-1980s",
      headline: "A landmark holding its form",
      referenceYear: "mid-1980s tax photograph",
      image: "/chronowalk/flatiron-1980-tax-photo.jpg",
      imageLabel: "Flatiron Building tax photograph, mid-1980s",
      sourceLabel: "NYC Department of Finance tax-photo survey",
      sourceUrl:
        "https://photos.1940s.nyc/720-jpg/dof_1_00851_0001.jpg",
      rights: "NYC Municipal Archives research reference",
      confidence: "Documented + inferred",
      facts: [
        "Same tax lot and landmark as the 1940s frame",
        "Silhouette, floor rhythm, windows, and plaza edge are source-locked",
        "Low-resolution signage is intentionally not reconstructed as fact",
      ],
    },
    2024: {
      year: 2024,
      label: "Current",
      headline: "The Flatiron landmark today",
      referenceYear: "modern licensed photograph",
      image: "/chronowalk/flatiron-current.jpg",
      imageLabel: "The Flatiron Building from Madison Square Park",
      sourceLabel: "Wikimedia Commons · PortableNYCTours",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:The_Flatiron_Building_(1).jpg",
      rights: "Creative Commons Attribution-ShareAlike 4.0",
      confidence: "Documented",
      facts: [
        "Landmark site: Manhattan Block 851, Lot 1",
        "Stone façade, triangular prow, window grid, and crown are source-locked",
        "Current city orthophotography supplies geographic context",
      ],
    },
  },
  "penn-waiting-room-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "Inside the original Penn Station",
      referenceYear: "historic interior reference",
      image: "/chronowalk/penn-station-waiting-room-1910.jpg",
      imageLabel: "Original Pennsylvania Station main waiting room",
      sourceLabel: "Library of Congress · Detroit Publishing Company",
      sourceUrl: "https://www.loc.gov/pictures/resource/det.4a19906/",
      rights: "No known restrictions on publication",
      confidence: "Documented + inferred",
      facts: [
        "The original station and waiting room remained in use throughout the 1940s",
        "Vault, columns, windows, lamps, stairs, and room proportions are source-locked",
        "Period color, travelers, and occluded surfaces remain restrained inferences",
      ],
    },
  },
  "penn-exterior-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "The lost Seventh Avenue façade",
      referenceYear: "archival station photograph",
      image: "/chronowalk/penn-station-exterior-1962.jpg",
      imageLabel: "Original Pennsylvania Station exterior",
      sourceLabel: "Library of Congress · Historic American Buildings Survey",
      sourceUrl:
        "https://www.loc.gov/pictures/item/ny0411.photos.119989p/",
      rights: "No known restrictions on U.S. Government image",
      confidence: "Documented + inferred",
      facts: [
        "The same original station structure stood on this site in the 1940s",
        "Stone colonnade, façade scale, openings, and street relationship are source-locked",
        "Later grime, vehicles, and incidental capture details are not copied into the 1940s scene",
      ],
    },
  },
  "madison-square-garden-portal": {
    1985: {
      year: 1985,
      label: "Mid-1980s",
      headline: "Madison Square Garden above Penn Station",
      referenceYear: "architectural reference",
      image: "/chronowalk/madison-square-garden-2011.jpg",
      imageLabel: "Madison Square Garden exterior reference",
      sourceLabel: "Wikimedia Commons · Madison Square Garden exterior",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Madison_Square_Garden_2011.jpg",
      rights: "Creative Commons licensed reference",
      confidence: "Documented + inferred",
      facts: [
        "The present arena opened on this site in 1968 and occupied it in the mid-1980s",
        "Circular arena massing and structural street relationship are source-locked",
        "Signs, storefront details, colors, and street furniture are reconstructed conservatively for the era",
      ],
    },
    2024: {
      year: 2024,
      label: "Current",
      headline: "Madison Square Garden today",
      referenceYear: "modern licensed photograph",
      image: "/chronowalk/madison-square-garden-2018.jpg",
      imageLabel: "Madison Square Garden current exterior",
      sourceLabel: "Wikimedia Commons · Zakarie Faibis",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Madison_Square_Garden_113.jpg",
      rights: "Creative Commons Attribution-ShareAlike 4.0",
      confidence: "Documented",
      facts: [
        "Camera position is anchored to the photograph's recorded coordinates",
        "Arena massing, façade bands, entrances, and street edge are source-locked",
        "Current city orthophotography supplies geographic context",
      ],
    },
  },
  "empire-state-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "The Empire State Building above Midtown",
      referenceYear: "1939–1941 tax photograph",
      image: "/chronowalk/empire-state-1940-tax-photo.jpg",
      imageLabel: "Empire State Building tax photograph, circa 1940",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://nycrecords.access.preservica.com/uncategorized/IO_ade04475-e92b-480c-b88f-97ac3be5a3b3/",
      rights: "NYC Municipal Archives; reproduction restrictions may apply",
      confidence: "Documented + inferred",
      facts: [
        "Exact parcel match: Manhattan Block 835, Lot 41",
        "Tower silhouette, setbacks, spire, and surrounding roofline are source-locked",
        "Street-level color and occluded details remain restrained inferences",
      ],
    },
    1985: {
      year: 1985,
      label: "Mid-1980s",
      headline: "Fifth Avenue at the Empire State Building",
      referenceYear: "1983–1988 tax photograph",
      image: "/chronowalk/empire-state-1980-tax-photo.jpg",
      imageLabel: "336–350 Fifth Avenue tax photograph, mid-1980s",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://nycrecords.access.preservica.com/uncategorized/IO_dd492f89-3693-42ec-881f-734aebd50c38/",
      rights: "NYC Municipal Archives; reproduction restrictions may apply",
      confidence: "Documented + inferred",
      facts: [
        "Exact parcel match: Manhattan Block 835, Lot 41",
        "Fifth Avenue base, storefront band, setbacks, and neighboring façades are source-locked",
        "Fine signs and surfaces outside the photograph are not treated as verified",
      ],
    },
    2024: {
      year: 2024,
      label: "Current",
      headline: "The Empire State Building today",
      referenceYear: "modern licensed photograph",
      image: "/chronowalk/empire-state-current.jpg",
      imageLabel: "Empire State Building from Fifth Avenue",
      sourceLabel: "Wikimedia Commons · Ad Meskens",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Empire_State_Building_from_5th.jpg",
      rights: "Creative Commons Attribution-ShareAlike 3.0",
      confidence: "Documented",
      facts: [
        "Landmark site: Manhattan Block 835, Lot 41",
        "Limestone façade, setbacks, window grid, mast, and avenue scale are source-locked",
        "Current city orthophotography supplies geographic context",
      ],
    },
  },
  "chrysler-building-portal": {
    1940: {
      year: 1940,
      label: "1940s",
      headline: "The Chrysler Building from Lexington Avenue",
      referenceYear: "1939–1941 tax photograph",
      image: "/chronowalk/chrysler-1940-tax-photo.jpg",
      imageLabel: "Chrysler Building tax photograph, circa 1940",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://nycrecords.access.preservica.com/uncategorized/IO_5f62637d-7bc4-4084-9000-07163f4387f1/",
      rights: "NYC Municipal Archives; reproduction restrictions may apply",
      confidence: "Documented + inferred",
      facts: [
        "Exact parcel match: Manhattan Block 1297, Lot 23",
        "Tower profile, stainless-steel crown, Lexington Avenue frontage, and street scale are source-locked",
        "Color and surfaces hidden by neighboring buildings remain restrained inferences",
      ],
    },
    1985: {
      year: 1985,
      label: "Mid-1980s",
      headline: "The Chrysler Building's Lexington Avenue base",
      referenceYear: "1983–1988 tax photograph",
      image: "/chronowalk/chrysler-1980-tax-photo.jpg",
      imageLabel: "395–413 Lexington Avenue tax photograph, mid-1980s",
      sourceLabel: "NYC Municipal Archives · Department of Finance Collection",
      sourceUrl:
        "https://nycrecords.access.preservica.com/uncategorized/IO_ee0b2da4-3301-46a3-aaf0-2e243959c2f3/",
      rights: "NYC Municipal Archives; reproduction restrictions may apply",
      confidence: "Documented + inferred",
      facts: [
        "Exact parcel match: Manhattan Block 1297, Lot 23",
        "Lexington Avenue base, structural bays, windows, entrances, and curb relationship are source-locked",
        "Fine signs and occluded tower surfaces are not treated as verified facts",
      ],
    },
    2024: {
      year: 2024,
      label: "Current",
      headline: "The Chrysler Building today",
      referenceYear: "modern licensed photograph",
      image: "/chronowalk/chrysler-current.jpg",
      imageLabel: "Chrysler Building from Lexington Avenue",
      sourceLabel: "Wikimedia Commons · Ad Meskens",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Chrysler_Building.jpg",
      rights: "Creative Commons Attribution-ShareAlike 3.0",
      confidence: "Documented",
      facts: [
        "Landmark site: Manhattan Block 1297, Lot 23",
        "Art Deco masonry, triangular windows, steel crown, spire, and avenue scale are source-locked",
        "Current city orthophotography supplies geographic context",
      ],
    },
  },
};

export function isChronoWalkYear(value: number): value is ChronoWalkYear {
  return CHRONOWALK_YEARS.includes(value as ChronoWalkYear);
}

export function getEvidence(cellId: string, year: ChronoWalkYear) {
  return CHRONOWALK_EVIDENCE[cellId]?.[year];
}

export function getCellsForYear(year: ChronoWalkYear) {
  return Object.values(CHRONOWALK_CELLS).filter((cell) =>
    Boolean(getEvidence(cell.id, year)),
  );
}

export function getDefaultCellForYear(year: ChronoWalkYear): ChronoWalkCell {
  if (getEvidence(DEFAULT_CELL_ID, year)) return CHRONOWALK_CELLS[DEFAULT_CELL_ID];
  return getCellsForYear(year)[0] ?? CHRONOWALK_CELLS[DEFAULT_CELL_ID];
}

export function exteriorExampleId(year: number, cellId = DEFAULT_CELL_ID) {
  return `chronowalk-exterior-${cellId}-${year}`;
}

export function exampleIdForRoute(
  year: number,
  _mode: ChronoWalkMode,
  cellId: string,
) {
  return exteriorExampleId(year, cellId);
}

function locationArchitecture(cell: ChronoWalkCell, year: ChronoWalkYear) {
  if (cell.id === "empire-state-portal") {
    if (year === 1940) {
      return `Use the supplied 1939–1941 municipal tax photograph as the primary visual authority for the Empire State Building and its exact tax lot. Preserve the limestone tower's full silhouette, stepped setbacks, vertical window bays, observation levels, mast, Fifth Avenue base, nearby rooflines, and street scale. Remove the surveyor and identification placard as capture artifacts. Do not introduce later towers, screens, storefronts, or vehicles.`;
    }
    if (year === 1985) {
      return `Use the supplied mid-1980s Department of Finance tax photograph as the primary authority for the Empire State Building's Fifth Avenue base. Preserve the structural bays, window grid, setbacks visible above the base, storefront proportions, curb alignment, neighboring façades, and street width. Keep unclear lettering indistinct and do not introduce present-day screens, storefronts, or street furniture.`;
    }
    return `Use the supplied licensed Fifth Avenue photograph as the primary architectural authority. Preserve the Empire State Building's limestone façade, exact stepped setbacks, vertical window rhythm, observation levels, mast, neighboring street-wall scale, and avenue perspective without duplication or morphing.`;
  }

  if (cell.id === "chrysler-building-portal") {
    if (year === 1940) {
      return `Use the supplied 1939–1941 municipal tax photograph as the primary visual authority for the Chrysler Building and its exact tax lot. Preserve the Lexington Avenue viewpoint, brick-and-stone tower profile, stepped setbacks, triangular crown windows, stainless-steel crown and spire, street wall, period signs, curb geometry, and neighboring silhouettes. Remove the survey identification strip as a capture artifact.`;
    }
    if (year === 1985) {
      return `Use the supplied mid-1980s Department of Finance tax photograph as the primary authority for the Chrysler Building's Lexington Avenue base. Preserve its structural bays, entrance geometry, window grid, setbacks, tower massing visible above, curb line, and neighboring street-wall scale. Keep unreadable signs indistinct and do not add current retail, screens, or street furniture.`;
    }
    return `Use the supplied licensed Lexington Avenue photograph as the primary architectural authority. Preserve the Chrysler Building's Art Deco masonry, exact setbacks, triangular windows, stainless-steel crown and spire, window rhythm, lower roofline, and avenue perspective without duplication or morphing.`;
  }

  if (cell.id === "flatiron-portal") {
    return `Use the supplied evidence photograph as the primary visual authority. Reconstruct the Flatiron Building from the same plaza-side viewpoint. Preserve its exact narrow triangular prow, limestone and glazed terra-cotta façade, continuous bay rhythm, window count and spacing, projecting cornice, crown, Broadway and Fifth Avenue edges, neighboring silhouettes, curb geometry, and intersection scale. The building was already complete in the selected era, so its fundamental shape must not modernize, widen, shorten, or morph.`;
  }

  if (cell.id === "penn-waiting-room-portal") {
    return `Use the supplied Library of Congress interior photograph as the architectural authority for the original Pennsylvania Station waiting room, which remained standing in the 1940s. Preserve the immense coffered barrel vault, travertine walls, Corinthian columns, tall arched windows, broad stairs, bronze globe lamps, polished stone floor, axial symmetry, and monumental scale. Do not introduce the present subterranean station or Madison Square Garden.`;
  }

  if (cell.id === "penn-exterior-portal") {
    return `Use the supplied Historic American Buildings Survey photograph as the architectural authority for the original Pennsylvania Station exterior, the same structure that occupied this site in the 1940s. Preserve the monumental stone colonnade, cornice, façade bays, openings, sidewalk line, and street scale. Remove capture-date vehicles, grime, and incidental details instead of treating them as 1940s facts. Do not introduce Madison Square Garden or later towers.`;
  }

  if (cell.id === "madison-square-garden-portal") {
    return year === 1985
      ? `Use the supplied exterior photograph only as a structural reference for Madison Square Garden, which already occupied this site in the mid-1980s. Preserve the circular arena massing, horizontal façade bands, entry geometry, structural columns, curb line, and relationship to Penn Station. Replace later signs, screens, storefront finishes, vehicles, and street furniture with restrained mid-1980s equivalents; never copy post-1985 details as historical fact.`
      : `Use the supplied licensed exterior photograph as the primary architectural authority. Preserve Madison Square Garden's circular massing, horizontal façade bands, entrance geometry, structural columns, signage zones, curb line, and surrounding building scale without duplication or morphing.`;
  }

  if (year === 1940) {
    return `Use the supplied circa-1940 municipal tax photograph as the primary visual authority. Reconstruct the same Broadway parcel and only the immediately visible street frontage. Preserve the source's masonry commercial façades, cornices, window count and spacing, storefront proportions, curb alignment, neighboring wall edges, and street width. The surveyor and identification placard are capture artifacts and must not be copied into the living scene. Do not invent neon canyons, skyscrapers, or buildings from other parts of Times Square.`;
  }
  if (year === 1985) {
    return `Use the supplied mid-1980s Department of Finance tax photograph as the primary visual authority. Preserve the visible corner-building massing, floor count, structural bays, window rhythm, storefront band, curb alignment, neighboring edges, and street width. Keep unclear lettering indistinct rather than inventing business names. Do not introduce Times Square Tower, which had not yet been built.`;
  }
  return `Use the supplied modern photograph as the primary architectural authority. Reproduce Times Square Tower's glass curtain wall, exposed diagonal steel bracing, façade proportions, corner geometry, and relationship to the sidewalk. Keep advertisements subordinate and do not invent or duplicate towers.`;
}

function exteriorScene(
  year: ChronoWalkYear,
  cell: ChronoWalkCell,
  evidence: ChronoWalkEvidence,
): StructuredScene {
  const viewpoint = cell.id === "penn-waiting-room-portal" ? "interior" : "street";
  return {
    base: {
      default: `A source-locked, photorealistic first-person reconstruction of ${cell.name} in Manhattan during ${evidence.label}. ${locationArchitecture(cell, year)} Architecture is the subject. The scene is quiet: no moving cars, buses, taxis, crowd, or foreground people. At most two small distant pedestrians and one parked period-appropriate vehicle may appear. Never spawn new people or vehicles as time passes. The explorable area is a six-metre evidence bubble centered on the source viewpoint. Hold all building edges, windows, signs, floor or curb lines, scale, and horizon rigidly stable while the camera looks or walks. Extrapolate only the smallest amount needed for that movement. No visible avatar, hands, body, dashboard, captions, interface, survey placard, temporal artifacts, or objects from after ${year}.`,
    },
    camera: {
      default: {
        static: `First-person eye-level view from the ${viewpoint} evidence viewpoint. The camera is still and level. Looking around reveals the same fixed, source-matched architecture without morphing, duplicates, or parallax errors.`,
        dynamic:
          "First-person eye-level walk at a slow measured pace, limited to six metres around the source viewpoint. Preserve a level horizon, exact architecture, continuous floor or curb lines, and the same relative scale throughout.",
      },
    },
    movement: {
      default: {
        static:
          "The viewer stands still. No person or vehicle enters the frame; only subtle ambient light may change.",
        dynamic:
          "The viewer walks slowly through clear space. No person or vehicle enters the path, and the architecture remains fixed to the reference.",
      },
    },
    events: [
      {
        name: "Clear the Scene",
        detail:
          "Remove all moving people and vehicles while keeping every architectural feature, sign, boundary, and surface unchanged.",
      },
      {
        name: "Architecture Hold",
        detail:
          "Freeze the exact building geometry and quiet composition; introduce no new objects, people, vehicles, or text.",
      },
      {
        name: "Soft Overcast",
        detail:
          "Shift to soft overcast daylight without changing architecture, signage, layout, population, or traffic.",
      },
    ],
    jumpPrompt:
      "The first-person camera makes a very small natural hop and returns to the same viewpoint; the source-matched world does not change.",
    crouchPrompt:
      "The first-person camera lowers slightly; all source-matched geometry remains fixed.",
    standPrompt:
      "The first-person camera returns smoothly to eye level; all source-matched geometry remains fixed.",
  };
}

function exteriorExample(
  year: ChronoWalkYear,
  cell: ChronoWalkCell,
  evidence: ChronoWalkEvidence,
): StructuredExample {
  return {
    id: exteriorExampleId(year, cell.id),
    name: `${evidence.label} · ${cell.name}`,
    description: `${cell.description} Source-locked reconstruction within a ${cell.radiusMeters} m evidence boundary.`,
    image: { label: evidence.imageLabel, src: evidence.image },
    provenance: {
      sourceLabel: evidence.sourceLabel,
      sourceUrl: evidence.sourceUrl,
      created: evidence.referenceYear,
      rights: evidence.rights,
    },
    scene: exteriorScene(year, cell, evidence),
  };
}

export const CHRONOWALK_WORLD_EXAMPLES: StructuredExample[] = Object.values(
  CHRONOWALK_CELLS,
).flatMap((cell) =>
  CHRONOWALK_YEARS.flatMap((year) => {
    const evidence = getEvidence(cell.id, year);
    return evidence ? [exteriorExample(year, cell, evidence)] : [];
  }),
);
