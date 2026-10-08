"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import {
  CHRONOWALK_CELLS,
  CHRONOWALK_YEARS,
  DEFAULT_CELL_ID,
  getCellsForYear,
  getEvidence,
  type ChronoWalkYear,
} from "@/lib/chronowalk-worlds";

const INITIAL_CENTER = { latitude: 40.7483, longitude: -73.9845 };
const INITIAL_ZOOM = 14;
const TILE_SIZE = 256;
const GRID_RADIUS = 3;
const MIN_ZOOM = 13;
const MAX_ZOOM = 18;
const ERA_LABELS: Record<ChronoWalkYear, string> = {
  1940: "1940s",
  1985: "Mid-1980s",
  2024: "Current",
};

type Survey = {
  year: ChronoWalkYear;
  provider: "nyc-tiles" | "arcgis";
  service: string;
};

// Capture-year details intentionally stay in this implementation layer. The
// interface presents a coherent experience era and calls the imagery "context"
// rather than falsely labeling an individual aerial capture.
const SURVEYS: Survey[] = [
  { year: 1940, provider: "nyc-tiles", service: "1951" },
  { year: 1985, provider: "nyc-tiles", service: "1996" },
  { year: 2024, provider: "arcgis", service: "NYC_Orthos_2024" },
];

type MapCenter = { latitude: number; longitude: number };
type Tile = { x: number; y: number; left: number; top: number };

function longitudeToTileX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude: number, zoom: number) {
  const radians = (latitude * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
      2) *
    2 ** zoom
  );
}

function tileXToLongitude(tileX: number, zoom: number) {
  return (tileX / 2 ** zoom) * 360 - 180;
}

function tileYToLatitude(tileY: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * tileY) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

function buildTileGrid(center: MapCenter, zoom: number): Tile[] {
  const centerX = longitudeToTileX(center.longitude, zoom);
  const centerY = latitudeToTileY(center.latitude, zoom);
  const originX = Math.floor(centerX);
  const originY = Math.floor(centerY);
  const tiles: Tile[] = [];

  for (let xOffset = -GRID_RADIUS; xOffset <= GRID_RADIUS; xOffset += 1) {
    for (let yOffset = -GRID_RADIUS; yOffset <= GRID_RADIUS; yOffset += 1) {
      const x = originX + xOffset;
      const y = originY + yOffset;
      tiles.push({
        x,
        y,
        left: Math.round((x - centerX) * TILE_SIZE),
        top: Math.round((y - centerY) * TILE_SIZE),
      });
    }
  }
  return tiles;
}

function getTileUrl(survey: Survey, tile: Tile, zoom: number) {
  if (survey.provider === "nyc-tiles") {
    return `https://maps.nyc.gov/xyz/1.0.0/photo/${survey.service}/${zoom}/${tile.x}/${tile.y}.png8`;
  }
  return `https://tiles.arcgis.com/tiles/yG5s3afENB5iO9fj/arcgis/rest/services/${survey.service}/MapServer/tile/${zoom}/${tile.y}/${tile.x}`;
}

