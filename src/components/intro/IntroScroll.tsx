import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const SPRITES = [
  "apple",
  "banana",
  "biscuit",
  "bread",
  "broccoli",
  "bubble-tea",
  "carrot",
  "cheesecake",
  "chicken",
  "eggs",
  "fish",
  "watermelon",
];

type SpriteParams = {
  delay: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  midRot: number;
  endRot: number;
  scale: number;
};

function buildSpriteParams(count: number, viewportH: number): SpriteParams[] {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * 0.55;
    const angle = baseAngle + jitter;
    const distance = 240 + Math.random() * 200;
    const midX = Math.cos(angle) * distance;
    const midY = Math.sin(angle) * distance - 90;
    const endX = Math.cos(angle) * distance * 1.5 + (Math.random() - 0.5) * 60;
    const endY = viewportH * 0.7 + Math.random() * 250;
    const rotDir = Math.random() < 0.5 ? -1 : 1;
    const midRot = rotDir * (60 + Math.random() * 140);
    const endRot = rotDir * (340 + Math.random() * 360);
    const scale = 0.85 + Math.random() * 0.4;
    const delay = Math.random() * 0.12;
    return { delay, midX, midY, endX, endY, midRot, endRot, scale };
  });
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function IntroScroll() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [svgs, setSvgs] = useState<Record<string, string>>({});
  const spriteParams = useMemo(
    () =>
      buildSpriteParams(
        SPRITES.length,
        typeof window !== "undefined" ? window.innerHeight : 800,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SPRITES.map((name) =>
        fetch(`/intro/${name}.svg`)
          .then((r) => r.text())
          .then((text) => [name, text] as const),
      ),
    ).then((pairs) => {
      if (!cancelled) setSvgs(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    const compute = () => {
      const spacer = spacerRef.current;
      if (!spacer) return;
      const viewportH = window.innerHeight;
      const spacerHeight = spacer.offsetHeight;
      const scrollDist = Math.max(1, spacerHeight - viewportH);
      // Unclamped at the top so the fade can run past progress=1, into the
      // range where the hero is actually entering the viewport.
      const p = Math.max(0, window.scrollY / scrollDist);
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Animation runs over the first ~55% of scroll-through, then settles.
  // The cross-fade overlaps with the tail of the animation and continues
  // past progress=1 so the hero photo can bleed in under it.
  const animP = Math.min(1, progress / 0.55);
  const fadeP = Math.max(0, Math.min(1, (progress - 0.5) / (1.55 - 0.5)));
  const overlayOpacity = 1 - fadeP;

  const logoScale = (() => {
    if (animP < 0.18) return lerp(0.72, 1.0, easeOutCubic(animP / 0.18));
    if (animP < 0.62) return 1.0;
    return lerp(1.0, 1.25, easeOutCubic((animP - 0.62) / 0.38));
  })();

  const logoRot = (() => {
    if (animP < 0.18 || animP > 0.32) return 0;
    const t = (animP - 0.18) / 0.14;
    return Math.sin(t * Math.PI * 2) * 5;
  })();

  const wordmarkOpacity = (() => {
    if (animP < 0.55) return 0;
    if (animP > 0.78) return 1;
    return (animP - 0.55) / 0.23;
  })();

  const wordmarkY = (() => {
    if (animP < 0.55) return 12;
    if (animP > 0.78) return 0;
    return lerp(12, 0, (animP - 0.55) / 0.23);
  })();

  const scrollHintOpacity = Math.max(0, 1 - progress * 5);

  return (
    <>
      <div
        ref={spacerRef}
        className="h-[260vh]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-cream-50"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-100/40 blur-3xl" />

        {/* Sprite emitter rendered BEFORE the logo so sprites paint behind
            the logo + wordmark — they appear to spill out from behind it. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
          {SPRITES.map((name, i) => {
            const params = spriteParams[i];
            const sp = Math.max(
              0,
              Math.min(1, (animP - params.delay) / (1 - params.delay)),
            );

            let x = 0;
            let y = 0;
            let rot = 0;
            let scale = 0;

            if (sp > 0) {
              if (sp < 0.35) {
                const t = sp / 0.35;
                const eased = easeOutCubic(t);
                x = lerp(0, params.midX, eased);
                y = lerp(0, params.midY, eased);
                rot = lerp(0, params.midRot, eased);
                scale = lerp(0, params.scale, Math.sqrt(t));
              } else {
                const t = (sp - 0.35) / 0.65;
                const eased = easeInCubic(t);
                x = lerp(params.midX, params.endX, eased);
                y = lerp(params.midY, params.endY, eased);
                rot = lerp(params.midRot, params.endRot, t);
                scale = params.scale;
              }
            }

            const opacity =
              sp <= 0
                ? 0
                : sp > 0.88
                  ? lerp(1, 0.6, (sp - 0.88) / 0.12)
                  : 1;

            const style: CSSProperties = {
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg) scale(${scale})`,
              opacity,
              transformOrigin: "center",
              willChange: "transform, opacity",
            };

            const markup = svgs[name];
            if (!markup) return null;

            return (
              <div
                key={name}
                className="absolute left-0 top-0 h-16 w-16 md:h-24 md:w-24 [&>svg]:h-full [&>svg]:w-full"
                style={style}
                dangerouslySetInnerHTML={{ __html: markup }}
              />
            );
          })}
        </div>

        {/* Logo + wordmark, painted on top of the sprites */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <img
              src="/favicon.svg"
              alt=""
              className="h-32 w-32 md:h-40 md:w-40"
              style={{
                transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
                transformOrigin: "center",
                filter: "drop-shadow(0 6px 28px rgba(196, 80, 42, 0.22))",
                willChange: "transform",
              }}
            />
            <div
              className="absolute left-1/2 top-full mt-6 whitespace-nowrap text-3xl font-semibold tracking-tight text-ember-700 md:text-4xl"
              style={{
                opacity: wordmarkOpacity,
                transform: `translateX(-50%) translateY(${wordmarkY}px)`,
              }}
            >
              Necipies
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-ember-700/60"
          style={{ opacity: scrollHintOpacity }}
        >
          scroll ↓
        </div>
      </div>
    </>
  );
}
