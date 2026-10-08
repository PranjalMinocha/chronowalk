"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LingbotWorld2MainVideoView,
  LingbotWorld2Provider,
  useLingbotWorld2,
} from "@reactor-models/lingbot-world-2";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { LingbotWorldController } from "@/components/lingbot-world-2/LingbotWorldController";
import { ChronoWalkWorldHUD } from "@/components/ChronoWalkWorldHUD";
import {
  CHRONOWALK_CELLS,
  DEFAULT_CELL_ID,
  exampleIdForRoute,
  getDefaultCellForYear,
  getEvidence,
  isChronoWalkYear,
  type ChronoWalkMode,
  type ChronoWalkYear,
} from "@/lib/chronowalk-worlds";

// Reactor Platform the SDK connects to. Override with
// NEXT_PUBLIC_REACTOR_API_URL in .env.local if you need a different one.
const API_URL =
  process.env.NEXT_PUBLIC_REACTOR_API_URL ?? "https://api.reactor.inc";

// JWT resolver passed to <LingbotWorld2Provider jwtToken>.
//
// `@reactor-team/js-sdk` 3.x takes a `JwtSource` — a static string or a
// resolver. Pass the resolver so the SDK can mint a fresh JWT on every
// Reactor API hop — uploads, clip manifests, ICE refreshes, SDP
// renegotiation. With a static string those hops 401 the moment the
// token ages out.
//
// The token is memoized HERE, in module scope, until shortly before it
// expires — and the fetch itself is `no-store`, so the browser HTTP
// cache is out of the picture. This matters because the token is
// session-scoped: a session can only be operated by the exact token
// that created it, so every hop of a session must present the same JWT.
// Relying on the browser cache for that breaks the moment it misses
// (DevTools "Disable cache", cache eviction): the resolver then mints a
// fresh token with no bound sessions and every upload/clip call 403s.
//
// Known edge this does not cover: a session created just before the
// memoized token expires is orphaned at the re-mint (the fresh token
// isn't bound to it). Fixing that requires re-minting with
// `authorization_details.resources.sessions.bind` naming the live
// session.
const TOKEN_REFRESH_SKEW_MS = 60_000;
let cachedToken: { jwt: string; expiresAtMs: number } | null = null;
let inflightToken: Promise<string> | null = null;
let inflightConnection: Promise<void> | null = null;