function TileLayer({
  survey,
  center,
  zoom,
}: {
  survey: Survey;
  center: MapCenter;
  zoom: number;
}) {
  const tiles = useMemo(
    () => buildTileGrid(center, zoom),
    [center, zoom],
  );

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {tiles.map((tile) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${survey.year}-${zoom}-${tile.x}-${tile.y}`}
          src={getTileUrl(survey, tile, zoom)}
          alt=""
          draggable={false}
          className="absolute h-64 w-64 max-w-none select-none"
          style={{
            left: `calc(50% + ${tile.left}px)`,
            top: `calc(50% + ${tile.top}px)`,
          }}
        />
      ))}
    </div>
  );
}

function pinOffset(cellId: string, center: MapCenter, zoom: number) {
  const cell = CHRONOWALK_CELLS[cellId];
  return {
    x: Math.round((
      (longitudeToTileX(cell.longitude, zoom) -
        longitudeToTileX(center.longitude, zoom)) *
      TILE_SIZE) * 100) / 100,
    y: Math.round((
      (latitudeToTileY(cell.latitude, zoom) -
        latitudeToTileY(center.latitude, zoom)) *
      TILE_SIZE) * 100) / 100,
  };
}

export function ChronoWalkLanding({ hasReactorKey }: { hasReactorKey: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCellId, setSelectedCellId] = useState(DEFAULT_CELL_ID);
  const [center, setCenter] = useState<MapCenter>(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const dragPointRef = useRef<{ x: number; y: number } | null>(null);

  const selectedSurvey = SURVEYS[selectedIndex];
  const selectedCell = CHRONOWALK_CELLS[selectedCellId];
  const visibleCells = getCellsForYear(selectedSurvey.year);
  const evidence =
    getEvidence(selectedCellId, selectedSurvey.year) ??
    getEvidence(DEFAULT_CELL_ID, selectedSurvey.year)!;

  const panMap = (dx: number, dy: number) => {
    setCenter((previous) => {
      const worldX =
        longitudeToTileX(previous.longitude, zoom) - dx / TILE_SIZE;
      const worldY =
        latitudeToTileY(previous.latitude, zoom) - dy / TILE_SIZE;
      return {
        longitude: tileXToLongitude(worldX, zoom),
        latitude: tileYToLatitude(worldY, zoom),
      };
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = dragPointRef.current;
    if (!previous) return;
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    dragPointRef.current = { x: event.clientX, y: event.clientY };
    panMap(dx, dy);
  };

  const stopDragging = () => {
    dragPointRef.current = null;
    setIsDragging(false);
  };

  const selectCell = (cellId: string) => {
    setSelectedCellId(cellId);
    const cell = CHRONOWALK_CELLS[cellId];
    setCenter({ latitude: cell.latitude, longitude: cell.longitude });
    setZoom(16);
  };

  const selectEra = (index: number) => {
    const nextYear = SURVEYS[index].year;
    setSelectedIndex(index);
    if (!getEvidence(selectedCellId, nextYear)) {
      const nextCell = getCellsForYear(nextYear)[0];
      if (nextCell) setSelectedCellId(nextCell.id);
    }
    setCenter(INITIAL_CENTER);
    setZoom(INITIAL_ZOOM);
  };

  const fitBoth = () => {
    setCenter(INITIAL_CENTER);
    setZoom(INITIAL_ZOOM);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080907] text-[#f4f0e6]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(214,173,86,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(72,111,87,0.12),transparent_28%)]" />

      <header className="relative z-20 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[#d6ad56]/50 bg-[#d6ad56]/10 font-serif text-lg text-[#e6c77f]">
            C
          </div>
          <div>
            <p className="font-serif text-lg tracking-wide">ChronoWalk</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              Navigate Manhattan through time
            </p>
          </div>
        </div>
        <div className="rounded-full border border-emerald-200/20 bg-emerald-200/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100/70">
          {visibleCells.length} image portals this era
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-74px)] max-w-[1600px] grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.72fr)]">
        <div
          role="application"
          aria-label="Navigable historical aerial map of Manhattan"
          className={`relative min-h-[62vh] touch-none overflow-hidden border-b border-white/10 lg:min-h-0 lg:border-b-0 lg:border-r ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <TileLayer
            key={`${selectedSurvey.year}-${zoom}`}
            survey={selectedSurvey}
            center={center}
            zoom={zoom}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

          <div className="absolute left-4 top-4 z-20 rounded-md border border-white/15 bg-black/75 px-3 py-2 backdrop-blur-md sm:left-6 sm:top-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e6c77f]">
              Manhattan portal map
            </p>
            <p className="mt-1 text-xs text-white/55">
              Drag to pan · choose a pin · enter its world
            </p>
          </div>

          <div
            className="absolute right-4 top-4 z-30 flex flex-col gap-2 sm:right-6 sm:top-6"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(value + 1, MAX_ZOOM))}
              className="grid h-9 w-9 place-items-center rounded border border-white/15 bg-black/75 text-lg text-white/75 backdrop-blur hover:bg-black"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(value - 1, MIN_ZOOM))}
              className="grid h-9 w-9 place-items-center rounded border border-white/15 bg-black/75 text-lg text-white/75 backdrop-blur hover:bg-black"
            >
              −
            </button>
            <button
              type="button"
              onClick={fitBoth}
              className="rounded border border-white/15 bg-black/75 px-2 py-2 font-mono text-[8px] uppercase tracking-wider text-white/60 backdrop-blur hover:bg-black hover:text-white"
            >
              Fit pins
            </button>
          </div>

          {visibleCells.map((cell) => {
            const offset = pinOffset(cell.id, center, zoom);
            const isSelected = cell.id === selectedCellId;
            return (
              <button
                key={cell.id}
                type="button"
                aria-label={`Select ${cell.name} entrance`}
                aria-pressed={isSelected}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => selectCell(cell.id)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${offset.x}px)`,
                  top: `calc(50% + ${offset.y}px)`,
                }}
              >
                <span
                  className={`relative grid h-10 w-10 place-items-center rounded-full border shadow-[0_0_0_7px_rgba(230,199,127,0.08),0_0_28px_rgba(230,199,127,0.3)] backdrop-blur-sm transition ${
                    isSelected
                      ? "scale-110 border-[#f2d890] bg-[#d6ad56]/30"
                      : "border-white/45 bg-black/55 hover:scale-105 hover:border-[#f2d890]"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f2d890] shadow-[0_0_15px_#f2d890]" />
                </span>
                <span
                  className={`mt-1.5 block whitespace-nowrap rounded bg-black/85 px-1.5 py-1 font-mono text-[8px] uppercase tracking-wider text-[#f2d890] ${
                    cell.id === "penn-waiting-room-portal"
                      ? "-translate-x-1/2"
                      : cell.id === "penn-exterior-portal"
                        ? "translate-x-1/2"
                        : ""
                  }`}
                >
                  {cell.shortName}
                </span>
              </button>
            );
          })}

          <div
            className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-black/82 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-end justify-between gap-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                    Experience era
                  </p>
                  <p className="mt-1 font-serif text-3xl text-[#f2d890]">
                    {evidence.label}
                  </p>
                </div>
                <p className="text-right text-xs leading-relaxed text-white/45">
                  Historical aerial context · source-locked street portal
                </p>
              </div>
              <input
                aria-label="Historical era"
                aria-valuetext={evidence.label}
                type="range"
                min="0"
                max={SURVEYS.length - 1}
                step="1"
                value={selectedIndex}
                onChange={(event) => selectEra(Number(event.target.value))}
                className="chrono-slider w-full"
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {CHRONOWALK_YEARS.map((year, index) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectEra(index)}
                    aria-pressed={index === selectedIndex}
                    className={`rounded border px-2 py-2 font-mono text-[10px] transition ${
                      index === selectedIndex
                        ? "border-[#e6c77f]/70 bg-[#e6c77f]/15 text-[#f2d890]"
                        : "border-white/10 bg-white/[0.03] text-white/40 hover:border-white/25 hover:text-white/70"
                    }`}
                  >
                    {ERA_LABELS[year]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#d6ad56]">
              Selected entrance · {selectedCell.bbl}
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.94] tracking-[-0.03em]">
              {selectedCell.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/52">
              {selectedCell.description}
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-white/12 bg-white/[0.03]">
              <div className="relative h-44 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${selectedCellId}-${evidence.year}`}
                  src={evidence.image}
                  alt={evidence.imageLabel}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-4 pb-3 pt-10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#f2d890]">
                    Primary street evidence
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    {evidence.referenceYear}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-[#f2d890]">
                      {evidence.headline}
                    </p>
                    <p className="mt-1 text-[11px] text-white/45">
                      {evidence.sourceLabel}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-200/20 bg-emerald-200/5 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-emerald-100/70">
                    {evidence.confidence}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[11px] leading-5 text-white/50">
                  {evidence.facts.map((fact) => (
                    <li key={fact} className="flex gap-2">
                      <span className="text-[#d6ad56]">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <a
              href={`/lab?year=${evidence.year}&mode=exterior&cell=${selectedCell.id}`}
              className="group flex w-full items-center justify-between rounded-lg bg-[#e6c77f] px-5 py-4 text-sm font-semibold text-[#17150f] transition hover:bg-[#f3dc9a]"
            >
              <span>
                {hasReactorKey
                  ? `Enter ${selectedCell.shortName} · ${evidence.label}`
                  : "Configure Reactor to enter"}
              </span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <div className="mt-3 flex items-center justify-between gap-4 text-[10px] text-white/35">
              <span>6 m evidence boundary · quiet street mode</span>
              <a
                href={evidence.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 underline decoration-white/20 underline-offset-4 hover:text-white/60"
              >
                Open source
              </a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
