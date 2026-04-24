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
    <div className="flex flex-col gap-1 flex-1 min-w-[80px]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-300 tabular-nums">{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
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
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3">

        {/* Play / Pause */}
        <button
          onClick={onToggle}
          title="Space"
          className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg font-medium transition-colors flex-shrink-0 ${
            isPlaying ? 'bg-amber-500 active:bg-amber-400 text-black' : 'bg-indigo-600 active:bg-indigo-700 text-white'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="R"
          className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-gray-700 active:bg-gray-600 text-white transition-colors flex-shrink-0"
        >
          ↺
        </button>

        {/* Speed slider — grows to fill space */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
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

        {/* Right buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {totalWords > 0 && (
            <span className="text-xs text-gray-500 tabular-nums hidden sm:inline">~{estimatedMin}m</span>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            title="More settings"
            className={`w-9 h-9 rounded flex items-center justify-center text-sm transition-colors ${
              expanded ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200 active:bg-gray-600'
            }`}
          >
            ⚙
          </button>
          <button
            onClick={toggleFullscreen}
            title="F"
            className="w-9 h-9 rounded flex items-center justify-center bg-gray-700 text-gray-200 active:bg-gray-600 transition-colors"
          >
            ⛶
          </button>
          <button
            onClick={onExitTeleprompter}
            className="px-2.5 py-1.5 rounded text-xs sm:text-sm bg-gray-700 text-gray-200 active:bg-gray-600 transition-colors whitespace-nowrap"
            title="Back to editor"
          >
            ← Edit
          </button>
        </div>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="border-t border-gray-800 px-3 sm:px-4 py-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 items-end">
          <Slider
            label="Font Size"
            value={settings.fontSize}
            min={20} max={80} step={2}
            onChange={v => onSettingsChange({ fontSize: v })}
            format={v => `${v}px`}
          />
          <Slider
            label="Text Width"
            value={settings.textWidth}
            min={30} max={100} step={5}
            onChange={v => onSettingsChange({ textWidth: v })}
            format={v => `${v}%`}
          />
          <Slider
            label="Line Height"
            value={settings.lineHeight}
            min={1.2} max={3.0} step={0.1}
            onChange={v => onSettingsChange({ lineHeight: v })}
            format={v => v.toFixed(1)}
          />
          <Slider
            label="Guide Line"
            value={settings.guidePosition}
            min={10} max={70} step={5}
            onChange={v => onSettingsChange({ guidePosition: v })}
            format={v => `${v}%`}
          />
          <Slider
            label="WPM"
            value={settings.wordsPerMinute}
            min={80} max={250} step={10}
            onChange={v => onSettingsChange({ wordsPerMinute: v })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400">Options</span>
            <button
              onClick={() => onSettingsChange({ mirrored: !settings.mirrored })}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                settings.mirrored ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 active:bg-gray-600'
              }`}
            >
              Mirror
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hint — desktop only */}
      <div className="px-4 pb-2 hidden sm:block">
        <p className="text-xs text-gray-700">
          Space play/pause · ↑↓ speed · ←→ jump · R reset · F fullscreen
        </p>
      </div>
    </div>
  );
}
