import { useState, useEffect, useCallback, useRef } from 'react';
import { Script } from '../types';

const STORAGE_KEY = 'teleprompter_scripts';
const ACTIVE_KEY = 'teleprompter_active_id';

const SAMPLE_SCRIPT: Script = {
  id: 'sample',
  name: 'Sample Script',
  content: `# Intro

Hey everyone, welcome back to the channel!

Today we're going to talk about something really exciting that I've been working on for the past few weeks.

---

# Main Topic

So the big question is: how do you actually get started?

Well, I'm glad you asked. Here's what I've learned from doing this over and over again.

The first thing you need to understand is that it's not as complicated as it looks.

Once you break it down into simple steps, anyone can do it.

---

# Key Points

Let me walk you through the three main things to keep in mind.

First, always start with the end goal in mind.

Second, don't try to do everything at once.

Third, consistency beats perfection every time.

---

# Outro

That's going to wrap it up for today's video.

If you found this helpful, please hit the like button and subscribe for more content like this.

Drop a comment below and let me know what you thought.

See you in the next one!`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function loadScripts(): Script[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Script[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [SAMPLE_SCRIPT];
}

function loadActiveId(scripts: Script[]): string {
  const stored = localStorage.getItem(ACTIVE_KEY);
  if (stored && scripts.find(s => s.id === stored)) return stored;
  return scripts[0]?.id ?? '';
}

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>(loadScripts);
  const [activeId, setActiveId] = useState<string>(() => loadActiveId(loadScripts()));
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Persist scripts with debounce
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
    }, 300);
    return () => clearTimeout(saveTimer.current);
  }, [scripts]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const activeScript = scripts.find(s => s.id === activeId) ?? scripts[0] ?? null;

  const createScript = useCallback(() => {
    const id = `script-${Date.now()}`;
    const newScript: Script = {
      id,
      name: 'Untitled Script',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setScripts(prev => [...prev, newScript]);
    setActiveId(id);
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setScripts(prev =>
      prev.map(s => s.id === id ? { ...s, content, updatedAt: Date.now() } : s)
    );
  }, []);

  const renameScript = useCallback((id: string, name: string) => {
    setScripts(prev =>
      prev.map(s => s.id === id ? { ...s, name: name.trim() || 'Untitled', updatedAt: Date.now() } : s)
    );
  }, []);

  const deleteScript = useCallback((id: string) => {
    setScripts(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fallback = { ...SAMPLE_SCRIPT, id: `script-${Date.now()}` };
        setActiveId(fallback.id);
        return [fallback];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const duplicateScript = useCallback((id: string) => {
    const src = scripts.find(s => s.id === id);
    if (!src) return;
    const newId = `script-${Date.now()}`;
    const copy: Script = { ...src, id: newId, name: `${src.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    setScripts(prev => [...prev, copy]);
    setActiveId(newId);
  }, [scripts]);

  return { scripts, activeScript, activeId, setActiveId, createScript, updateContent, renameScript, deleteScript, duplicateScript };
}
