/**
 * Application footer
 */

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 px-4 md:flex-row">
        <p className="text-sm text-muted-foreground font-mono">
          Built with Next.js, Supabase & Gemini AI
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ExplainLevels. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
