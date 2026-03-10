import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useListingById } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

export function Checkout() {
  const { id } = useParams({ from: "/checkout/$id" });
  const { data: listing, isLoading } = useListingById(BigInt(id));
  const [shipping, setShipping] = useState<"standard" | "flash">("standard");
  const [videoConsent, setVideoConsent] = useState(false);
  const [obdConsent, setObdConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (isLoading) {
    return (
      <div data-ocid="checkout.page" className="min-h-screen pt-24 px-6">
        <div className="max-w-xl mx-auto space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
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

  const total = Number(listing.naiasaPrice) + (shipping === "flash" ? 200 : 0);
  const sealId = `NS-${Math.floor(((Number(listing.id) * 12345) % 90000) + 10000)}`;

  return (
    <div data-ocid="checkout.page" className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">
            Browse
          </Link>
          <span>/</span>
          <Link
            to="/listing/$id"
            params={{ id }}
            className="hover:text-foreground"
          >
            {listing.model}
          </Link>
          <span>/</span>
          <span className="text-foreground">Checkout</span>
        </div>

        <h1 className="font-display font-black text-3xl text-foreground mb-8">
          Secure Checkout
        </h1>

        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="text-sm font-semibold text-foreground mb-4">
                  Order Summary
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground text-xs font-bold">
                    {listing.brand[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {listing.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {listing.condition} · {listing.storage.toString()} GB
                    </div>
                    <div className="font-display font-bold text-primary mt-1">
                      {formatINR(listing.naiasaPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Delivery Option
                </div>
                <button
                  type="button"
                  data-ocid="checkout.standard_shipping.radio"
                  onClick={() => setShipping("standard")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    shipping === "standard"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      shipping === "standard"
                        ? "border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {shipping === "standard" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-foreground">
                      NayaSa Standard
                    </div>
                    <div className="text-xs text-muted-foreground">
                      5 Days Delivery
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">FREE</span>
                </button>

                <button
                  type="button"
                  data-ocid="checkout.flash_shipping.radio"
                  onClick={() => setShipping("flash")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    shipping === "flash"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      shipping === "flash"
                        ? "border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {shipping === "flash" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-foreground">
                      NayaSa Flash ⚡
                    </div>
                    <div className="text-xs text-muted-foreground">
                      3 Days — Priority Air
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    +₹200
                  </span>
                </button>
              </div>

              {/* Transparency */}
              <div className="p-5 bg-card border border-border rounded-xl space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  Transparency Agreements
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="video-consent"
                    checked={videoConsent}
                    onCheckedChange={(v) => setVideoConsent(!!v)}
                    data-ocid="checkout.video_checkbox"
                  />
                  <Label
                    htmlFor="video-consent"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    I want my Lens-to-Label packing video sent to my WhatsApp
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="obd-consent"
                    checked={obdConsent}
                    onCheckedChange={(v) => setObdConsent(!!v)}
                    data-ocid="checkout.obd_checkbox"
                  />
                  <Label
                    htmlFor="obd-consent"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    I understand Open-Box Delivery (OBD) is mandatory before
                    releasing payment
                  </Label>
                </div>
              </div>

              {/* Payment note */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-primary text-lg">🔐</span>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">No COD</strong> — Your
                  transaction is secured end-to-end on ICP blockchain. No
                  advance payment until delivery is verified.
                </p>
              </div>

              {/* Total + CTA */}
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground text-sm">Device</span>
                  <span className="text-foreground">
                    {formatINR(listing.naiasaPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground text-sm">
                    Shipping
                  </span>
                  <span className="text-foreground">
                    {shipping === "flash" ? "₹200" : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display font-black text-xl text-primary">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-ocid="checkout.confirm_button"
                onClick={() => setConfirmed(true)}
                className="w-full bg-primary text-primary-foreground font-display font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-colors mint-glow"
              >
                Confirm Order
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              data-ocid="checkout.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto text-4xl">
                ✓
              </div>
              <div>
                <h2 className="font-display font-black text-3xl text-foreground mb-2">
                  Order Confirmed!
                </h2>
                <p className="text-muted-foreground">
                  Your Lens-to-Label video will be ready in 2 hours. Track your
                  order in real-time.
                </p>
              </div>
              <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Device</span>
                  <span className="text-foreground font-medium">
                    {listing.model}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === "flash"
                      ? "NayaSa Flash (3 days)"
                      : "NayaSa Standard (5 days)"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seal ID</span>
                  <span className="font-mono text-primary">{sealId}</span>
                </div>
              </div>
              <Link
                to="/"
                className="inline-block text-primary underline text-sm"
              >
                Continue Browsing
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
