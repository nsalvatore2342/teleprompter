import React, { useRef, useEffect } from 'react';
import { Script, Segment, Settings } from '../types';
import { estimateSeconds, formatDuration, wordCount } from '../utils/readTime';

interface Props {
  script: Script | null;
  segments: Segment[];
  settings: Settings;
  onContentChange: (content: string) => void;
  onJumpToSegment: (seg: Segment) => void;
}

export function Editor({ script, segments, settings, onContentChange, onJumpToSegment }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, [script?.id]);

  if (!script) {
    return <div className="flex-1 flex items-center justify-center text-gray-600">No script selected</div>;
  }

  const totalWords = wordCount(script.content);
  const totalTime = estimateSeconds(script.content, settings.wordsPerMinute);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Text area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
          <span className="text-sm font-medium text-gray-300 truncate">{script.name}</span>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
            {totalWords.toLocaleString()} words · {formatDuration(totalTime)}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          className="flex-1 w-full bg-gray-900 text-gray-100 p-6 script-editor outline-none resize-none text-base leading-relaxed placeholder-gray-700"
          value={script.content}
          onChange={e => onContentChange(e.target.value)}
          placeholder={`Start typing your script here...\n\nTips:\n  # Heading — starts a new segment\n  --- — inserts a manual break between segments`}
          spellCheck
        />
      </div>

      {/* Segment panel */}
      <div className="w-52 min-w-[13rem] border-l border-gray-800 bg-gray-950 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Segments</span>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {segments.map((seg, i) => {
            const secs = estimateSeconds(seg.content, settings.wordsPerMinute);
            return (
              <button
                key={seg.id}
                onClick={() => onJumpToSegment(seg)}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs text-gray-500 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate font-medium">{seg.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{seg.wordCount} words · {formatDuration(secs)}</div>
                  </div>
                </div>
              </button>
            );
          })}

          {segments.length === 0 && (
            <p className="text-xs text-gray-600 px-3 py-3 leading-relaxed">
              Use <code className="text-gray-500"># Heading</code> or <code className="text-gray-500">---</code> to split into segments
            </p>
          )}
        </div>

        <div className="px-3 py-2 border-t border-gray-800 text-xs text-gray-600">
          WPM: {settings.wordsPerMinute} · {segments.length} segment{segments.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
