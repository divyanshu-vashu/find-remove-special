import { AnalysisStats } from "@/types/character";
import { FileText, AlertTriangle, Clock, Hash } from "lucide-react";

interface StatsDisplayProps {
  stats: AnalysisStats | null;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  if (!stats) return null;

  const items = [
    {
      icon: FileText,
      label: "Characters",
      value: stats.totalCharacters.toLocaleString(),
    },
    {
      icon: Hash,
      label: "Lines",
      value: stats.linesAnalyzed.toLocaleString(),
    },
    {
      icon: AlertTriangle,
      label: "Issues Found",
      value: stats.specialCharactersFound.toLocaleString(),
      highlight: stats.specialCharactersFound > 0,
    },
    {
      icon: Clock,
      label: "Time",
      value: `${stats.processingTime.toFixed(1)}ms`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
      {items.map((item) => (
        <div
          key={item.label}
          className={`p-4 rounded-lg border transition-all ${
            item.highlight
              ? "bg-warning/10 border-warning/30"
              : "bg-card border-border"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <item.icon
              className={`w-4 h-4 ${
                item.highlight ? "text-warning" : "text-muted-foreground"
              }`}
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <p
            className={`text-xl font-mono font-semibold ${
              item.highlight ? "text-warning" : "text-foreground"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
