import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSell } from "../context/SellContext";

interface AnimProps {
  running: boolean;
  done: boolean;
  pass: boolean;
}

function SoundWave({ running }: AnimProps) {
  const bars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {bars.map((key, i) => (
        <motion.div
          key={key}
          className="w-1.5 rounded-full bg-primary"
          animate={
            running
              ? {
                  height: [8, 16 + Math.sin(i * 0.8) * 20, 8],
                }
              : { height: 4 }
          }
          transition={
            running
              ? {
                  duration: 0.6 + i * 0.05,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

function ThermalBar({ running }: AnimProps) {
  const [temp, setTemp] = useState(24);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTemp((t) => Math.min(t + 2.5, 78));
    }, 120);
    return () => clearInterval(interval);
  }, [running]);

  const hue = 30 + (temp - 24) * 1.5;
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">CPU Temp</span>
        <span className="font-mono" style={{ color: `hsl(${hue}, 90%, 60%)` }}>
          {temp.toFixed(1)}°C
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `hsl(${hue}, 90%, 55%)` }}
          animate={{ width: `${((temp - 24) / 54) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {temp < 70 ? "Nominal" : "Stress Peak"}
      </div>
    </div>
  );
}

function PixelScan({ running }: AnimProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#FFFF00",
    "#00FFFF",
  ];
  const cellKeys = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
    "c11",
    "c12",
    "c13",
    "c14",
    "c15",
    "c16",
    "c17",
    "c18",
  ];
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(
      () => setColorIdx((c) => (c + 1) % colors.length),
      200,
    );
    return () => clearInterval(interval);
  }, [running]);
  return (
    <div className="grid grid-cols-6 gap-1 w-full">
      {cellKeys.map((key, i) => (
        <div
          key={key}
          className="rounded aspect-square transition-colors duration-150"
          style={{
            backgroundColor: running
              ? colors[(colorIdx + i) % colors.length]
              : "oklch(0.2 0 0)",
            opacity: running ? 0.7 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

function SensorSpin({ running }: AnimProps) {
  const sensors = [
    { icon: "⟳", label: "Gyro" },
    { icon: "↕", label: "Accel" },
    { icon: "◉", label: "Compass" },
    { icon: "⬡", label: "FaceID" },
  ];
  return (
    <div className="flex justify-center gap-6">
      {sensors.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center gap-1">
          <motion.div
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl"
            animate={running ? { rotate: 360 } : {}}
            transition={
              running
                ? {
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    delay: i * 0.2,
                  }
                : {}
            }
          >
            {s.icon}
          </motion.div>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

interface TestDef {
  id: string;
  name: string;
  description: string;
  ocid: string;
  icon: string;
  AnimComp: React.FC<AnimProps>;
}

const TESTS: TestDef[] = [
  {
    id: "acoustic",
    name: "Acoustic Screen Audit",
    description: "Scanning glass bond integrity...",
    ocid: "diagnose.acoustic.panel",
    icon: "🔊",
    AnimComp: SoundWave,
  },
  {
    id: "thermal",
    name: "Thermal Motherboard Test",
    description: "Running processor at 100% for stress analysis...",
    ocid: "diagnose.thermal.panel",
    icon: "🌡️",
    AnimComp: ThermalBar,
  },
  {
    id: "deadpixel",
    name: "Dead Pixel Ghost Scan",
    description: "Cycling RGB frequencies across AMOLED matrix...",
    ocid: "diagnose.deadpixel.panel",
    icon: "🖥️",
    AnimComp: PixelScan,
  },
  {
    id: "sensors",
    name: "Sensor Integrity Check",
    description: "Verifying Gyroscope, Accelerometer, Compass, FaceID...",
    ocid: "diagnose.sensors.panel",
    icon: "📡",
    AnimComp: SensorSpin,
  },
];

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

export function Diagnose() {
  const { formData, setDiagnosticResults, setQuotedPrice } = useSell();
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState<Array<"Pass" | "Fail" | null>>(
    Array(4).fill(null),
  );
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<
    "running" | "result" | "generating" | "done"
  >("running");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!formData) {
      navigate({ to: "/sell" });
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    const runTests = async () => {
      const seed = formData.model;
      const newResults: Array<"Pass" | "Fail"> = [];

      for (let i = 0; i < TESTS.length; i++) {
        setCurrentTest(i);
        setPhase("running");
        setProgress(0);

        await new Promise<void>((resolve) => {
          let p = 0;
          const interval = setInterval(() => {
            p += 4;
            setProgress(Math.min(p, 100));
            if (p >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

        const r = seededRandom(seed, i) > 0.1 ? "Pass" : "Fail";
        newResults.push(r);
        setResults((prev) => {
          const next = [...prev] as Array<"Pass" | "Fail" | null>;
          next[i] = r;
          return next;
        });
        setPhase("result");
        await new Promise((res) => setTimeout(res, 700));
      }

      setPhase("generating");
      const passCount = newResults.filter((r) => r === "Pass").length;
      const cond = formData.condition;
      const brand = formData.brand;
      const storGB = Number.parseInt(formData.storage) || 128;

      const basePrice: Record<string, number> = {
        Apple: 55000,
        Samsung: 35000,
        OnePlus: 22000,
        Google: 28000,
        Xiaomi: 14000,
        Other: 10000,
      };
      const condMult: Record<string, number> = {
        Mint: 1.0,
        Good: 0.82,
        Fair: 0.65,
      };
      const base = (basePrice[brand] ?? 12000) * (condMult[cond] ?? 0.75);
      const storMult =
        storGB >= 512 ? 1.2 : storGB >= 256 ? 1.1 : storGB >= 128 ? 1.0 : 0.9;
      const diagMult = 0.7 + (passCount / 4) * 0.3;
      const quoted = Math.round((base * storMult * diagMult) / 500) * 500;

      const diagResultObjs = TESTS.map((t, i) => ({
        name: t.name,
        result: newResults[i],
      }));
      setDiagnosticResults(diagResultObjs);
      setQuotedPrice(BigInt(quoted));

      await new Promise((res) => setTimeout(res, 1500));
      setPhase("done");
      navigate({ to: "/sell/quote" });
    };

    runTests();
  }, [formData, navigate, setDiagnosticResults, setQuotedPrice]);

  const test = TESTS[currentTest];
  const AnimComp = test?.AnimComp;
  const currentResult = results[currentTest];
  const isRunning = phase === "running";

  return (
    <div
      data-ocid="diagnose.page"
      className="min-h-screen pt-24 pb-24 px-6 flex flex-col items-center"
    >
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-wider">
              AI-SURGEON ACTIVE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-foreground">
            Analysing{" "}
            <span className="text-primary">
              {formData?.brand} {formData?.model}
            </span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-4 gap-2 mb-10">
          {TESTS.map((t, i) => {
            const res = results[i];
            const active = i === currentTest && phase !== "generating";
            return (
              <div
                key={t.id}
                className={`rounded-lg p-2 text-center transition-all ${
                  active
                    ? "bg-primary/20 border border-primary"
                    : res === "Pass"
                      ? "bg-primary/10 border border-primary/30"
                      : res === "Fail"
                        ? "bg-destructive/10 border border-destructive/30"
                        : "bg-card border border-border"
                }`}
              >
                <div className="text-lg">{t.icon}</div>
                <div className="text-xs font-mono mt-1">
                  {res === "Pass" ? (
                    <span className="text-primary">PASS</span>
                  ) : res === "Fail" ? (
                    <span className="text-destructive">FAIL</span>
                  ) : active ? (
                    <span className="text-primary animate-pulse">...</span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === "generating" ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-primary/30 rounded-2xl p-8 text-center"
            >
              <div className="font-display font-black text-2xl text-foreground mb-2">
                All Tests Complete
              </div>
              <div className="text-muted-foreground mb-6">
                Generating your personalised quote...
              </div>
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            </motion.div>
          ) : test ? (
            <motion.div
              key={currentTest}
              data-ocid={test.ocid}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-card border border-border rounded-2xl p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{test.icon}</span>
                <div>
                  <div className="font-display font-bold text-lg text-foreground">
                    {test.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {test.description}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative w-28 h-28">
                  <svg
                    width="112"
                    height="112"
                    className="-rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke="oklch(0.2 0 0)"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke="oklch(0.88 0.17 168)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {phase === "result" && currentResult ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`text-3xl font-black ${
                          currentResult === "Pass"
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {currentResult === "Pass" ? "✓" : "✗"}
                      </motion.div>
                    ) : (
                      <span className="font-mono text-lg text-foreground">
                        {progress}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  {AnimComp && (
                    <AnimComp
                      running={isRunning}
                      done={!!currentResult}
                      pass={currentResult === "Pass"}
                    />
                  )}
                </div>

                {phase === "result" && currentResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      currentResult === "Pass"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30"
                    }`}
                  >
                    <span className="font-display font-bold">
                      {currentResult === "Pass" ? "✓ PASS" : "✗ FAIL"}
                    </span>
                    <span className="text-sm">
                      {currentResult === "Pass"
                        ? "No issues detected"
                        : "Issue logged"}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
