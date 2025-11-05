import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchBar } from "@/components/search/search-bar";
import { TrendingTopics } from "@/components/home/trending-topics";
import { getTrendingTopics } from "@/lib/cache/service";
import { APP_CONFIG } from "@/lib/constants";

export default async function Home() {
  // Fetch trending topics server-side
  const trendingTopics = await getTrendingTopics(12);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="flex flex-col items-center justify-center gap-8 text-center">
              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-mono">
                  Understand{" "}
                  <span className="text-primary">Any Topic</span>
                  <br />
                  at Your Level
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {APP_CONFIG.DESCRIPTION}. From beginner to expert - we explain
                  it all.
                </p>
              </div>

              <div className="w-full max-w-2xl mx-auto">
                <SearchBar
                  placeholder="What do you want to understand? (e.g., Quantum Computing)"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">Try:</span>
                <a
                  href="/explain/blockchain"
                  className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/80 transition-colors"
                >
                  Blockchain
                </a>
                <a
                  href="/explain/machine-learning"
                  className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/80 transition-colors"
                >
                  Machine Learning
                </a>
                <a
                  href="/explain/quantum-physics"
                  className="rounded-full bg-secondary px-3 py-1 hover:bg-secondary/80 transition-colors"
                >
                  Quantum Physics
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Topics Section */}
        <section className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <TrendingTopics topics={trendingTopics} />
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
            <div className="grid gap-8 md:grid-cols-3 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-mono">
                  4 Complexity Levels
                </h3>
                <p className="text-sm text-muted-foreground">
                  From ELI5 to PhD-level explanations, all in one place.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-mono">
                  Instant Results
                </h3>
                <p className="text-sm text-muted-foreground">
                  Smart caching delivers explanations in under 200ms.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-mono">
                  AI-Powered
                </h3>
                <p className="text-sm text-muted-foreground">
                  Powered by Google's Gemini AI for accurate, detailed explanations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
