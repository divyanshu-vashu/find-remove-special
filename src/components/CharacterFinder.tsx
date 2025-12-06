import { useState, useCallback, useTransition } from "react";
import { TextInput } from "./TextInput";
import { StatsDisplay } from "./StatsDisplay";
import { ResultsTable } from "./ResultsTable";
import { analyzeText } from "@/utils/characterAnalyzer";
import { SpecialCharacterResult, AnalysisStats } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Search, Terminal } from "lucide-react";

export function CharacterFinder() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<SpecialCharacterResult[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) return;

    startTransition(() => {
      const { results: analysisResults, stats: analysisStats } = analyzeText(text);
      setResults(analysisResults);
      setStats(analysisStats);
      setHasAnalyzed(true);
    });
  }, [text]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResults([]);
      setStats(null);
    }
  }, [hasAnalyzed]);

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Special Character Finder
              </h1>
              <p className="text-sm text-muted-foreground">
                Detect non-keyboard characters that break form submissions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Input Section */}
          <section className="bg-card border border-border rounded-xl p-6">
            <TextInput
              value={text}
              onChange={handleTextChange}
              isAnalyzing={isPending}
            />
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isPending}
                className="glow-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                {isPending ? "Analyzing..." : "Analyze Text"}
              </Button>
            </div>
          </section>

          {/* Stats Section */}
          {stats && (
            <section>
              <StatsDisplay stats={stats} />
            </section>
          )}

          {/* Results Section */}
          {hasAnalyzed && (
            <section className="bg-card border border-border rounded-xl p-6">
              <ResultsTable results={results} />
            </section>
          )}

          {/* Info Section */}
          {!hasAnalyzed && (
            <section className="text-center py-12 animate-fade-in">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Terminal className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">
                  Paste Your Text to Begin
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This tool identifies characters outside the standard keyboard range
                  that can cause issues with form submissions, databases, and APIs.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  {["Smart quotes", "Em dashes", "Non-breaking spaces", "Zero-width chars", "BOM markers"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded-md text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Handles large text files (200k+ characters) • Detects Unicode special characters • Shows line & column positions
          </p>
        </div>
      </footer>
    </div>
  );
}
