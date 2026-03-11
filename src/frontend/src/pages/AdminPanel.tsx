import { Badge } from "@/components/ui/badge";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PhoneListing } from "../backend";
import type { AnalyticsSummary, Order, User } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { formatINR } from "../utils/format";

const ADMIN_AUTH_KEY = "regenix_admin_auth";
const AUTHORIZED_ADMIN_EMAIL = "mukherjeeanubhav417@gmail.com";

function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-xl border ${
        accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p
        className={`font-display font-black text-2xl ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function StripeConfigPanel({ actor }: { actor: any }) {
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN, US, GB");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { data: isConfigured, refetch } = useQuery<boolean>({
    queryKey: ["admin", "stripe-configured"],
    queryFn: async () => {
      try {
        return await actor.isStripeConfigured();
      } catch (_) {
        return false;
      }
    },
    enabled: !!actor,
  });

  const handleSave = async () => {
    if (!secretKey.trim()) {
      setSaveError("Please enter a Stripe Secret Key.");
      return;
    }
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const countriesArray = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await actor.setStripeConfiguration(secretKey.trim(), countriesArray);
      setSaveSuccess(true);
      setSecretKey("");
      refetch();
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save Stripe configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-xl"
    >
      {/* Status banner */}
      {isConfigured === false && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Stripe is not configured
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your Stripe Secret Key below to enable real card payments for
              customers.
            </p>
          </div>
        </div>
      )}

      {isConfigured === true && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-primary text-xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Stripe is active
            </p>
            <p className="text-xs text-muted-foreground">
              Real card payments are enabled for customers.
            </p>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="p-6 bg-card border border-border rounded-xl space-y-5">
        <div>
          <h3 className="font-display font-bold text-foreground">
            Stripe Configuration
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your Stripe Secret Key to process real card payments. Never
            share this key publicly.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Stripe Secret Key
          </Label>
          <Input
            data-ocid="admin.stripe.secret_key.input"
            type="password"
            placeholder="sk_live_... or sk_test_..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="bg-secondary border-border text-foreground font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Find your key at{" "}
            <span className="text-primary font-mono">
              dashboard.stripe.com/apikeys
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Allowed Countries
          </Label>
          <Input
            data-ocid="admin.stripe.countries.input"
            placeholder="IN, US, GB, SG"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            className="bg-secondary border-border text-foreground font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated ISO country codes
          </p>
        </div>

        {saveError && (
          <div
            data-ocid="admin.stripe.error_state"
            className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <span className="text-destructive text-sm">⚠ {saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            data-ocid="admin.stripe.success_state"
            className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg"
          >
            <span className="text-primary text-sm">
              ✓ Stripe configuration saved successfully!
            </span>
          </div>
        )}

        <Button
          data-ocid="admin.stripe.save_button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save Stripe Configuration"}
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-secondary/30 border border-border rounded-xl space-y-2">
        <p className="text-xs font-semibold text-foreground">
          💡 Integration Notes
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            Stripe processes Visa, Mastercard, and RuPay international cards.
          </li>
          <li>
            For UPI, Net Banking &amp; Wallets, Razorpay integration is
            recommended.
          </li>
          <li>
            Test with <span className="font-mono text-primary">sk_test_</span>{" "}
            keys before going live.
          </li>
          <li>
            Card details are never stored on ReGenix servers — Stripe handles
            all PCI compliance.
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

// Google SVG logo
function GoogleLogo() {
  return (
    <svg
      role="img"
      aria-label="Google"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

function AdminLoginGate({ onAuth }: { onAuth: () => void }) {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleGoogleClick = () => {
    setShowEmailInput(true);
    setLoginError("");
  };

  const handleSignIn = () => {
    if (email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      onAuth();
    } else {
      setLoginError(
        "Access denied. This admin panel is restricted to authorized personnel only.",
      );
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <span className="font-display font-black text-2xl text-primary mint-text-glow">
              Re
            </span>
            <span className="font-display font-black text-2xl text-foreground">
              Genix
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
            Admin Console
          </p>
        </div>

        <div
          className="bg-card border border-border rounded-2xl p-8 space-y-6"
          style={{ boxShadow: "0 0 40px rgba(0,255,180,0.06)" }}
        >
          {/* Lock icon + heading */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
              <svg
                role="img"
                aria-label="Lock"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="font-display font-bold text-lg text-foreground">
                Admin Console
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restricted access — authorized personnel only
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showEmailInput ? (
              <motion.div
                key="google-btn"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <button
                  type="button"
                  data-ocid="admin.google.primary_button"
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  <GoogleLogo />
                  Continue with Google
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="email-input"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Google Account Email
                  </Label>
                  <Input
                    data-ocid="admin.email.input"
                    type="email"
                    placeholder="your@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                    className="bg-secondary border-border text-foreground"
                    autoFocus
                  />
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    data-ocid="admin.login.error_state"
                    className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                  >
                    <span className="text-destructive text-xs leading-relaxed">
                      🚫 {loginError}
                    </span>
                  </motion.div>
                )}

                <Button
                  data-ocid="admin.login.submit_button"
                  onClick={handleSignIn}
                  className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Sign In
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailInput(false);
                    setEmail("");
                    setLoginError("");
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  ← Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Unauthorized access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}

export function AdminPanel() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const [isAuthed, setIsAuthed] = useState(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });

  // Inventory state
  const [inventorySearch, setInventorySearch] = useState("");
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>(
    {},
  );

  // User filter
  const [userFilter, setUserFilter] = useState("all");

  const enabled = !!actor && !isFetching && isAuthed;

  const { data: listings = [] } = useQuery<PhoneListing[]>({
    queryKey: ["admin", "listings"],
    queryFn: () => actor!.getAllListings(),
    enabled,
  });
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: () => (actor as any).getAllOrders(),
    enabled,
  });
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: () => (actor as any).getAllUsers(),
    enabled,
  });
  const { data: analytics } = useQuery<AnalyticsSummary>({
    queryKey: ["admin", "analytics"],
    queryFn: () => (actor as any).getAnalyticsSummary(),
    enabled,
  });

  const updateStock = useMutation({
    mutationFn: ({ id, inStock }: { id: bigint; inStock: boolean }) =>
      (actor as any).updateListingStock(id, inStock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
  const updatePrice = useMutation({
    mutationFn: ({ id, price }: { id: bigint; price: bigint }) =>
      (actor as any).updateListingPrice(id, price),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
  const updateHealth = useMutation({
    mutationFn: ({ id, score }: { id: bigint; score: bigint }) =>
      (actor as any).updateListingHealthScore(id, score),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });
  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      (actor as any).updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
  const updateUserStatus = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      (actor as any).updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthed(false);
  };

  const filteredListings = listings.filter((l) => {
    const q = inventorySearch.toLowerCase();
    if (!q) return true;
    return (
      l.model.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      l.imei.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (userFilter === "all") return true;
    if (userFilter === "buyers") return u.role === "buyer";
    if (userFilter === "sellers") return u.role === "seller";
    if (userFilter === "flagged")
      return u.status === "flagged" || u.status === "banned";
    return true;
  });

  const statusColor: Record<string, string> = {
    Processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "In Transit": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Delivered: "bg-primary/20 text-primary border-primary/30",
    Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const userStatusColor: Record<string, string> = {
    active: "bg-primary/20 text-primary border-primary/30",
    flagged: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    banned: "bg-destructive/20 text-destructive border-destructive/30",
  };

  // Brand revenue for bar chart
  const brandRevenue = listings.reduce(
    (acc, l) => {
      acc[l.brand] = (acc[l.brand] || 0) + Number(l.naiasaPrice);
      return acc;
    },
    {} as Record<string, number>,
  );
  const maxBrandRev = Math.max(...Object.values(brandRevenue), 1);

  if (!isAuthed) {
    return <AdminLoginGate onAuth={() => setIsAuthed(true)} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Admin Console
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              ReGenix Operations Dashboard
            </p>
          </div>
          <Button
            data-ocid="admin.logout.button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger
              data-ocid="admin.inventory.tab"
              value="inventory"
              className="text-xs"
            >
              📦 Inventory
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.orders.tab"
              value="orders"
              className="text-xs"
            >
              📋 Orders
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.pricing.tab"
              value="pricing"
              className="text-xs"
            >
              💰 Pricing
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.users.tab"
              value="users"
              className="text-xs"
            >
              👥 Users
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.analytics.tab"
              value="analytics"
              className="text-xs"
            >
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.stripe.tab"
              value="stripe"
              className="text-xs"
            >
              💳 Stripe
            </TabsTrigger>
          </TabsList>

          {/* ── INVENTORY ── */}
          <TabsContent value="inventory">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Input
                  data-ocid="admin.inventory.search_input"
                  placeholder="Search IMEI, brand or model..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="max-w-xs bg-secondary border-border"
                />
                <span className="text-xs text-muted-foreground">
                  {filteredListings.length} listings
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">
                        Device
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        IMEI
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Storage
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Health %
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Price
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Stock
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredListings.map((l, i) => (
                        <motion.tr
                          key={l.id.toString()}
                          data-ocid={`admin.inventory.row.${i + 1}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-border hover:bg-secondary/30 group"
                        >
                          <TableCell>
                            <div>
                              <span className="text-sm font-semibold text-foreground">
                                {l.brand} {l.model}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {l.condition}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs font-mono text-muted-foreground">
                              {l.imei}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {l.storage.toString()}GB
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <span className="text-xs font-mono text-primary w-8">
                                {l.batteryHealth.toString()}%
                              </span>
                              <Slider
                                value={[Number(l.batteryHealth)]}
                                min={0}
                                max={100}
                                step={1}
                                className="w-20"
                                onValueChange={([v]) =>
                                  updateHealth.mutate({
                                    id: l.id,
                                    score: BigInt(v),
                                  })
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {editingPrices[l.id.toString()] !== undefined ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editingPrices[l.id.toString()]}
                                    onChange={(e) =>
                                      setEditingPrices((p) => ({
                                        ...p,
                                        [l.id.toString()]: e.target.value,
                                      }))
                                    }
                                    className="w-24 bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground"
                                  />
                                  <button
                                    type="button"
                                    className="text-primary text-xs hover:underline"
                                    onClick={() => {
                                      const v = editingPrices[l.id.toString()];
                                      if (v)
                                        updatePrice.mutate({
                                          id: l.id,
                                          price: BigInt(v),
                                        });
                                      setEditingPrices((p) => {
                                        const next = { ...p };
                                        delete next[l.id.toString()];
                                        return next;
                                      });
                                    }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    type="button"
                                    className="text-muted-foreground text-xs hover:underline"
                                    onClick={() =>
                                      setEditingPrices((p) => {
                                        const next = { ...p };
                                        delete next[l.id.toString()];
                                        return next;
                                      })
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  data-ocid={`admin.inventory.edit_button.${i + 1}`}
                                  className="text-sm font-mono text-foreground hover:text-primary transition-colors cursor-pointer"
                                  onClick={() =>
                                    setEditingPrices((p) => ({
                                      ...p,
                                      [l.id.toString()]:
                                        l.naiasaPrice.toString(),
                                    }))
                                  }
                                >
                                  {formatINR(l.naiasaPrice)}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              data-ocid={`admin.inventory.stock_toggle.${i + 1}`}
                              checked={l.inStock}
                              onCheckedChange={(v) =>
                                updateStock.mutate({ id: l.id, inStock: v })
                              }
                            />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── ORDERS ── */}
          <TabsContent value="orders">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">
                        Order / Seal
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Payment
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-12"
                          data-ocid="admin.orders.empty_state"
                        >
                          No orders yet
                        </TableCell>
                      </TableRow>
                    )}
                    {orders.map((o, i) => (
                      <TableRow
                        key={o.id.toString()}
                        data-ocid={`admin.orders.row.${i + 1}`}
                        className="border-border hover:bg-secondary/30"
                      >
                        <TableCell>
                          <div className="text-xs font-mono text-foreground">
                            #{o.id.toString()}
                          </div>
                          <div className="text-xs font-mono text-primary">
                            {o.sealId}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {o.userId.slice(0, 16)}…
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-border"
                          >
                            {o.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono text-foreground">
                          {formatINR(o.totalAmount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={(v) =>
                              updateOrderStatus.mutate({ id: o.id, status: v })
                            }
                          >
                            <SelectTrigger
                              data-ocid={`admin.orders.status_select.${i + 1}`}
                              className={`w-32 h-7 text-xs border rounded-md px-2 ${
                                statusColor[o.status] ||
                                "border-border text-muted-foreground"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="In Transit">
                                In Transit
                              </SelectItem>
                              <SelectItem value="Delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="Cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── PRICING ── */}
          <TabsContent value="pricing">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {listings.map((l, i) => (
                <PricingCard
                  key={l.id.toString()}
                  listing={l}
                  index={i + 1}
                  onSave={(newPrice) =>
                    updatePrice.mutate({ id: l.id, price: BigInt(newPrice) })
                  }
                />
              ))}
            </motion.div>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                {["all", "buyers", "sellers", "flagged"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    data-ocid="admin.users.filter.tab"
                    onClick={() => setUserFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors capitalize ${
                      userFilter === f
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Phone
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Email
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Role
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Joined
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-12"
                          data-ocid="admin.users.empty_state"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredUsers.map((u, i) => (
                      <TableRow
                        key={u.id.toString()}
                        data-ocid={`admin.users.row.${i + 1}`}
                        className="border-border hover:bg-secondary/30"
                      >
                        <TableCell className="text-sm font-semibold text-foreground">
                          {u.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {u.phone || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-border capitalize"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.status || "active"}
                            onValueChange={(v) =>
                              updateUserStatus.mutate({ id: u.id, status: v })
                            }
                          >
                            <SelectTrigger
                              data-ocid={`admin.users.status_select.${i + 1}`}
                              className={`w-28 h-7 text-xs border rounded-md px-2 ${
                                userStatusColor[u.status] ||
                                "border-border text-muted-foreground"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="flagged">Flagged</SelectItem>
                              <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── ANALYTICS ── */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label="Total Revenue"
                  value={analytics ? formatINR(analytics.totalRevenue) : "—"}
                  accent
                />
                <StatCard
                  label="Total Orders"
                  value={analytics ? analytics.totalOrders.toString() : "—"}
                />
                <StatCard
                  label="Active Listings"
                  value={analytics ? analytics.totalListings.toString() : "—"}
                />
                <StatCard
                  label="Total Users"
                  value={analytics ? analytics.totalUsers.toString() : "—"}
                />
                <StatCard
                  label="Seller Submissions"
                  value={
                    analytics
                      ? analytics.totalSellerSubmissions.toString()
                      : "—"
                  }
                />
                <StatCard
                  label="Pending Orders"
                  value={analytics ? analytics.pendingOrders.toString() : "—"}
                  sub={
                    analytics && Number(analytics.pendingOrders) > 0
                      ? "⚠ Needs attention"
                      : undefined
                  }
                />
              </div>

              <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-display font-bold text-foreground mb-6">
                  Revenue by Brand
                </h3>
                <div className="space-y-3">
                  {Object.entries(brandRevenue)
                    .sort(([, a], [, b]) => b - a)
                    .map(([brand, rev]) => (
                      <div key={brand} className="flex items-center gap-3">
                        <span className="w-16 text-xs text-muted-foreground">
                          {brand}
                        </span>
                        <div className="flex-1 h-6 bg-secondary rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(rev / maxBrandRev) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full bg-primary/70 rounded"
                          />
                        </div>
                        <span className="w-24 text-xs font-mono text-foreground text-right">
                          {formatINR(rev)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Top 5 Listings by Price
                </h3>
                <div className="space-y-2">
                  {listings
                    .sort(
                      (a, b) => Number(b.naiasaPrice) - Number(a.naiasaPrice),
                    )
                    .slice(0, 5)
                    .map((l, i) => (
                      <div
                        key={l.id.toString()}
                        data-ocid={`admin.analytics.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <div>
                            <span className="text-sm font-semibold text-foreground">
                              {l.brand} {l.model}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {l.storage.toString()}GB · {l.condition}
                            </div>
                          </div>
                        </div>
                        <span className="font-display font-bold text-primary">
                          {formatINR(l.naiasaPrice)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── STRIPE ── */}
          <TabsContent value="stripe">
            <StripeConfigPanel actor={actor} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PricingCard({
  listing,
  index,
  onSave,
}: {
  listing: PhoneListing;
  index: number;
  onSave: (p: number) => void;
}) {
  const base = Number(listing.naiasaPrice);
  const min = Math.round(base * 0.8);
  const max = Math.round(base * 1.2);
  const [price, setPrice] = useState(base);
  const margin = Math.round(((price - base) / base) * 100);

  return (
    <div
      data-ocid={`admin.pricing.card.${index}`}
      className="p-5 bg-card border border-border rounded-xl space-y-4"
    >
      <div>
        <p className="font-semibold text-sm text-foreground">
          {listing.brand} {listing.model}
        </p>
        <p className="text-xs text-muted-foreground">
          {listing.storage.toString()}GB · {listing.condition}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Price</span>
          <span className="font-mono font-bold text-primary">
            {formatINR(price)}
          </span>
        </div>
        <Slider
          value={[price]}
          min={min}
          max={max}
          step={100}
          onValueChange={([v]) => setPrice(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatINR(min)}</span>
          <span
            className={`font-mono ${
              margin > 0
                ? "text-primary"
                : margin < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {margin > 0 ? "+" : ""}
            {margin}%
          </span>
          <span>{formatINR(max)}</span>
        </div>
      </div>
      <Button
        data-ocid={`admin.pricing.save_button.${index}`}
        size="sm"
        className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 text-xs"
        onClick={() => onSave(price)}
      >
        Apply Price
      </Button>
    </div>
  );
}
