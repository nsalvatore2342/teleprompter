import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Script, Segment, Settings } from '../types';
import { useTeleprompter } from '../hooks/useTeleprompter';
import { Controls } from './Controls';
import { wordCount } from '../utils/readTime';

interface Props {
  script: Script | null;
  segments: Segment[];
  settings: Settings;
  onSettingsChange: (s: Partial<Settings>) => void;
  onExit: () => void;
}

function renderContent(content: string, fontSize: number, lineHeight: number): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    const isDivider = /^-{3,}$/.test(line.trim());

    if (headingMatch) {
      nodes.push(
        <div key={key++} className="tp-heading" style={{ fontSize: `${Math.round(fontSize * 0.55)}px` }}>
          {headingMatch[2]}
        </div>
      );
    } else if (isDivider) {
      nodes.push(<hr key={key++} className="border-gray-700 my-6" />);
    } else if (line.trim() === '') {
      nodes.push(<div key={key++} style={{ height: `${fontSize * lineHeight * 0.5}px` }} />);
    } else {
      nodes.push(
        <p key={key++} className="m-0 p-0">
          {line}
        </p>
      );
    }
  }

  return nodes;
}

export function TeleprompterView({ script, segments, settings, onSettingsChange, onExit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying, toggle, reset, scrollBy } = useTeleprompter(containerRef, settings.speed);
  const [activeSegId, setActiveSegId] = useState<string>(segments[0]?.id ?? '');
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Track active segment by scroll position
  const onScroll = useCallback(() => {
    if (!containerRef.current || segments.length === 0) return;
    const container = containerRef.current;
    const guideTop = container.scrollTop + container.clientHeight * (settings.guidePosition / 100);
    const totalChars = script?.content.length ?? 1;

    let activeSeg = segments[0];
    for (const seg of segments) {
      const segTop = (seg.charStart / totalChars) * container.scrollHeight;
      if (segTop <= guideTop) activeSeg = seg;
    }
    setActiveSegId(activeSeg.id);
  }, [segments, settings.guidePosition, script?.content.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Show controls on mouse move, auto-hide after 3s
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) setControlsVisible(true);
    else {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(hideTimer.current);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggle();
          showControls();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSettingsChange({ speed: Math.min(300, settings.speed + 10) });
          showControls();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onSettingsChange({ speed: Math.max(5, settings.speed - 10) });
          showControls();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          scrollBy(-200);
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrollBy(200);
          break;
        case 'r':
        case 'R':
          reset();
          showControls();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen();
          }
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, reset, scrollBy, showControls, settings.speed, onSettingsChange]);

  const jumpToSegment = (seg: Segment) => {
    if (!containerRef.current || !script) return;
    const el = containerRef.current;
    const totalChars = script.content.length;
    const targetScrollTop = (seg.charStart / totalChars) * el.scrollHeight
      - el.clientHeight * (settings.guidePosition / 100);
    el.scrollTop = Math.max(0, targetScrollTop);
    setActiveSegId(seg.id);
  };

  if (!script) {
    return <div className="flex-1 flex items-center justify-center text-gray-600">No script selected</div>;
  }

  const totalWords = wordCount(script.content);

  return (
    <div
      className="flex flex-1 overflow-hidden bg-gray-950"
      onMouseMove={showControls}
    >
      {/* Segment sidebar — hidden on mobile */}
      {segments.length > 1 && (
        <div className="hidden sm:flex flex-col w-44 min-w-[11rem] border-r border-gray-800 bg-gray-950 overflow-hidden flex-shrink-0">
          <div className="px-3 py-2 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Segments</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {segments.map((seg, i) => (
              <button
                key={seg.id}
                onClick={() => jumpToSegment(seg)}
                className={`w-full text-left px-3 py-2 transition-colors text-sm ${
                  seg.id === activeSegId
                    ? 'bg-indigo-600/30 text-indigo-300 border-l-2 border-indigo-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent'
                }`}
              >
                <span className="text-gray-600 text-xs mr-1">{i + 1}.</span>
                <span className="truncate block">{seg.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Teleprompter text area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Guide line */}
        <div
          className="absolute left-0 right-0 z-10 pointer-events-none"
          style={{ top: `${settings.guidePosition}%` }}
        >
          <div className="h-px bg-indigo-500/40 w-full" />
          <div className="absolute inset-0 h-16 -translate-y-full bg-gradient-to-t from-indigo-500/5 to-transparent" />
          <div className="absolute inset-0 h-16 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        </div>

        {/* Scrollable text */}
        <div
          ref={containerRef}
          className="teleprompter-scroll flex-1 overflow-y-scroll"
          style={{ cursor: isPlaying ? 'none' : 'default', touchAction: 'pan-y' }}
        >
          <div
            className={settings.mirrored ? 'mirrored' : ''}
            style={{
              padding: '50vh 0',
              maxWidth: `${settings.textWidth}%`,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                color: '#f0f0f0',
                letterSpacing: '0.01em',
              }}
            >
              {renderContent(script.content, settings.fontSize, settings.lineHeight)}
            </div>
          </div>
        </div>
      </div>

      {/* Controls overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <Controls
          isPlaying={isPlaying}
          settings={settings}
          onToggle={toggle}
          onReset={reset}
          onSettingsChange={onSettingsChange}
          onExitTeleprompter={onExit}
          totalWords={totalWords}
        />
      </div>
    </div>
  );
}
