import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { PhoneCard } from "../components/PhoneCard";
import { useListingsByBrand } from "../hooks/useQueries";

const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Xiaomi", "Google"];

const BRAND_ICONS: Record<string, string> = {
  All: "◉",
  Apple: "🍎",
  Samsung: "📱",
  OnePlus: "1+",
  Xiaomi: "小",
  Google: "G",
};

export function Home() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const { data: listings, isLoading } = useListingsByBrand(selectedBrand);

  return (
    <div data-ocid="home.page" className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10"
            style={{
              background:
                "radial-gradient(ellipse, oklch(0.88 0.17 168) 0%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center relative"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-mint" />
            <span className="text-xs font-mono text-primary tracking-wider">
              AI-VERIFIED REFURBISHED PHONES
            </span>
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl text-foreground leading-none tracking-tight mb-6">
            Stop Guessing.
            <br />
            <span className="text-primary mint-text-glow">Start Seeing.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            India&apos;s First AI-Verified Refurbished Phone Store. Every device
            forensically scanned, component-checked, and certified.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#listings"
              className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors mint-glow"
            >
              Browse Phones
            </a>
            <Link
              to="/sell"
              data-ocid="listing.sell_button"
              className="border border-primary/30 text-primary font-semibold px-8 py-3.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Sell Your Phone
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Warehouse Tally */}
      <section className="px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="border border-primary/20 bg-primary/5 rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary tracking-widest">
                LIVE WAREHOUSE
              </span>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <div className="font-display font-black text-2xl text-foreground">
                  1,240
                </div>
                <div className="text-xs text-muted-foreground">
                  Phones Packed Today
                </div>
              </div>
              <div className="text-center">
                <div className="font-display font-black text-2xl text-foreground">
                  420
                </div>
                <div className="text-xs text-muted-foreground">
                  Undergoing AI-Surgeon Scan
                </div>
              </div>
              <div className="text-center">
                <div className="font-display font-black text-2xl text-primary mint-text-glow">
                  98.7%
                </div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Filter + Listings */}
      <section id="listings" className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Brand Filter */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {BRANDS.map((brand) => (
              <button
                type="button"
                key={brand}
                data-ocid="home.brand_filter.tab"
                onClick={() => setSelectedBrand(brand)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-primary text-primary-foreground mint-glow"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <span>{BRAND_ICONS[brand] || brand[0]}</span>
                {brand}
              </button>
            ))}
          </div>

          {/* Listing Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
                <div
                  key={k}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {(listings ?? []).map((listing, i) => (
                <motion.div
                  key={listing.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4 },
                    },
                  }}
                >
                  <PhoneCard listing={listing} index={i + 1} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && (!listings || listings.length === 0) && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No listings found for this brand.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
