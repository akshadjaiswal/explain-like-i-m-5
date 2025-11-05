/**
 * Search bar with autocomplete for topics
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { createSlug } from "@/lib/utils/slugify";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  placeholder = "Search any topic... (e.g., Quantum Physics)",
  autoFocus = false,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query to avoid firing on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return [];
      const res = await fetch(`/api/topics/search?q=${encodeURIComponent(debouncedQuery)}`);
      const data = await res.json();
      return data.topics || [];
    },
    enabled: debouncedQuery.trim().length >= 2,
  });

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    // Immediate visual feedback
    setIsSearching(true);
    setShowSuggestions(false);
    setQuery(searchTerm); // Keep the search term visible

    const slug = createSlug(searchTerm);

    // Add slight delay for visual feedback before navigation
    setTimeout(() => {
      router.push(`/explain/${slug}`);
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (title: string) => {
    setQuery(title);
    handleSearch(title);
  };

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2 && suggestions && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, suggestions]);

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2 && suggestions && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            autoFocus={autoFocus}
            disabled={isSearching}
            className="pl-10 font-sans"
          />
        </div>
        <Button type="submit" disabled={!query.trim() || isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Explain"
          )}
        </Button>
      </form>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 p-2 max-h-60 overflow-auto">
          <div className="space-y-1">
            {suggestions.map((topic: any) => (
              <button
                key={topic.id}
                onClick={() => handleSuggestionClick(topic.title)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <div className="font-medium">{topic.title}</div>
                <div className="text-xs text-muted-foreground">
                  {topic.viewCount} views
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Loading indicator */}
      {isLoading && debouncedQuery.trim().length >= 2 && (
        <Card className="absolute z-50 w-full mt-2 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        </Card>
      )}
    </div>
  );
}
