import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

export function ProfileSetup() {
  const { user, login } = useCustomerAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!handle.trim()) {
      setError("Please choose a handle.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      setError("Handle can only contain letters, numbers, and underscores.");
      return;
    }
    setError("");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const updated = {
      name: name.trim(),
      email: user?.email || "",
      phone: user?.phone || "",
      handle: handle.trim(),
    };
    login(updated as any);
    setSaving(false);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.88 0.17 168) 39px, oklch(0.88 0.17 168) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.88 0.17 168) 39px, oklch(0.88 0.17 168) 40px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-display font-black text-3xl text-primary mint-text-glow">
              Re
            </span>
            <span className="font-display font-black text-3xl text-foreground">
              Genix
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            The phone isn't just 'used,' it's 'regenerated.'
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 card-glow space-y-6">
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Set up your profile
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Just two quick details and you're ready to go
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <span className="text-xs text-muted-foreground">Account</span>
            </div>
            <div className="flex-1 h-px bg-primary/30" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary border border-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">
                  2
                </span>
              </div>
              <span className="text-xs text-foreground font-medium">
                Profile
              </span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                <span className="text-muted-foreground text-xs">3</span>
              </div>
              <span className="text-xs text-muted-foreground">Browse</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="full-name"
              className="text-sm text-muted-foreground uppercase tracking-wide text-xs"
            >
              Full Name
            </Label>
            <Input
              id="full-name"
              data-ocid="profile_setup.name.input"
              placeholder="Anubhav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {/* Handle */}
          <div className="space-y-2">
            <Label
              htmlFor="handle"
              className="text-sm text-muted-foreground uppercase tracking-wide text-xs"
            >
              Username / Handle
            </Label>
            <div className="flex gap-0">
              <div className="flex items-center px-3 bg-secondary border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground font-mono">
                @
              </div>
              <Input
                id="handle"
                data-ocid="profile_setup.handle.input"
                placeholder="anubhav2004"
                value={handle}
                onChange={(e) =>
                  setHandle(
                    e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase(),
                  )
                }
                className="bg-secondary border-border text-foreground rounded-l-none font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Letters, numbers, and underscores only
            </p>
          </div>

          {error && (
            <div
              data-ocid="profile_setup.error_state"
              className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
            >
              <span className="text-destructive text-sm">⚠ {error}</span>
            </div>
          )}

          <Button
            data-ocid="profile_setup.save_button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90"
          >
            {saving ? "Saving..." : "Save & Start Browsing →"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You can update your profile at any time from your account settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
