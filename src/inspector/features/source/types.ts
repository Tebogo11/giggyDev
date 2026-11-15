export interface SourceLocation {
  id: string;
  line: number;
  column: number;
  relation?: 'selected' | 'ancestor';
}
export interface SourcePreview {
  path: string;
  code: string;
  startLine: number;
  line: number;
  column: number;
  editorUrl?: string;
  simulated?: boolean;
}
