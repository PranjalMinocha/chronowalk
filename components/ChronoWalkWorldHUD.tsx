"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHRONOWALK_CELLS,
  DEFAULT_CELL_ID,
  getEvidence,
  type ChronoWalkYear,
} from "@/lib/chronowalk-worlds";

const METERS_PER_DEGREE_LATITUDE = 111_320;
const WALK_SPEED_METERS_PER_SECOND = 1.1;
const TURN_SPEED_DEGREES_PER_SECOND = 48;

type LocalPosition = { east: number; north: number };

function coordinateFromLocal(
  latitude: number,
  longitude: number,
  position: LocalPosition,
) {
  return {
    latitude: latitude + position.north / METERS_PER_DEGREE_LATITUDE,
    longitude:
      longitude +
      position.east /
        (METERS_PER_DEGREE_LATITUDE * Math.cos((latitude * Math.PI) / 180)),
  };
}

export function ChronoWalkWorldHUD({
  year,
  cellId,
  isRunning,
  activeAction,
  transitioning,
}: {
  year: ChronoWalkYear;
  cellId: string;
  isRunning: boolean;
  activeAction: string;
  transitioning: boolean;
}) {
  const cell = CHRONOWALK_CELLS[cellId] ?? CHRONOWALK_CELLS[DEFAULT_CELL_ID];
  const evidence =
    getEvidence(cell.id, year) ?? getEvidence(DEFAULT_CELL_ID, 1940)!;
  const [position, setPosition] = useState<LocalPosition>({ east: 0, north: 0 });
  const [heading, setHeading] = useState(cell.initialHeading);
  const [atBoundary, setAtBoundary] = useState(false);
  const positionRef = useRef(position);
  const headingRef = useRef(heading);
  const keysRef = useRef(new Set<string>());

  useEffect(() => {
    positionRef.current = { east: 0, north: 0 };
    headingRef.current = cell.initialHeading;
    keysRef.current.clear();
    setPosition({ east: 0, north: 0 });
    setHeading(cell.initialHeading);
    setAtBoundary(false);
  }, [cell.id, cell.initialHeading, year]);

  useEffect(() => {
    const shouldIgnore = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return Boolean(
        element?.closest("input, textarea, select, [contenteditable='true']"),
      );
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldIgnore(event.target)) keysRef.current.add(event.key.toLowerCase());
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };
    const clear = () => keysRef.current.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    if (!isRunning || transitioning) return;
    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const keys = keysRef.current;

      let nextHeading = headingRef.current;
      if (keys.has("arrowleft")) {
        nextHeading -= TURN_SPEED_DEGREES_PER_SECOND * deltaSeconds;
      }
      if (keys.has("arrowright")) {
        nextHeading += TURN_SPEED_DEGREES_PER_SECOND * deltaSeconds;
      }
      nextHeading = (nextHeading + 360) % 360;
      if (nextHeading !== headingRef.current) {
        headingRef.current = nextHeading;
        setHeading(nextHeading);
      }

      const actions = new Set(
        activeAction.toLowerCase().split(/[^a-z]+/).filter(Boolean),
      );
      const forward =
        (keys.has("w") || actions.has("w") ? 1 : 0) -
        (keys.has("s") || actions.has("s") ? 1 : 0);
      const strafe =
        (keys.has("d") || actions.has("d") ? 1 : 0) -
        (keys.has("a") || actions.has("a") ? 1 : 0);

      if (forward !== 0 || strafe !== 0) {
        const headingRadians = (nextHeading * Math.PI) / 180;
        const length = Math.hypot(forward, strafe) || 1;
        const distance = (WALK_SPEED_METERS_PER_SECOND * deltaSeconds) / length;
        const next = {
          east:
            positionRef.current.east +
            (Math.sin(headingRadians) * forward +
              Math.cos(headingRadians) * strafe) *
              distance,
          north:
            positionRef.current.north +
            (Math.cos(headingRadians) * forward -
              Math.sin(headingRadians) * strafe) *
              distance,
        };
        const distanceFromCenter = Math.hypot(next.east, next.north);
        const scale =
          distanceFromCenter > cell.radiusMeters
            ? cell.radiusMeters / distanceFromCenter
            : 1;
        const bounded = { east: next.east * scale, north: next.north * scale };
        positionRef.current = bounded;
        setPosition(bounded);
        setAtBoundary(distanceFromCenter >= cell.radiusMeters * 0.92);
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeAction, cell.radiusMeters, isRunning, transitioning]);

  const coordinate = useMemo(
    () => coordinateFromLocal(cell.latitude, cell.longitude, position),
    [cell.latitude, cell.longitude, position],
  );
  const distance = Math.hypot(position.east, position.north);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-mono">
      <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-full border border-amber-200/20 bg-black/72 px-4 py-2 text-white shadow-xl backdrop-blur-md">
        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(253,230,138,0.9)]" />
        <div className="min-w-0">
          <p className="truncate text-[11px] text-white/90">{cell.name}</p>
          <p className="text-[8px] uppercase tracking-[0.16em] text-white/40">
            {evidence.label} · {distance.toFixed(1)} / {cell.radiusMeters} m · {Math.round(heading)}°
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2 py-1 text-[8px] uppercase tracking-wider text-emerald-100/75">
          {evidence.confidence}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/62 px-3 py-1.5 text-[8px] text-white/45 backdrop-blur-md">
        {coordinate.latitude.toFixed(5)}° N · {Math.abs(coordinate.longitude).toFixed(5)}° W · WASD move · arrows look
      </div>

      {atBoundary && (
        <p className="absolute bottom-3 right-3 max-w-xs rounded-full border border-amber-200/20 bg-black/72 px-3 py-1.5 text-[9px] text-amber-100 backdrop-blur-md">
          6 m evidence boundary reached
        </p>
      )}

      {transitioning && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
            <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-amber-100">
              Anchoring source-locked world
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
