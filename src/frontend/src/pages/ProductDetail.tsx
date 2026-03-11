import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Link, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useListingById } from "../hooks/useQueries";
import {
  brandGradient,
  calcHealthScore,
  conditionColors,
  formatINR,
} from "../utils/format";

const VIEW_LABELS = ["Front", "Back", "Side L", "Side R"];

function CircularProgress({ value }: { value: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const dashOffset = circ - (progress / 100) * circ;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90" aria-hidden="true">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="oklch(0.22 0 0)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="oklch(0.88 0.17 168)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-black text-2xl text-primary">
          {progress}
        </div>
        <div className="text-xs text-muted-foreground">Health</div>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams({ from: "/listing/$id" });
  const { data: listing, isLoading } = useListingById(BigInt(id));
  const [viewIndex, setViewIndex] = useState(0);
  const [flawFinder, setFlawFinder] = useState(false);
  const dragStart = useRef<number | null>(null);

  if (isLoading) {
    return (
      <div data-ocid="product.page" className="min-h-screen pt-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  const healthScore = calcHealthScore(
    listing.batteryHealth,
    listing.diagnosticResults,
  );
  const savings = Number(listing.retailPrice) - Number(listing.naiasaPrice);
  const savingsPct = Math.round((savings / Number(listing.retailPrice)) * 100);
  const { bg, text } = conditionColors(listing.condition);
  const gradClass = brandGradient(listing.brand);

  const components = listing.componentHistory.map((item) => {
    try {
      return JSON.parse(item) as {
        component: string;
        status: string;
        date: string;
      };
    } catch {
      return { component: item, status: "Original", date: "" };
    }
  });

  const diagTests = ["Acoustic", "Thermal", "Dead Pixel", "Sensors"];
  const fallbackComponents = [
    {
      component: "Battery",
      status: "ReGenix-Certified Replacement",
      date: "Jan 2026",
    },
    { component: "Display", status: "Original — Never Replaced", date: "" },
    { component: "Motherboard", status: "Sealed — Never Opened", date: "" },
    { component: "Rear Camera", status: "Original — Functional", date: "" },
  ];
  const displayComponents =
    components.length > 0 ? components : fallbackComponents;

  return (
    <div data-ocid="product.page" className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Browse
          </Link>
          <span>/</span>
          <span className="text-foreground">{listing.model}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left: 360 Viewer */}
          <div className="space-y-4">
            <div
              className={`relative rounded-2xl overflow-hidden h-96 ${gradClass} cursor-grab active:cursor-grabbing`}
              onMouseDown={(e) => {
                dragStart.current = e.clientX;
              }}
              onMouseUp={(e) => {
                if (dragStart.current !== null) {
                  const delta = e.clientX - dragStart.current;
                  if (delta > 50)
                    setViewIndex(
                      (v) => (v - 1 + VIEW_LABELS.length) % VIEW_LABELS.length,
                    );
                  else if (delta < -50)
                    setViewIndex((v) => (v + 1) % VIEW_LABELS.length);
                  dragStart.current = null;
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewIndex}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="font-display font-black text-5xl text-foreground/15 tracking-widest uppercase">
                    {listing.brand}
                  </div>
                  <div className="font-mono text-sm text-foreground/10 mt-2">
                    {VIEW_LABELS[viewIndex]} View
                  </div>
                </motion.div>
              </AnimatePresence>

              {flawFinder && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-16 right-12 group cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-yellow-400/90 border-2 border-yellow-300 animate-pulse" />
                    <div className="absolute right-6 top-0 bg-background border border-border rounded px-2 py-1 text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Minor scratch — back panel
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="absolute bottom-20 left-10 group cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-yellow-400/80 border-2 border-yellow-300 animate-pulse" />
                    <div className="absolute left-6 bottom-0 bg-background border border-border rounded px-2 py-1 text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Hairline — frame edge
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-1/2 left-1/3 group cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded-full bg-orange-400/80 border border-orange-300 animate-pulse" />
                    <div className="absolute left-5 top-0 bg-background border border-border rounded px-2 py-1 text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Micro-scuff — bottom edge
                    </div>
                  </motion.div>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {VIEW_LABELS.map((label, i) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setViewIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === viewIndex
                        ? "bg-primary w-4"
                        : "bg-foreground/30 w-1.5"
                    }`}
                    aria-label={`View ${label}`}
                  />
                ))}
              </div>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-foreground/40 font-mono">
                ← Swipe to rotate →
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <Switch
                id="flaw-finder"
                checked={flawFinder}
                onCheckedChange={setFlawFinder}
                data-ocid="product.flaw_finder.toggle"
              />
              <Label
                htmlFor="flaw-finder"
                className="font-medium cursor-pointer"
              >
                Flaw-Finder™
                <span className="ml-2 text-xs text-muted-foreground">
                  {flawFinder ? "Showing cosmetic details" : "Clean view"}
                </span>
              </Label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg">
                ✓
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Original Screen — Acoustic Verified
                </div>
                <div className="text-xs text-muted-foreground">
                  Glass bond integrity confirmed via sound-frequency analysis
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`${bg} ${text} border-0`}>
                  {listing.condition}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  IMEI: {listing.imei}
                </span>
              </div>
              <h1 className="font-display font-black text-3xl text-foreground">
                {listing.model}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {listing.storage.toString()} GB Storage · {listing.brand}
              </p>
            </div>

            <div className="flex items-center gap-6 p-5 bg-card border border-border rounded-xl">
              <CircularProgress value={healthScore} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground mb-3">
                  AI-Surgeon Results
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {diagTests.map((test) => {
                    const idx = diagTests.indexOf(test);
                    const result = listing.diagnosticResults[idx];
                    const pass = result === "Pass";
                    return (
                      <div
                        key={test}
                        className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${
                          pass
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span>{pass ? "✓" : "✗"}</span>
                        <span>{test}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">📋</span> Device Medical Record
              </div>
              <div className="space-y-3">
                {displayComponents.map((comp) => (
                  <div
                    key={comp.component}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        {comp.component}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {comp.status}
                      </div>
                    </div>
                    {comp.date && (
                      <span className="text-xs font-mono text-primary shrink-0">
                        {comp.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <div className="text-sm font-semibold text-foreground mb-4">
                💰 Savings Calculator
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Brand New Price</span>
                  <span className="text-foreground line-through">
                    {formatINR(listing.retailPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ReGenix Price</span>
                  <span className="font-bold text-foreground">
                    {formatINR(listing.naiasaPrice)}
                  </span>
                </div>
                <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-semibold text-primary">
                    You Save
                  </span>
                  <span className="font-display font-black text-lg text-primary">
                    {formatINR(savings)} ({savingsPct}%)
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout/$id"
              params={{ id: listing.id.toString() }}
              data-ocid="product.buy_button"
              className="block w-full bg-primary text-primary-foreground text-center font-display font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-colors mint-glow"
            >
              Buy Now — {formatINR(listing.naiasaPrice)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
