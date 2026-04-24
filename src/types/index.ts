export interface Script {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  readonly?: boolean;
}

export interface Segment {
  id: string;
  title: string;
  content: string;
  charStart: number;
  wordCount: number;
}

export interface Settings {
  speed: number;        // px/sec  10–300
  fontSize: number;     // px      20–80
  lineHeight: number;   // multiplier 1.2–3.0
  textWidth: number;    // %       30–100
  mirrored: boolean;
  guidePosition: number; // % from top 10–70
  wordsPerMinute: number; // 80–250
}

export type View = 'editor' | 'teleprompter';

export const DEFAULT_SETTINGS: Settings = {
  speed: 60,
  fontSize: 36,
  lineHeight: 1.8,
  textWidth: 70,
  mirrored: false,
  guidePosition: 35,
  wordsPerMinute: 150,
};
