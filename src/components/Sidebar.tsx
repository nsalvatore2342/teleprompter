import React, { useState, useRef, useEffect } from 'react';
import { Script } from '../types';

interface Props {
  scripts: Script[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function Sidebar({ scripts, activeId, onSelect, onCreate, onRename, onDelete, onDuplicate }: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.select();
  }, [renamingId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const startRename = (script: Script) => {
    setMenuId(null);
    setRenamingId(script.id);
    setRenameValue(script.name);
  };

  const commitRename = () => {
    if (renamingId) {
      onRename(renamingId, renameValue);
      setRenamingId(null);
    }
  };

  return (
    <div className="flex flex-col w-56 min-w-[14rem] bg-gray-950 border-r border-gray-800 h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Scripts</span>
        <button
          onClick={onCreate}
          title="New script"
          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {scripts.map(script => (
          <div
            key={script.id}
            className={`group relative flex items-center px-3 py-2 mx-1 rounded cursor-pointer transition-colors ${
              script.id === activeId ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            onClick={() => onSelect(script.id)}
          >
            {renamingId === script.id ? (
              <input
                ref={renameRef}
                className="flex-1 bg-transparent outline-none text-sm text-white min-w-0"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenamingId(null);
                  e.stopPropagation();
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm truncate">{script.name}</span>
            )}

            {renamingId !== script.id && (
              <button
                className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-white/10 transition-opacity text-gray-400 hover:text-white"
                onClick={e => { e.stopPropagation(); setMenuId(menuId === script.id ? null : script.id); }}
              >
                ···
              </button>
            )}

            {menuId === script.id && (
              <div
                ref={menuRef}
                className="absolute right-0 top-8 z-50 w-36 bg-gray-800 border border-gray-700 rounded shadow-xl py-1"
                onClick={e => e.stopPropagation()}
              >
                <button className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700" onClick={() => startRename(script)}>Rename</button>
                <button className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700" onClick={() => { setMenuId(null); onDuplicate(script.id); }}>Duplicate</button>
                <hr className="border-gray-700 my-1" />
                <button className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700" onClick={() => { setMenuId(null); onDelete(script.id); }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={onCreate}
          className="w-full py-1.5 text-sm text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded transition-colors"
        >
          + New Script
        </button>
      </div>
    </div>
  );
}
