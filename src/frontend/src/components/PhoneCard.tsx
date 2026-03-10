import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import type { PhoneListing } from "../backend";
import {
  brandGradient,
  calcHealthScore,
  conditionColors,
  formatINR,
} from "../utils/format";

interface PhoneCardProps {
  listing: PhoneListing;
  index: number;
}

export function PhoneCard({ listing, index }: PhoneCardProps) {
  const healthScore = calcHealthScore(
    listing.batteryHealth,
    listing.diagnosticResults,
  );
  const savings = Number(listing.retailPrice) - Number(listing.naiasaPrice);
  const savingsPct = Math.round((savings / Number(listing.retailPrice)) * 100);
  const { bg, text } = conditionColors(listing.condition);
  const gradClass = brandGradient(listing.brand);

  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id.toString() }}
      data-ocid={`listing.item.${index}`}
      className="group block rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:card-glow overflow-hidden"
    >
      {/* Phone image placeholder */}
      <div
        className={`relative h-44 ${gradClass} flex items-center justify-center overflow-hidden`}
      >
        <div className="text-center select-none">
          <div className="font-display font-black text-3xl text-foreground/20 tracking-widest uppercase">
            {listing.brand}
          </div>
          <div className="font-mono text-xs text-foreground/10 mt-1">
            {listing.storage.toString()}GB
          </div>
        </div>
        {/* Health score overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-1">
          <div
            className={`w-2 h-2 rounded-full ${
              healthScore >= 90
                ? "bg-primary"
                : healthScore >= 75
                  ? "bg-blue-400"
                  : "bg-yellow-400"
            }`}
          />
          <span className="text-xs font-mono font-bold text-foreground">
            {healthScore}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display font-semibold text-sm text-foreground leading-tight">
              {listing.model}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {listing.storage.toString()} GB
            </p>
          </div>
          <Badge className={`${bg} ${text} border-0 text-xs shrink-0`}>
            {listing.condition}
          </Badge>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="font-display font-bold text-lg text-foreground">
              {formatINR(listing.naiasaPrice)}
            </div>
            <div className="text-xs text-muted-foreground line-through">
              {formatINR(listing.retailPrice)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-primary">
              {savingsPct}% off
            </div>
            <div className="text-xs text-muted-foreground">
              Save {formatINR(savings)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
