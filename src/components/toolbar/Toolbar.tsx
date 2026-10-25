import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Ruler, 
  Undo2, 
  Redo2, 
  Monitor,
  Flame,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Play,
  Settings
} from 'lucide-react';
import { useEditorStore, DEVICE_PRESETS } from '../../store/editorStore';
import { LAYOUT_PRESETS } from '../../core/presets';

interface ToolbarProps {
  onOpenExport?: () => void;
  onOpenImport?: () => void;
  onOpenSettings?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenSettings }) => {
  const {
    zoom,
    devicePreset,
    showOverlays,
    showRulers,
    showLeftPanel,
    showBottomPanel,
    showRightPanel,
    isSimulating,
    historyIndex,
    history,
    actions,
  } = useEditorStore();

  return (
    <header className="h-12 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-3.5 z-30 select-none text-xs flex-shrink-0 overflow-x-auto custom-scrollbar min-w-0 gap-3">
      {/* Left: Brand & Preset Selector */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-bold text-slate-100 tracking-wide text-sm font-sans">
          Rachana
        </span>

        <div className="h-4 w-[1px] bg-[#333338]" />

        {/* Preset Selector */}
        <div className="h-7 flex items-center gap-1.5 bg-[#242427] px-2 rounded border border-[#333338]">
          <Flame className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">Preset:</span>
          <select
            className="bg-transparent text-zinc-200 text-[11px] outline-none cursor-pointer font-medium max-w-[160px] sm:max-w-[200px] truncate"
            onChange={(e) => actions.loadPreset(e.target.value)}
            defaultValue={LAYOUT_PRESETS[0].id}
          >
            {LAYOUT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-[#242427]">
                [{preset.category}] {preset.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Canvas Viewport & Zoom controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Device Resolution */}
        <div className="h-7 flex items-center gap-1.5 bg-[#242427] px-2 rounded border border-[#333338]">
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <select
            className="bg-transparent text-zinc-200 text-[11px] outline-none cursor-pointer font-mono max-w-[110px] sm:max-w-none"
            value={devicePreset.name}
            onChange={(e) => {
              const p = DEVICE_PRESETS.find((dp) => dp.name === e.target.value);
              if (p) actions.setDevicePreset(p);
            }}
          >
            {DEVICE_PRESETS.map((dp) => (
              <option key={dp.name} value={dp.name} className="bg-[#242427] text-zinc-200">
                {dp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom */}
        <div className="h-7 flex items-center bg-[#242427] rounded border border-[#333338] px-1">
          <button
            onClick={() => actions.setZoom(zoom - 0.1)}
            title="Zoom Out (Ctrl -)"
            className="p-1 hover:text-white text-zinc-400 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span
            onClick={() => actions.setZoom(1)}
            title="Click to reset zoom"
            className="px-1.5 font-mono text-[11px] text-zinc-200 cursor-pointer hover:text-white min-w-[36px] text-center"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => actions.setZoom(zoom + 0.1)}
            title="Zoom In (Ctrl +)"
            className="p-1 hover:text-white text-zinc-400 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => actions.setZoom(1)}
            title="Reset Zoom to 100%"
            className="p-1 text-zinc-500 hover:text-zinc-300 ml-0.5 border-l border-[#333338]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Common Global Undo / Redo controls on top of screen */}
        <div className="h-7 flex items-center bg-[#242427] rounded border border-[#333338] px-1 gap-0.5">
          <button
            onClick={actions.undo}
            disabled={historyIndex <= 0}
            title={`Undo (Ctrl+Z) - Step ${historyIndex}/${history.length - 1}`}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={actions.redo}
            disabled={historyIndex >= history.length - 1}
            title={`Redo (Ctrl+Y) - Step ${historyIndex}/${history.length - 1}`}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Overlays, Simulation & Standalone Panel Toggles */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Preview Simulation / Play Mode Toggle */}
        <button
          onClick={actions.toggleSimulation}
          title={isSimulating ? "Simulation Active (Stop via Viewport or Esc)" : "Run Preview Simulation & Test Widget (F5)"}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded border text-[11px] font-semibold transition-all ${
            isSimulating
              ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300 pointer-events-none'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/60 text-emerald-300 shadow-sm cursor-pointer'
          }`}
        >
          {isSimulating ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Simulate</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-[#333338] mx-0.5" />

        {/* Box Model Overlay Toggle */}
        <button
          onClick={actions.toggleOverlays}
          title="Toggle Visual Box-Model Overlays (Content, Padding, Border, Margin)"
          className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${
            showOverlays
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Rulers Toggle */}
        <button
          onClick={actions.toggleRulers}
          title="Toggle Coordinate Rulers & Grid"
          className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${
            showRulers
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#333338] mx-0.5" />

        {/* Standalone Full-size Panel Toggle Buttons (Outside the box, same size as overlays) */}
        <button
          onClick={actions.toggleLeftPanel}
          title={showLeftPanel ? 'Hide Primary Sidebar (Palette & Hierarchy)' : 'Show Primary Sidebar (Palette & Hierarchy)'}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${
            showLeftPanel
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={actions.toggleBottomPanel}
          title={showBottomPanel ? 'Hide Bottom Panel (Script Editor)' : 'Show Bottom Panel (Script Editor)'}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${
            showBottomPanel
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PanelBottom className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={actions.toggleRightPanel}
          title={showRightPanel ? 'Hide Secondary Sidebar (Details Inspector)' : 'Show Secondary Sidebar (Details Inspector)'}
          className={`h-7 w-7 flex items-center justify-center rounded border transition-colors ${
            showRightPanel
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PanelRight className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#333338] mx-0.5" />

        {/* Studio Preferences / Settings Modal Toggle */}
        <button
          onClick={onOpenSettings}
          title="Studio Preferences (Ctrl+,)"
          className="h-7 w-7 flex items-center justify-center rounded border bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-100 hover:bg-[#2b2b30] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/Yuvi-GD/rachana"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository - Yuvi-GD/rachana"
          className="h-7 w-7 flex items-center justify-center rounded border bg-[#242427] border-[#333338] text-zinc-400 hover:text-white hover:bg-[#2b2b30] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
