import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export function PaymentSuccess() {
  return (
    <div
      data-ocid="payment_success.page"
      className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md text-center relative z-10"
      >
        <div className="bg-card border border-border rounded-2xl p-12 card-glow space-y-6">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl text-primary"
            >
              ✓
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display font-black text-3xl text-foreground mb-3">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Your order has been confirmed. We'll send you tracking details
              shortly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-left space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary text-lg">📦</span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Your order is being prepared
                </p>
                <p className="text-xs text-muted-foreground">
                  Lens-to-Label packing video in ~2 hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary text-lg">🔐</span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  ReGenix Seal ID assigned
                </p>
                <p className="text-xs text-muted-foreground">
                  Unique tamper-proof identifier on your package
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/"
              data-ocid="payment_success.home.link"
              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Continue Browsing
            </Link>
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Secured by ICP blockchain end-to-end encryption
        </p>
      </motion.div>
    </div>
  );
}
