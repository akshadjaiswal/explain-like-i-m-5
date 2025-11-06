import { Linkedin } from "lucide-react";

/**
 * Application footer
 */

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6 px-4">
        <div className="grid w-full gap-4 text-center md:grid-cols-[1fr_auto] md:items-start md:text-left">
          <p className="text-xs text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ExplainLevels. All rights reserved.
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:items-end md:text-right md:justify-self-end">
            <p className="flex items-center gap-1 font-medium text-foreground">
              Built by{" "}
              <a
                href="https://github.com/akshadjaiswal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Akshad on GitHub"
                className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
              >
                <span aria-hidden="true">🐙</span>
                <span>Akshad</span>
              </a>
            </p>
            <p className="text-xs">
              <a
                href="https://github.com/akshadjaiswal/explain-like-i-m-5"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Open source contributions accepted
              </a>
            </p>
            <div className="flex items-center gap-6 text-xs font-medium text-foreground">
              <a
                href="https://www.linkedin.com/in/akshadsantoshjaiswal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                <span>@akshadsantoshjaiswal</span>
              </a>
              <a
                href="https://x.com/akshad_999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[0.65rem] font-semibold"
                >
                  𝕏
                </span>
                <span>@akshad_999</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
