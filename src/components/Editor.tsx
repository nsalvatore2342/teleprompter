import React, { useRef, useEffect, useState } from 'react';
import { Script, Segment, Settings } from '../types';
import { estimateSeconds, formatDuration, wordCount } from '../utils/readTime';
import { ImportModal } from './ImportModal';

interface Props {
  script: Script | null;
  segments: Segment[];
  settings: Settings;
  onContentChange: (content: string) => void;
  onJumpToSegment: (seg: Segment) => void;
  onCreateWithContent: (name: string, content: string) => void;
}

export function Editor({ script, segments, settings, onContentChange, onJumpToSegment, onCreateWithContent }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, [script?.id]);

  if (!script) {
    return <div className="flex-1 flex items-center justify-center text-gray-600">No script selected</div>;
  }

  const totalWords = wordCount(script.content);
  const totalTime = estimateSeconds(script.content, settings.wordsPerMinute);

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Text area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 gap-3">
            <span className="text-sm font-medium text-gray-300 truncate">{script.name}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {totalWords.toLocaleString()} words · {formatDuration(totalTime)}
              </span>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded text-xs font-medium transition-colors"
              >
                <span>↑</span> Import
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="flex-1 w-full bg-gray-900 text-gray-100 p-6 script-editor outline-none resize-none text-base leading-relaxed placeholder-gray-700"
            value={script.content}
            onChange={e => onContentChange(e.target.value)}
            placeholder={`Start typing your script here, or click Import to load a PDF, DOCX, or TXT file.\n\nTips:\n  # Heading — starts a new segment\n  --- — inserts a manual break between segments`}
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
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-1">
                    <span className="text-xs text-gray-500 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
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

      {showImport && (
        <ImportModal
          currentScriptName={script.name}
          onCreateNew={onCreateWithContent}
          onReplaceCurrent={content => onContentChange(content)}
          onClose={() => setShowImport(false)}
        />
      )}
    </>
  );
}
