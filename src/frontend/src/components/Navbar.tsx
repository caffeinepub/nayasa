import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
      <Link
        to="/"
        className="font-display font-bold text-xl text-primary mint-text-glow tracking-tight"
      >
        Naya<span className="text-foreground">Sa</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/"
          data-ocid="nav.browse.link"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse
        </Link>
        <Link
          to="/sell"
          data-ocid="nav.sell.link"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Sell Your Phone
        </Link>
      </div>
    </nav>
  );
}
