/**
 * Application header with navigation and search
 */

"use client";

import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { APP_CONFIG } from "@/lib/constants";
import { Lightbulb } from "lucide-react";

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-mono font-bold text-xl">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <span className="hidden sm:inline">{APP_CONFIG.NAME}</span>
        </Link>

        {showSearch && (
          <div className="flex-1 max-w-2xl">
            <SearchBar placeholder="Search another topic..." />
          </div>
        )}

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
