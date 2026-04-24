import React, { useState, useRef, useCallback } from 'react';
import { extractText } from '../utils/fileImport';
import { wordCount } from '../utils/readTime';

interface Props {
  currentScriptName: string;
  onCreateNew: (name: string, content: string) => void;
  onReplaceCurrent: (content: string) => void;
  onClose: () => void;
}

type State = 'idle' | 'loading' | 'preview' | 'error';

export function ImportModal({ currentScriptName, onCreateNew, onReplaceCurrent, onClose }: Props) {
  const [state, setState] = useState<State>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setState('loading');
    setFileName(file.name);
    try {
      const text = await extractText(file);
      if (!text.trim()) throw new Error('No text could be extracted from this file.');
      setExtractedText(text);
      setState('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to extract text');
      setState('error');
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const scriptNameFromFile = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Import Script</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Idle: drop zone */}
          {state === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer select-none ${
                dragging
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="text-5xl mb-4 select-none">📄</div>
              <p className="text-gray-200 font-medium text-sm">
                Drop a file here, or <span className="text-indigo-400 underline underline-offset-2">click to browse</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {['PDF', 'DOCX', 'TXT', 'MD'].map(fmt => (
                  <span key={fmt} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 font-mono">
                    {fmt}
                  </span>
                ))}
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* Loading */}
          {state === 'loading' && (
            <div className="py-14 text-center">
              <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Extracting text from <span className="text-gray-200">{fileName}</span>…</p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-400 text-sm mb-5">{error}</p>
              <button
                onClick={() => { setState('idle'); setError(''); }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg transition-colors"
              >
                Try another file
              </button>
            </div>
          )}

          {/* Preview */}
          {state === 'preview' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">From:</span>
                <span className="text-xs text-gray-200 font-medium truncate flex-1">{fileName}</span>
                <button
                  onClick={() => { setState('idle'); setExtractedText(''); setFileName(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 underline flex-shrink-0"
                >
                  Change file
                </button>
              </div>

              {/* Text preview */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-44 overflow-y-auto mb-2 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {extractedText.slice(0, 1200)}
                {extractedText.length > 1200 && (
                  <span className="text-gray-600"> …({extractedText.length - 1200} more characters)</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-5">
                {wordCount(extractedText).toLocaleString()} words extracted
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onCreateNew(scriptNameFromFile, extractedText); onClose(); }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Create New Script
                </button>
                <button
                  onClick={() => { onReplaceCurrent(extractedText); onClose(); }}
                  className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Replace &ldquo;{currentScriptName}&rdquo;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
