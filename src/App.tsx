import React, { useState, useMemo } from 'react';
import { View, DEFAULT_SETTINGS, Settings } from './types';
import { useScripts } from './hooks/useScripts';
import { parseSegments } from './utils/segments';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TeleprompterView } from './components/TeleprompterView';

export default function App() {
  const { scripts, activeScript, activeId, setActiveId, createScript, updateContent, renameScript, deleteScript, duplicateScript } = useScripts();
  const [view, setView] = useState<View>('editor');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const segments = useMemo(
    () => parseSegments(activeScript?.content ?? ''),
    [activeScript?.content]
  );

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const handleEditorJump = (seg: { charStart: number }) => {
    // In editor, highlight the segment's start in the textarea (scroll via cursor position)
    // We just focus the editor; full jump is handled inside Editor if needed
    console.log('jump to char', seg.charStart);
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
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold text-sm tracking-wide">Teleprompter</span>
            {activeScript && view === 'editor' && (
              <span className="text-gray-600 text-sm">/ {activeScript.name}</span>
            )}
          </div>

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

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {view === 'editor' ? (
            <Editor
              script={activeScript}
              segments={segments}
              settings={settings}
              onContentChange={content => activeScript && updateContent(activeScript.id, content)}
              onJumpToSegment={handleEditorJump}
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
