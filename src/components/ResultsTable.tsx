import { useCallback, useMemo, useState } from "react";
import { SpecialCharacterResult } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ResultsTableProps {
  results: SpecialCharacterResult[];
}

const ITEMS_PER_PAGE = 50;

export function ResultsTable({ results }: ResultsTableProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  
  const paginatedResults = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, page]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, []);

  const copyAllPositions = useCallback(() => {
    const positions = results
      .map((r) => `Line ${r.line}, Col ${r.column}: "${r.character}" (${r.unicodeName})`)
      .join("\n");
    navigator.clipboard.writeText(positions);
    toast.success(`Copied ${results.length} positions to clipboard`);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Special Characters Found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Your text contains only standard keyboard characters. It should be safe to use in forms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Special Characters Found
        </h3>
        <Button variant="outline" size="sm" onClick={copyAllPositions}>
          <Copy className="w-4 h-4 mr-2" />
          Copy All
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Position
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Char
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Context
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((result, index) => (
                <tr
                  key={`${result.line}-${result.column}-${index}`}
                  className="result-row border-b border-border/50 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-primary">
                    {result.line}:{result.column}
                  </td>
                  <td className="px-4 py-3">
                    <span className="highlight-char font-mono">
                      {result.character || "‹empty›"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    U+{result.charCode.toString(16).toUpperCase().padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {result.unicodeName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                    {result.context}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(`Line ${result.line}, Column ${result.column}`)
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * ITEMS_PER_PAGE + 1}-
            {Math.min((page + 1) * ITEMS_PER_PAGE, results.length)} of{" "}
            {results.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
