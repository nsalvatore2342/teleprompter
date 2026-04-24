import React, { useState, useRef, useCallback, useEffect } from 'react';
import { extractText } from '../utils/fileImport';
import { wordCount } from '../utils/readTime';

type ModalStep = 'method' | 'import' | 'paste';
type ImportSubState = 'idle' | 'loading' | 'preview' | 'error';

interface Props {
  replaceTarget?: { id: string; name: string };
  initialStep?: ModalStep;
  onCreateWithContent: (name: string, content: string) => void;
  onReplaceContent: (id: string, content: string) => void;
  onClose: () => void;
}

export function NewScriptModal({ replaceTarget, initialStep = 'method', onCreateWithContent, onReplaceContent, onClose }: Props) {
  const [step, setStep] = useState<ModalStep>(initialStep);
  const [importSub, setImportSub] = useState<ImportSubState>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [scriptName, setScriptName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === 'paste' && pasteRef.current) pasteRef.current.focus();
  }, [step]);

  const resetImportState = () => {
    setImportSub('idle');
    setExtractedText('');
    setFileName('');
    setImportError('');
    setDragging(false);
  };

  const goBack = () => {
    if (initialStep === 'import') {
      onClose();
    } else {
      setStep('method');
      resetImportState();
      setPasteText('');
      setScriptName('');
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setImportSub('loading');
    setFileName(file.name);
    try {
      const text = await extractText(file);
      if (!text.trim()) throw new Error('No text could be extracted from this file.');
      setExtractedText(text);
      setScriptName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      setImportSub('preview');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to extract text.');
      setImportSub('error');
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const confirmCreate = (content: string) => {
    onCreateWithContent(scriptName.trim() || 'Untitled Script', content);
    onClose();
  };

  const confirmReplace = (content: string) => {
    if (replaceTarget) {
      onReplaceContent(replaceTarget.id, content);
      onClose();
    }
  };

  const headerTitle = step === 'method' ? 'New Script' : step === 'import' ? 'Import File' : 'Paste Text';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full mx-4"
        style={{ maxWidth: step === 'method' ? '28rem' : '34rem' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-800">
          {step !== 'method' && (
            <button
              onClick={goBack}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-base flex-shrink-0"
              title="Back"
            >
              ←
            </button>
          )}
          <h2 className="text-base font-semibold text-white flex-1">{headerTitle}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-xl leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        <div className="p-6">

          {/* ── Step 1: Method Choice ── */}
          {step === 'method' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('import')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-left group"
              >
                <span className="text-4xl">📄</span>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Import File</div>
                  <div className="text-xs text-gray-500 leading-relaxed">PDF, DOCX, TXT, or MD</div>
                </div>
              </button>
              <button
                onClick={() => setStep('paste')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-left group"
              >
                <span className="text-4xl">✎</span>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Paste Text</div>
                  <div className="text-xs text-gray-500 leading-relaxed">Type or paste your script</div>
                </div>
              </button>
            </div>
          )}

          {/* ── Step 2a: Import ── */}
          {step === 'import' && (
            <>
              {importSub === 'idle' && (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer select-none ${
                    dragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-5xl mb-4 select-none">📄</div>
                  <p className="text-gray-200 font-medium text-sm">
                    Drop a file here, or <span className="text-indigo-400 underline underline-offset-2">click to browse</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {['PDF', 'DOCX', 'TXT', 'MD'].map(fmt => (
                      <span key={fmt} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 font-mono">{fmt}</span>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>
              )}

              {importSub === 'loading' && (
                <div className="py-14 text-center">
                  <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-400 text-sm">Extracting text from <span className="text-gray-200">{fileName}</span>…</p>
                </div>
              )}

              {importSub === 'error' && (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-red-400 text-sm mb-5">{importError}</p>
                  <button
                    onClick={() => { resetImportState(); }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg transition-colors"
                  >
                    Try another file
                  </button>
                </div>
              )}

              {importSub === 'preview' && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">From:</span>
                    <span className="text-xs text-gray-200 font-medium truncate flex-1">{fileName}</span>
                    <button
                      onClick={resetImportState}
                      className="text-xs text-gray-500 hover:text-gray-300 underline flex-shrink-0"
                    >
                      Change file
                    </button>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-36 overflow-y-auto mb-3 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {extractedText.slice(0, 1200)}
                    {extractedText.length > 1200 && <span className="text-gray-600"> …({(extractedText.length - 1200).toLocaleString()} more chars)</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{wordCount(extractedText).toLocaleString()} words extracted</p>

                  {/* Script name field */}
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Script name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                      value={scriptName}
                      onChange={e => setScriptName(e.target.value)}
                      placeholder="Untitled Script"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {replaceTarget ? (
                      <>
                        <button
                          onClick={() => confirmReplace(extractedText)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Replace &ldquo;{replaceTarget.name}&rdquo;
                        </button>
                        <button
                          onClick={() => confirmCreate(extractedText)}
                          className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Create New Script
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => confirmCreate(extractedText)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Create Script
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Step 2b: Paste ── */}
          {step === 'paste' && (
            <>
              <textarea
                ref={pasteRef}
                className="w-full h-48 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed font-sans mb-4"
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste your script here…"
                spellCheck
              />
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Script name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                  value={scriptName}
                  onChange={e => setScriptName(e.target.value)}
                  placeholder="Untitled Script"
                />
              </div>
              <button
                onClick={() => confirmCreate(pasteText)}
                disabled={!pasteText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Script
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
