export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  return (
    <footer className="border-t border-border mt-24 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display font-bold text-lg text-primary">
          Naya<span className="text-foreground">Sa</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          &copy; {year}. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">
            "Naya Jaisa Luck, Purane Jaisa Daam."
          </span>
        </p>
      </div>
    </footer>
  );
}
