/**
 * Grid of trending topics for homepage
 */

"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Topic } from "@/types";

interface TrendingTopicsProps {
  topics: Topic[];
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold font-mono">Trending Topics</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/explain/${topic.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {topic.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <span className="font-mono">{topic.viewCount} views</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
