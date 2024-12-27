import { Github, Twitter, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://twitter.com/_mallentino"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Mallentin
            </a>
            . © {currentYear} All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/Mallentin0"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://x.com/_mallentino"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://www.tiktok.com/@mallentino.ai"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">TikTok</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}