/**
 * Application header with navigation and search
 * Mobile-optimized with responsive layout
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
      <div className="container mx-auto px-4 py-3 md:py-0">
        <div className="flex h-auto md:h-16 flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Logo and Navigation Row */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-mono font-bold text-lg md:text-xl">
              <div className="flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <span className="inline">{APP_CONFIG.NAME}</span>
            </Link>

            <nav className="flex items-center gap-4 md:hidden">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
              >
                Home
              </Link>
            </nav>
          </div>

          {/* Search Bar Row (full width on mobile) */}
          {showSearch && (
            <div className="flex-1 w-full md:max-w-2xl">
              <SearchBar placeholder="Search another topic..." />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
