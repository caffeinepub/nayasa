import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export function PaymentFailure() {
  return (
    <div
      data-ocid="payment_failure.page"
      className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-destructive/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md text-center relative z-10"
      >
        <div className="bg-card border border-border rounded-2xl p-12 space-y-6">
          {/* X icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            className="w-24 h-24 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center mx-auto"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl text-destructive"
            >
              ✕
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display font-black text-3xl text-foreground mb-3">
              Payment Failed
            </h1>
            <p className="text-muted-foreground">
              Something went wrong with your payment. Please try again or choose
              a different payment method.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-left"
          >
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Common reasons:</strong>{" "}
              Insufficient funds, card declined, session expired, or network
              issue. No amount was charged.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link
              to="/"
              data-ocid="payment_failure.try_again.button"
              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </Link>
            <Link
              to="/"
              data-ocid="payment_failure.home.link"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Return to Home
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
