export interface SpecialCharacterResult {
  line: number;
  column: number;
  character: string;
  charCode: number;
  unicodeName: string;
  context: string;
}

export interface AnalysisStats {
  totalCharacters: number;
  specialCharactersFound: number;
  linesAnalyzed: number;
  processingTime: number;
}
