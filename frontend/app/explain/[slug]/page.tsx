/**
 * Explanation page - displays explanations for a topic at all complexity levels
 */

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ExplanationViewer } from "@/components/explanation/explanation-viewer";
import { getCachedExplanations } from "@/lib/cache/service";
import { slugToTitle } from "@/lib/utils/slugify";
import { Metadata } from "next";

interface ExplainPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ExplainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slugToTitle(slug);

  return {
    title: `${title} Explained | ExplainLevels`,
    description: `Understand ${title} at your level - from beginner to expert explanations.`,
  };
}

export default async function ExplainPage({ params }: ExplainPageProps) {
  const { slug } = await params;
  const topicTitle = slugToTitle(slug);

  // Try to get cached explanations
  const cached = await getCachedExplanations(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
          {/* Topic Header */}
          <div className="mb-8 space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-mono">
              {topicTitle}
            </h1>
            <p className="text-muted-foreground">
              Explained at four progressive complexity levels
            </p>
          </div>

          {/* Explanation Viewer */}
          <ExplanationViewer slug={slug} topicTitle={topicTitle} cached={cached} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
