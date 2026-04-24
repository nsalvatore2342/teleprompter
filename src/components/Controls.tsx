import React from 'react';
import { Settings } from '../types';

interface Props {
  isPlaying: boolean;
  settings: Settings;
  onToggle: () => void;
  onReset: () => void;
  onSettingsChange: (s: Partial<Settings>) => void;
  onExitTeleprompter: () => void;
  totalWords: number;
}

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[90px]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-300 tabular-nums">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function IconBtn({ label, onClick, title, active }: { label: string; onClick: () => void; title?: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

export function Controls({ isPlaying, settings, onToggle, onReset, onSettingsChange, onExitTeleprompter, totalWords }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const estimatedMin = Math.round(totalWords / settings.wordsPerMinute);

  return (
    <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur border-t border-gray-700">
      {/* Main controls row */}
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        {/* Playback */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            title="Space"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-colors ${
              isPlaying ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={onReset}
            title="R"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            ↺
          </button>
        </div>

        <div className="w-px h-8 bg-gray-700" />

        {/* Speed */}
        <div className="flex flex-col gap-1 min-w-[110px]">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Speed</span>
            <span className="text-xs text-gray-300 tabular-nums">{settings.speed} px/s</span>
          </div>
          <input
            type="range" min={5} max={300} step={5}
            value={settings.speed}
            onChange={e => onSettingsChange({ speed: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="w-px h-8 bg-gray-700" />

        {/* Font size */}
        <div className="flex flex-col gap-1 min-w-[90px]">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Font</span>
            <span className="text-xs text-gray-300 tabular-nums">{settings.fontSize}px</span>
          </div>
          <input
            type="range" min={20} max={80} step={2}
            value={settings.fontSize}
            onChange={e => onSettingsChange({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="w-px h-8 bg-gray-700" />

        {/* Width */}
        <div className="flex flex-col gap-1 min-w-[90px]">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Width</span>
            <span className="text-xs text-gray-300 tabular-nums">{settings.textWidth}%</span>
          </div>
          <input
            type="range" min={30} max={100} step={5}
            value={settings.textWidth}
            onChange={e => onSettingsChange({ textWidth: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex-1" />

        {/* Right-side buttons */}
        <div className="flex items-center gap-2">
          {totalWords > 0 && (
            <span className="text-xs text-gray-500 tabular-nums">~{estimatedMin}m</span>
          )}
          <IconBtn label="⚙" onClick={() => setExpanded(e => !e)} title="More settings" active={expanded} />
          <IconBtn label="⛶" onClick={toggleFullscreen} title="F" />
          <button
            onClick={onExitTeleprompter}
            className="px-3 py-1.5 rounded text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
            title="Back to editor"
          >
            ← Edit
          </button>
        </div>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="flex items-end gap-6 px-4 pb-3 flex-wrap border-t border-gray-800 pt-3">
          <Slider
            label="Line Height"
            value={settings.lineHeight}
            min={1.2} max={3.0} step={0.1}
            onChange={v => onSettingsChange({ lineHeight: v })}
            format={v => v.toFixed(1)}
          />
          <Slider
            label="Guide Line %"
            value={settings.guidePosition}
            min={10} max={70} step={5}
            onChange={v => onSettingsChange({ guidePosition: v })}
            format={v => `${v}%`}
          />
          <Slider
            label="WPM Estimate"
            value={settings.wordsPerMinute}
            min={80} max={250} step={10}
            onChange={v => onSettingsChange({ wordsPerMinute: v })}
            format={v => `${v}`}
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400">Options</span>
            <div className="flex gap-2">
              <button
                onClick={() => onSettingsChange({ mirrored: !settings.mirrored })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${settings.mirrored ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Mirror
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-700">
          Space play/pause · ↑↓ speed · ←→ jump · R reset · F fullscreen
        </p>
      </div>
    </div>
  );
}
