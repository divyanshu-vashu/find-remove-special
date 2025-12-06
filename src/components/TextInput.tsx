import { useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Trash2, FileText } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  isAnalyzing: boolean;
}

export function TextInput({ value, onChange, isAnalyzing }: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange("");
    textareaRef.current?.focus();
  }, [onChange]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onChange(text);
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  }, [onChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Input Text
        </label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            className="text-muted-foreground hover:text-foreground"
          >
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Paste
          </Button>
          <label>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <span>
                <FileText className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
            <input
              type="file"
              accept=".txt,.csv,.json,.xml,.html,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive/70 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your text here to analyze for special characters..."
          className="min-h-[200px] max-h-[400px] font-mono text-sm resize-y bg-input border-border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          disabled={isAnalyzing}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
            <div className="flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {value.length.toLocaleString()} characters
      </p>
    </div>
  );
}
