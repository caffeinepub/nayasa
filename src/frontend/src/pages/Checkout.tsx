import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useCreateCheckoutSession } from "../hooks/useCreateCheckoutSession";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { useListingById } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const BANKS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank", "PNB"];
const WALLETS = ["Paytm", "Amazon Pay", "Mobikwik"];

export function Checkout() {
  const { id } = useParams({ from: "/checkout/$id" });
  const { data: listing, isLoading } = useListingById(BigInt(id));
  const { actor } = useActor();
  const { user } = useCustomerAuth();
  const stripeCheckout = useCreateCheckoutSession();

  const [shipping, setShipping] = useState<"standard" | "flash">("standard");
  const [videoConsent, setVideoConsent] = useState(false);
  const [obdConsent, setObdConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState<PaymentMethod | null>(null);
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");
  const [payError, setPayError] = useState("");

  const [sealId, setSealId] = useState("");

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
  const generatedSealId = `RG-${Math.floor(((Number(listing.id) * 12345) % 90000) + 10000)}`;

  const validatePayment = (): boolean => {
    setPayError("");
    if (!payMethod) {
      setPayError("Please select a payment method.");
      return false;
    }
    if (payMethod === "upi") {
      if (!upiId || !upiId.includes("@")) {
        setPayError("Enter a valid UPI ID (e.g. name@paytm)");
        return false;
      }
    }
    if (payMethod === "netbanking" && !bank) {
      setPayError("Please select a bank.");
      return false;
    }
    if (payMethod === "wallet" && !wallet) {
      setPayError("Please select a wallet.");
      return false;
    }
    return true;
  };

  const handleStripeCheckout = async () => {
    setPayError("");
    try {
      const session = await stripeCheckout.mutateAsync([
        { name: listing.model, price: total, quantity: 1 },
      ]);
      window.location.href = session.url;
    } catch (err: any) {
      setPayError(
        err?.message || "Failed to connect to Stripe. Please try again.",
      );
    }
  };

  const handleConfirm = async () => {
    if (!validatePayment()) return;
    if (payMethod === "card") {
      await handleStripeCheckout();
      return;
    }
    setConfirming(true);
    const methodLabel =
      payMethod === "upi"
        ? `UPI (${upiId})`
        : payMethod === "netbanking"
          ? `Net Banking (${bank})`
          : `Wallet (${wallet})`;
    if (actor) {
      try {
        const userId = user?.phone || user?.email || "anonymous";
        const order = await (actor as any).createOrder(
          listing.id,
          userId,
          methodLabel,
          shipping,
          BigInt(total),
        );
        setSealId(order.sealId);
      } catch (_) {
        setSealId(generatedSealId);
      }
    } else {
      setSealId(generatedSealId);
    }
    setConfirming(false);
    setConfirmed(true);
  };

  const paymentOptions: {
    id: PaymentMethod;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    { id: "upi", label: "UPI", icon: "💳", desc: "Paytm · PhonePe · GPay" },
    {
      id: "card",
      label: "Debit / Credit Card",
      icon: "💳",
      desc: "Visa · Mastercard · RuPay — powered by Stripe",
    },
    {
      id: "netbanking",
      label: "Net Banking",
      icon: "🏦",
      desc: "All major banks",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: "👜",
      desc: "Paytm · Amazon Pay · Mobikwik",
    },
  ];

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
                {(["standard", "flash"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    data-ocid={`checkout.${type}_shipping.radio`}
                    onClick={() => setShipping(type)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      shipping === type
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        shipping === type
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {shipping === type && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm text-foreground">
                        {type === "standard"
                          ? "ReGenix Standard"
                          : "ReGenix Flash ⚡"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {type === "standard"
                          ? "5 Days Delivery"
                          : "3 Days — Priority Air"}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {type === "standard" ? "FREE" : "+₹200"}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── Payment Method ── */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground">
                  Payment Method
                </div>

                {paymentOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="rounded-xl border border-border overflow-hidden"
                  >
                    <button
                      type="button"
                      data-ocid={`checkout.pay_${opt.id}.radio`}
                      onClick={() =>
                        setPayMethod(payMethod === opt.id ? null : opt.id)
                      }
                      className={`w-full flex items-center gap-4 p-4 transition-all ${
                        payMethod === opt.id
                          ? "bg-primary/5 border-b border-primary/20"
                          : "hover:bg-secondary/30"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          payMethod === opt.id
                            ? "border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {payMethod === opt.id && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {opt.label}
                          </span>
                          {opt.id === "card" && (
                            <span className="text-xs px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary font-mono">
                              Stripe
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {opt.desc}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {payMethod === opt.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-secondary/20 space-y-3">
                            {opt.id === "upi" && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  UPI ID
                                </Label>
                                <Input
                                  data-ocid="checkout.upi_id.input"
                                  placeholder="yourname@paytm"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="bg-secondary border-border text-foreground"
                                />
                                <div className="flex gap-2">
                                  {["Paytm", "PhonePe", "GPay"].map((p) => (
                                    <span
                                      key={p}
                                      className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {opt.id === "card" && (
                              <div className="space-y-4">
                                {/* Stripe badge */}
                                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                  <span className="text-primary text-xl">
                                    🔐
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      Secure Payment via Stripe
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      You'll be redirected to Stripe's encrypted
                                      checkout. Visa, Mastercard, RuPay
                                      international accepted.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  data-ocid="checkout.stripe.button"
                                  disabled={stripeCheckout.isPending}
                                  onClick={handleStripeCheckout}
                                  className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 mint-glow"
                                >
                                  {stripeCheckout.isPending ? (
                                    <>
                                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                                      Connecting to Stripe...
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 60 25"
                                        fill="currentColor"
                                        aria-label="Stripe"
                                        role="img"
                                      >
                                        <path d="M59.64 14.28h-8.06v-1.83c0-.72.55-1.25 1.4-1.25h6.46V7.5h-6.46C50.17 7.5 47.5 9.95 47.5 13v1.28h-3.3v4.22h3.3V25h5.08v-6.5h5.06v-4.22zm-23.38.52c0-1.42 1.1-1.97 2.42-1.97 1.58 0 3.07.6 4.2 1.63l2.63-3.53A9.63 9.63 0 0036.15 9c-4.15 0-7.6 2.35-7.6 6.12 0 6.78 9.22 5.4 9.22 8.2 0 1.48-1.28 2.08-2.73 2.08-2.16 0-3.8-1.1-5.13-2.38l-2.86 3.7a11.22 11.22 0 007.88 2.95c4.4 0 8.02-2.3 8.02-6.28 0-7.05-9.19-5.6-9.19-8.61zm-15.6-6.5c-1.68 0-3.14.65-4.2 1.7V.97H11.4V25h5.06v-1.43a5.6 5.6 0 004.2 1.7c4.32 0 7.44-3.5 7.44-8.23s-3.12-8.24-7.44-8.24zm-1.15 12.35c-1.8 0-3.2-1.5-3.2-4.12s1.4-4.1 3.2-4.1c1.82 0 3.2 1.48 3.2 4.1s-1.38 4.12-3.2 4.12zM0 25h5.08V8.28H0V25zm2.54-19.5a3 3 0 100-6 3 3 0 000 6z" />
                                      </svg>
                                      Pay Securely with Stripe
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {opt.id === "netbanking" && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Select Bank
                                </Label>
                                <Select value={bank} onValueChange={setBank}>
                                  <SelectTrigger
                                    data-ocid="checkout.bank.select"
                                    className="bg-secondary border-border text-foreground"
                                  >
                                    <SelectValue placeholder="Choose your bank" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BANKS.map((b) => (
                                      <SelectItem key={b} value={b}>
                                        {b}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {opt.id === "wallet" && (
                              <div className="flex gap-2 flex-wrap">
                                {WALLETS.map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    data-ocid="checkout.wallet.radio"
                                    onClick={() => setWallet(w)}
                                    className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                                      wallet === w
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-primary/40"
                                    }`}
                                  >
                                    {w}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {payError && (
                  <div
                    data-ocid="checkout.payment.error_state"
                    className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                  >
                    <span className="text-destructive text-sm">
                      ⚠ {payError}
                    </span>
                  </div>
                )}
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

              {/* Security Note */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-primary text-lg">🔐</span>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">
                    256-bit SSL Secured
                  </strong>{" "}
                  — Your payment information is encrypted end-to-end. We do not
                  store your card details.
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

              {payMethod !== "card" && (
                <button
                  type="button"
                  data-ocid="checkout.confirm_button"
                  disabled={confirming}
                  onClick={handleConfirm}
                  className="w-full bg-primary text-primary-foreground font-display font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-colors mint-glow disabled:opacity-60"
                >
                  {confirming ? "Processing..." : "Pay & Confirm Order"}
                </button>
              )}
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
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground">
                    {payMethod === "upi"
                      ? `UPI (${upiId})`
                      : payMethod === "netbanking"
                        ? `Net Banking (${bank})`
                        : `Wallet (${wallet})`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === "flash"
                      ? "ReGenix Flash (3 days)"
                      : "ReGenix Standard (5 days)"}
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