async function fetchToken(): Promise<string> {
  if (
    cachedToken &&
    Date.now() < cachedToken.expiresAtMs - TOKEN_REFRESH_SKEW_MS
  ) {
    return cachedToken.jwt;
  }
  // Coalesce the parallel hops the SDK fires at connect time into one mint.
  if (inflightToken) return inflightToken;
  inflightToken = (async () => {
    try {
      const r = await fetch("/api/reactor/token", { cache: "no-store" });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Token fetch failed: ${r.status}`);
      }
      const { jwt, expires_at } = (await r.json()) as {
        jwt: string;
        expires_at: number;
      };
      cachedToken = { jwt, expiresAtMs: expires_at * 1000 };
      return jwt;
    } finally {
      inflightToken = null;
    }
  })();
  return inflightToken;
}

function isCredentialOrSessionLimitError(error: unknown) {
  const candidate = error as {
    code?: string;
    status?: number;
    message?: string;
  };
  const detail = `${candidate.code ?? ""} ${candidate.message ?? ""}`.toLowerCase();
  return (
    candidate.status === 401 ||
    candidate.status === 403 ||
    detail.includes("unauthorized") ||
    detail.includes("forbidden") ||
    detail.includes("max_sessions") ||
    detail.includes("session limit")
  );
}

function isCapacityError(error: unknown) {
  const candidate = error as {
    code?: string;
    status?: number;
    recoverable?: boolean;
    message?: string;
  };
  const detail = `${candidate.code ?? ""} ${candidate.message ?? ""}`.toLowerCase();
  return (
    candidate.status === 429 ||
    detail.includes("no available capacity") ||
    detail.includes("rate limit") ||
    (candidate.recoverable === true && detail.includes("session"))
  );
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

async function connectWithFreshTokenRetry(
  connect: (jwt?: typeof fetchToken) => Promise<void>,
) {
  if (inflightConnection) return inflightConnection;

  inflightConnection = (async () => {
    let refreshedCredentials = false;
    const capacityDelays = [4_000, 6_000, 8_000, 10_000];

    for (let attempt = 0; ; attempt += 1) {
      try {
        await connect(refreshedCredentials ? fetchToken : undefined);
        return;
      } catch (error) {
        if (!refreshedCredentials && isCredentialOrSessionLimitError(error)) {
          cachedToken = null;
          inflightToken = null;
          refreshedCredentials = true;
          continue;
        }

        if (isCapacityError(error) && attempt < capacityDelays.length) {
          await wait(capacityDelays[attempt]);
          continue;
        }
        throw error;
      }
    }
  })();

  try {
    await inflightConnection;
  } finally {
    inflightConnection = null;
  }
}

function StatusBar() {
  const { status, connect, disconnect, reset, lastError } = useLingbotWorld2();
  const [manualError, setManualError] = useState<string | null>(null);
  const [isSettlingAfterDisconnect, setIsSettlingAfterDisconnect] =
    useState(false);

  const handleConnect = async () => {
    setManualError(null);
    try {
      await connectWithFreshTokenRetry(connect);
    } catch (error) {
      setManualError(
        error instanceof Error ? error.message : "Unable to connect to Reactor.",
      );
    }
  };

  const handleDisconnect = async () => {
    setIsSettlingAfterDisconnect(true);
    try {
      await disconnect();
    } finally {
      // The SDK publishes `disconnected` slightly before its session teardown
      // is fully settled. Keep Connect unavailable during that short window so
      // an eager click cannot be swallowed by the closing session.
      await wait(750);
      setIsSettlingAfterDisconnect(false);
    }
  };

  const dotColor =
    status === "ready"
      ? "#4ade80"
      : status === "connecting" || status === "waiting"
        ? "#facc15"
        : "rgba(255,255,255,0.3)";

  const statusLabel =
    isSettlingAfterDisconnect
      ? "Closing session..."
      : status === "ready"
      ? "Connected"
      : status === "waiting"
        ? "Waiting for GPU..."
        : status === "connecting"
          ? "Connecting..."
          : "Disconnected";

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-4 px-4 py-1.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              backgroundColor: dotColor,
              animation:
                status === "connecting" || status === "waiting"
                  ? "statusPulse 1.5s infinite"
                  : "none",
            }}
          />
          <span className="font-mono text-[11px] text-white/55">{statusLabel}</span>
        </div>
        {status === "disconnected" && (manualError || lastError?.message) && (
          <span className="max-w-[55vw] truncate font-mono text-[10px] text-red-300/80">
            {manualError || lastError?.message}
          </span>
        )}
        {status === "disconnected" && !isSettlingAfterDisconnect ? (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => void handleConnect()}
            className="h-7 px-3 font-mono text-xs bg-white/10 border-white/15 hover:bg-white/15 text-white"
          >
            Connect
          </Button>
        ) : (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => void handleDisconnect()}
            disabled={isSettlingAfterDisconnect}
            className="h-7 px-3 font-mono text-xs bg-white/10 border-white/15 hover:bg-white/15 text-white"
          >
            {isSettlingAfterDisconnect
              ? "Closing..."
              : status === "connecting" || status === "waiting"
              ? "Cancel"
              : "Disconnect"}
          </Button>
        )}
        {status === "ready" && (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => reset()}
            className="h-7 px-3 font-mono text-xs bg-red-500/15 border-red-500/20 hover:bg-red-500/25 text-red-400"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

function MainContent() {
  const { status, connect } = useLingbotWorld2();
  const [route, setRoute] = useState<{
    year: ChronoWalkYear;
    mode: ChronoWalkMode;
    cellId: string;
  }>({ year: 1940, mode: "exterior", cellId: DEFAULT_CELL_ID });
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    isPaused: false,
    activeAction: "still",
  });
  // Remember the specific era we auto-connected, not just whether any attempt
  // happened. This allows an in-place URL change to a different era while still
  // preventing a manual disconnect from immediately reconnecting the same one.
  const autoConnectedExampleRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedYear = Number(params.get("year"));
    const year = isChronoWalkYear(parsedYear) ? parsedYear : 1940;
    const requestedCell = params.get("cell") ?? DEFAULT_CELL_ID;
    const cellId =
      CHRONOWALK_CELLS[requestedCell] && getEvidence(requestedCell, year)
        ? requestedCell
        : getDefaultCellForYear(year).id;
    setRoute({ year, mode: "exterior", cellId });
    setShouldAutoStart(params.has("year"));
  }, []);

  const selectedExampleId = exampleIdForRoute(
    route.year,
    route.mode,
    route.cellId,
  );
  const autoApplyExampleId = shouldAutoStart ? selectedExampleId : undefined;

  useEffect(() => {
    if (!autoApplyExampleId || status !== "disconnected") return;
    if (autoConnectedExampleRef.current === autoApplyExampleId) return;
    autoConnectedExampleRef.current = autoApplyExampleId;
    void connectWithFreshTokenRetry(connect).catch(() => {
      // The SDK exposes the actionable error through lastError in StatusBar.
    });
  }, [autoApplyExampleId, status, connect]);

  const visibleExampleIds = useMemo(
    () => [selectedExampleId],
    [selectedExampleId],
  );

  const handleGenerationStateChange = useCallback(
    (next: {
      isGenerating: boolean;
      isPaused: boolean;
      activeAction: string;
    }) => setGenerationState(next),
    [],
  );

  const { sidebar, controls } = LingbotWorldController({
    autoApplyExampleId,
    visibleExampleIds,
    onGenerationStateChange: handleGenerationStateChange,
  });

  return (
    <main className="relative z-10 flex min-h-0 flex-1 p-2 sm:p-3">
      <div className="relative mx-auto h-full min-h-0 w-full max-w-[1920px] overflow-hidden rounded-xl border border-white/[0.1] bg-black shadow-2xl">
        <LingbotWorld2MainVideoView
          videoObjectFit="contain"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
        <ChronoWalkWorldHUD
          key={`${route.cellId}-${route.year}`}
          year={route.year}
          cellId={route.cellId}
          isRunning={
            generationState.isGenerating && !generationState.isPaused
          }
          activeAction={generationState.activeAction}
          transitioning={false}
        />

        <details className="group absolute right-3 top-3 z-30 max-h-[calc(100%-1.5rem)] w-[min(360px,calc(100%-1.5rem))] overflow-hidden rounded-lg border border-white/15 bg-zinc-950/90 text-white shadow-2xl backdrop-blur-xl">
          <summary className="cursor-pointer list-none px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition hover:text-white">
            <span className="flex items-center justify-between">
              Controls & evidence
              <span className="text-amber-200 transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto border-t border-white/10 p-3">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
              {sidebar}
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
              {controls}
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}

// The client tree. LingbotWorld2Provider owns the WebRTC connection
// lifecycle — it auto-disconnects on unmount and on `beforeunload`, so
// don't call connect()/disconnect() from a useEffect yourself.
//
// We deliberately do NOT pass provider-level `autoConnect: true` here. A dated
// ChronoWalk route connects from MainContent after its evidence example has
// been selected; an undated /lab route stays idle for manual experimentation.
//
// `getJwt` is a module-level function on purpose — stable identity, no
// re-render churn. The provider also auto-stabilizes inline arrows via
// `useRef + useMemo`, so wrapping in `useCallback` is never needed.
export function LingbotWorld2App() {
  return (
    <>
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
      `}</style>

      <div className="relative h-screen flex flex-col overflow-hidden bg-zinc-950">
        <Header />
        <LingbotWorld2Provider apiUrl={API_URL} jwtToken={fetchToken}>
          <div className="relative z-10 shrink-0">
            <StatusBar />
          </div>
          <MainContent />
        </LingbotWorld2Provider>
      </div>
    </>
  );
}
