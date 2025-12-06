import { SpecialCharacterResult, AnalysisStats } from "@/types/character";

// Standard keyboard characters (ASCII printable + common whitespace)
const STANDARD_CHARS = new Set<number>([
  // Printable ASCII (32-126)
  ...Array.from({ length: 95 }, (_, i) => i + 32),
  // Common whitespace
  9,  // Tab
  10, // Line Feed
  13, // Carriage Return
]);

// Unicode character names for common special characters
const UNICODE_NAMES: Record<number, string> = {
  0: "NULL",
  8: "BACKSPACE",
  11: "VERTICAL TAB",
  12: "FORM FEED",
  127: "DELETE",
  160: "NO-BREAK SPACE",
  173: "SOFT HYPHEN",
  8194: "EN SPACE",
  8195: "EM SPACE",
  8196: "THREE-PER-EM SPACE",
  8197: "FOUR-PER-EM SPACE",
  8198: "SIX-PER-EM SPACE",
  8199: "FIGURE SPACE",
  8200: "PUNCTUATION SPACE",
  8201: "THIN SPACE",
  8202: "HAIR SPACE",
  8203: "ZERO WIDTH SPACE",
  8204: "ZERO WIDTH NON-JOINER",
  8205: "ZERO WIDTH JOINER",
  8206: "LEFT-TO-RIGHT MARK",
  8207: "RIGHT-TO-LEFT MARK",
  8208: "HYPHEN",
  8209: "NON-BREAKING HYPHEN",
  8210: "FIGURE DASH",
  8211: "EN DASH",
  8212: "EM DASH",
  8213: "HORIZONTAL BAR",
  8216: "LEFT SINGLE QUOTATION MARK",
  8217: "RIGHT SINGLE QUOTATION MARK",
  8218: "SINGLE LOW-9 QUOTATION MARK",
  8219: "SINGLE HIGH-REVERSED-9 QUOTATION MARK",
  8220: "LEFT DOUBLE QUOTATION MARK",
  8221: "RIGHT DOUBLE QUOTATION MARK",
  8222: "DOUBLE LOW-9 QUOTATION MARK",
  8223: "DOUBLE HIGH-REVERSED-9 QUOTATION MARK",
  8226: "BULLET",
  8230: "HORIZONTAL ELLIPSIS",
  8239: "NARROW NO-BREAK SPACE",
  8242: "PRIME",
  8243: "DOUBLE PRIME",
  8249: "SINGLE LEFT-POINTING ANGLE QUOTATION MARK",
  8250: "SINGLE RIGHT-POINTING ANGLE QUOTATION MARK",
  8260: "FRACTION SLASH",
  8722: "MINUS SIGN",
  65279: "BYTE ORDER MARK (BOM)",
  65533: "REPLACEMENT CHARACTER",
};

function getUnicodeName(charCode: number): string {
  if (UNICODE_NAMES[charCode]) {
    return UNICODE_NAMES[charCode];
  }
  
  if (charCode < 32) {
    return `CONTROL CHARACTER (${charCode})`;
  }
  
  if (charCode >= 0x0080 && charCode <= 0x00FF) {
    return "LATIN-1 SUPPLEMENT";
  }
  
  if (charCode >= 0x0100 && charCode <= 0x017F) {
    return "LATIN EXTENDED-A";
  }
  
  if (charCode >= 0x0180 && charCode <= 0x024F) {
    return "LATIN EXTENDED-B";
  }
  
  if (charCode >= 0x0370 && charCode <= 0x03FF) {
    return "GREEK";
  }
  
  if (charCode >= 0x0400 && charCode <= 0x04FF) {
    return "CYRILLIC";
  }
  
  if (charCode >= 0x0600 && charCode <= 0x06FF) {
    return "ARABIC";
  }
  
  if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
    return "CJK UNIFIED IDEOGRAPH";
  }
  
  if (charCode >= 0x1F300 && charCode <= 0x1F9FF) {
    return "EMOJI";
  }
  
  return `UNICODE U+${charCode.toString(16).toUpperCase().padStart(4, '0')}`;
}

function getContext(text: string, position: number, contextLength: number = 15): string {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(text.length, position + contextLength + 1);
  
  let context = text.slice(start, end);
  
  // Replace non-printable characters with visible representations
  context = context.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code === 10) return '↵';
    if (code === 13) return '⏎';
    if (code === 9) return '→';
    return `‹${code}›`;
  });
  
  if (start > 0) context = '…' + context;
  if (end < text.length) context = context + '…';
  
  return context;
}

export function analyzeText(text: string): { results: SpecialCharacterResult[]; stats: AnalysisStats } {
  const startTime = performance.now();
  const results: SpecialCharacterResult[] = [];
  
  let line = 1;
  let column = 1;
  let lineStart = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);
    
    // Handle surrogate pairs for characters outside BMP
    if (charCode >= 0xD800 && charCode <= 0xDBFF && i + 1 < text.length) {
      const nextChar = text.charCodeAt(i + 1);
      if (nextChar >= 0xDC00 && nextChar <= 0xDFFF) {
        // This is a surrogate pair - calculate full code point
        const fullCodePoint = ((charCode - 0xD800) * 0x400) + (nextChar - 0xDC00) + 0x10000;
        
        results.push({
          line,
          column,
          character: text.slice(i, i + 2),
          charCode: fullCodePoint,
          unicodeName: getUnicodeName(fullCodePoint),
          context: getContext(text, i),
        });
        
        i++; // Skip the next character as it's part of the pair
        column++;
        continue;
      }
    }
    
    if (!STANDARD_CHARS.has(charCode)) {
      results.push({
        line,
        column,
        character: char,
        charCode,
        unicodeName: getUnicodeName(charCode),
        context: getContext(text, i),
      });
    }
    
    // Update line and column tracking
    if (char === '\n') {
      line++;
      column = 1;
      lineStart = i + 1;
    } else {
      column++;
    }
  }
  
  const processingTime = performance.now() - startTime;
  
  const stats: AnalysisStats = {
    totalCharacters: text.length,
    specialCharactersFound: results.length,
    linesAnalyzed: line,
    processingTime,
  };
  
  return { results, stats };
}

export function escapeSpecialChar(char: string): string {
  const code = char.charCodeAt(0);
  if (code < 32 || code === 127) {
    return `\\x${code.toString(16).padStart(2, '0')}`;
  }
  return `\\u${code.toString(16).padStart(4, '0')}`;
}
