import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSell } from "../context/SellContext";
import { useActor } from "../hooks/useActor";
import { formatINR } from "../utils/format";

const PICKUP_SLOTS = [
  { label: "Today 2pm – 4pm", value: "today-1400-1600" },
  { label: "Today 4pm – 6pm", value: "today-1600-1800" },
  { label: "Tomorrow 10am – 12pm", value: "tomorrow-1000-1200" },
  { label: "Tomorrow 2pm – 4pm", value: "tomorrow-1400-1600" },
];

function SparkLine() {
  const points = [100, 92, 96, 84, 88, 78, 82, 73, 77, 68, 72, 60];
  const w = 240;
  const h = 60;
  const maxV = Math.max(...points);
  const minV = Math.min(...points);
  const range = maxV - minV || 1;
  const coords = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - ((p - minV) / range) * h * 0.8 - h * 0.1,
  ]);
  const pathD = coords
    .map(
      (c, i) => `${i === 0 ? "M" : "L"}${c[0].toFixed(1)},${c[1].toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-label="Market trend chart showing declining prices"
    >
      <title>Market trend chart</title>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.88 0.17 168)" />
          <stop offset="100%" stopColor="oklch(0.62 0.18 27)" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="4"
        fill="oklch(0.62 0.18 27)"
      />
    </svg>
  );
}

function CountingPrice({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef(Date.now());
  const duration = 1500;

  useEffect(() => {
    startRef.current = Date.now();
    const raf = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplayed(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);

  return <>{formatINR(displayed)}</>;
}

function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const interval = setInterval(
      () => setRemaining((r) => Math.max(r - 1, 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span className="font-mono text-primary">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

export function Quote() {
  const { formData, diagnosticResults, quotedPrice } = useSell();
  const { actor } = useActor();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!formData) navigate({ to: "/sell" });
  }, [formData, navigate]);

  const handleConfirm = async () => {
    if (!selectedSlot || !formData || !actor) return;
    setSubmitting(true);
    try {
      const storGB = Number.parseInt(formData.storage) || 128;
      const diagStrings = diagnosticResults.map((d) => d.result);
      await actor.submitSellRequest(
        formData.brand,
        formData.model,
        BigInt(storGB),
        formData.condition,
        diagStrings,
        selectedSlot,
      );
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!formData) return null;

  return (
    <div data-ocid="quote.page" className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-lg mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              data-ocid="quote.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto text-4xl">
                ✓
              </div>
              <div>
                <h2 className="font-display font-black text-3xl text-foreground mb-3">
                  Pickup Confirmed!
                </h2>
                <p className="text-muted-foreground">
                  Our agent will arrive at your selected slot. Payment via UPI
                  within <strong className="text-primary">10 minutes</strong> of
                  device verification.
                </p>
              </div>
              <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Device</span>
                  <span className="text-foreground">
                    {formData.brand} {formData.model}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quoted Price</span>
                  <span className="font-bold text-primary">
                    {formatINR(quotedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pickup Slot</span>
                  <span className="text-foreground">
                    {PICKUP_SLOTS.find((s) => s.value === selectedSlot)?.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="text-primary underline text-sm"
              >
                Back to Home
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center p-8 bg-card border border-primary/30 rounded-2xl">
                <div className="text-sm text-muted-foreground mb-2">
                  Your NayaSa Price
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="font-display font-black text-5xl text-primary mint-text-glow mb-3"
                >
                  <CountingPrice target={Number(quotedPrice)} />
                </motion.div>
                <div className="text-sm text-foreground">
                  Price locked for{" "}
                  <Countdown seconds={23 * 3600 + 59 * 60 + 59} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  No bargaining at your door. This is your fixed price.
                </div>
              </div>

              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-foreground">
                    Market Trend
                  </div>
                  <div className="text-xs text-orange-400 font-medium">
                    ↓ Prices trending down
                  </div>
                </div>
                <SparkLine />
                <p className="text-xs text-muted-foreground mt-2">
                  Sell now to maximise your value. {formData.brand} prices have
                  dropped ~8% this week.
                </p>
              </div>

              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="text-sm font-semibold text-foreground mb-4">
                  AI-Surgeon Summary
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {diagnosticResults.map((d) => (
                    <div
                      key={d.name}
                      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                        d.result === "Pass"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <span>{d.result === "Pass" ? "✓" : "✗"}</span>
                      <span className="truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Select Pickup Slot
                </div>
                {PICKUP_SLOTS.map((slot, i) => (
                  <button
                    type="button"
                    key={slot.value}
                    data-ocid={`quote.pickup_slot.item.${i + 1}`}
                    onClick={() => setSelectedSlot(slot.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      selectedSlot === slot.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedSlot === slot.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedSlot === slot.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {slot.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Agent arrives at your door · UPI payout on spot
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-ocid="quote.confirm_button"
                onClick={handleConfirm}
                disabled={!selectedSlot || submitting}
                className="w-full bg-primary text-primary-foreground font-display font-bold text-lg py-4 rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all mint-glow"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  `Confirm Pickup — ${formatINR(quotedPrice)}`
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
