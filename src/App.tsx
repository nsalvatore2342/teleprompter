import React, { useState, useMemo } from 'react';
import { View, DEFAULT_SETTINGS, Settings } from './types';
import { useScripts } from './hooks/useScripts';
import { parseSegments } from './utils/segments';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TeleprompterView } from './components/TeleprompterView';

const SHORTCUTS = [
  { key: 'Space', label: 'Play / Pause' },
  { key: '↑ / ↓', label: 'Speed' },
  { key: '← / →', label: 'Jump back/fwd' },
  { key: 'R', label: 'Reset' },
  { key: 'F', label: 'Fullscreen' },
];

export default function App() {
  const { scripts, activeScript, activeId, setActiveId, createScript, updateContent, renameScript, deleteScript, duplicateScript, createWithContent } = useScripts();
  const [view, setView] = useState<View>('editor');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showTips, setShowTips] = useState(false);

  const segments = useMemo(
    () => parseSegments(activeScript?.content ?? ''),
    [activeScript?.content]
  );

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {view === 'editor' && (
        <Sidebar
          scripts={scripts}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createScript}
          onRename={renameScript}
          onDelete={deleteScript}
          onDuplicate={duplicateScript}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-indigo-400 font-semibold text-sm tracking-wide flex-shrink-0">Teleprompter</span>
            {activeScript && view === 'editor' && (
              <span className="text-gray-600 text-sm truncate">/ {activeScript.name}</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Keyboard tips */}
            <div className="relative">
              <button
                onClick={() => setShowTips(v => !v)}
                title="Keyboard shortcuts"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                  showTips
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-transparent border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                <span>⌨</span>
                <span className="hidden sm:inline">Shortcuts</span>
              </button>

              {showTips && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 w-64">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Teleprompter Shortcuts
                  </p>
                  <div className="space-y-2">
                    {SHORTCUTS.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">{label}</span>
                        <kbd className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-gray-200 font-mono">
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                  <hr className="border-gray-700 my-3" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Move your mouse to show controls while playing. Controls auto-hide after 3 seconds.
                  </p>
                </div>
              )}
            </div>

            {/* Edit / Preview toggle */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setView('editor')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'editor' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                ✏ Edit
              </button>
              <button
                onClick={() => setView('teleprompter')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'teleprompter' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                ▶ Preview
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col relative" onClick={() => showTips && setShowTips(false)}>
          {view === 'editor' ? (
            <Editor
              script={activeScript}
              segments={segments}
              settings={settings}
              onContentChange={content => activeScript && updateContent(activeScript.id, content)}
              onJumpToSegment={() => {}}
              onCreateWithContent={createWithContent}
            />
          ) : (
            <TeleprompterView
              script={activeScript}
              segments={segments}
              settings={settings}
              onSettingsChange={updateSettings}
              onExit={() => setView('editor')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
