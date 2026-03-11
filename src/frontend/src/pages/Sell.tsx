import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useSell } from "../context/SellContext";

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Google", "Other"];
const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const CONDITIONS = ["Mint", "Good", "Fair"];

export function Sell() {
  const { setFormData } = useSell();
  const navigate = useNavigate();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");

  const canProceed = brand && model.trim() && storage && condition;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    setFormData({ brand, model: model.trim(), storage, condition });
    navigate({ to: "/sell/diagnose" });
  };

  return (
    <div data-ocid="sell.page" className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-mono text-primary tracking-wider">
              AI-SURGEON DIAGNOSTIC
            </span>
          </div>
          <h1 className="font-display font-black text-4xl text-foreground mb-3">
            Get Your ReGenix Price
            <br />
            <span className="text-primary">in 90 Seconds</span>
          </h1>
          <p className="text-muted-foreground mb-10">
            Tell us about your phone. Our AI runs a full forensic diagnostic and
            gives you a fixed, no-bargain price — instantly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Brand
              </Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger
                  data-ocid="sell.brand.select"
                  className="bg-card border-border"
                >
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Model
              </Label>
              <Input
                data-ocid="sell.model.input"
                placeholder="e.g. iPhone 15 Pro, Galaxy S24 Ultra"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-card border-border"
              />
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Storage
              </Label>
              <Select value={storage} onValueChange={setStorage}>
                <SelectTrigger
                  data-ocid="sell.storage.select"
                  className="bg-card border-border"
                >
                  <SelectValue placeholder="Select storage" />
                </SelectTrigger>
                <SelectContent>
                  {STORAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Condition
              </Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger
                  data-ocid="sell.condition.select"
                  className="bg-card border-border"
                >
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition guide */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-card border border-border rounded-xl">
              {[
                {
                  grade: "Mint",
                  desc: "Like new, no scratches",
                  color: "text-primary",
                },
                {
                  grade: "Good",
                  desc: "Minor wear, fully functional",
                  color: "text-blue-400",
                },
                {
                  grade: "Fair",
                  desc: "Visible wear, works perfectly",
                  color: "text-yellow-400",
                },
              ].map((g) => (
                <div key={g.grade} className="text-center">
                  <div className={`text-xs font-bold ${g.color}`}>
                    {g.grade}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {g.desc}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              data-ocid="sell.diagnose_button"
              disabled={!canProceed}
              className="w-full bg-primary text-primary-foreground font-display font-bold text-lg py-6 rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all mint-glow"
            >
              Start AI-Surgeon Diagnostic →
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
