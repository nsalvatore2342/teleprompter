import { Segment } from '../types';

export function parseSegments(content: string): Segment[] {
  if (!content.trim()) return [];

  const lines = content.split('\n');
  const result: Segment[] = [];

  let currentTitle = '';
  let currentLines: string[] = [];
  let charPos = 0;
  let segStart = 0;
  let segIndex = 0;

  const flush = () => {
    const text = currentLines.join('\n').trim();
    if (text || currentTitle) {
      result.push({
        id: `seg-${segIndex++}`,
        title: currentTitle || 'Intro',
        content: text,
        charStart: segStart,
        wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
      });
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    const isDivider = /^-{3,}$/.test(line.trim());

    if (headingMatch) {
      flush();
      segStart = charPos;
      currentTitle = headingMatch[2].trim();
      currentLines = [];
    } else if (isDivider) {
      flush();
      segStart = charPos;
      currentTitle = `Section ${segIndex + 1}`;
      currentLines = [];
    } else {
      currentLines.push(line);
    }

    charPos += line.length + 1;
  }

  flush();

  if (result.length === 0) {
    return [{
      id: 'seg-0',
      title: 'Script',
      content: content.trim(),
      charStart: 0,
      wordCount: content.trim().split(/\s+/).filter(Boolean).length,
    }];
  }

  return result;
}
