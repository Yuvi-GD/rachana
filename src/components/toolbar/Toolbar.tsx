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
  PanelRight
} from 'lucide-react';
import { useEditorStore, DEVICE_PRESETS } from '../../store/editorStore';
import { LAYOUT_PRESETS } from '../../core/presets';

interface ToolbarProps {
  onOpenExport?: () => void;
  onOpenImport?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const {
    zoom,
    scrollSensitivity,
    devicePreset,
    showOverlays,
    showRulers,
    showLeftPanel,
    showBottomPanel,
    showRightPanel,
    historyIndex,
    history,
    maxHistorySteps,
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
            className="bg-transparent text-zinc-200 text-xs outline-none cursor-pointer font-medium max-w-[160px] sm:max-w-[200px] truncate"
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
            className="px-1.5 font-mono text-[11px] text-zinc-300 cursor-pointer hover:text-white min-w-[36px] text-center"
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

        {/* Scroll Sensitivity */}
        <div className="h-7 hidden lg:flex items-center gap-1 bg-[#242427] px-2 rounded border border-[#333338]" title="Mouse Wheel / Trackpad Zoom Sensitivity">
          <span className="text-[10px] text-zinc-500 font-medium">Sens:</span>
          <select
            value={scrollSensitivity || 1.0}
            onChange={(e) => actions.setScrollSensitivity(parseFloat(e.target.value))}
            className="bg-transparent text-zinc-200 text-[10px] outline-none cursor-pointer font-mono"
          >
            <option value="0.5" className="bg-[#242427]">0.5x Smooth</option>
            <option value="1.0" className="bg-[#242427]">1.0x Normal</option>
            <option value="1.5" className="bg-[#242427]">1.5x Fast</option>
            <option value="2.0" className="bg-[#242427]">2.0x Ultra</option>
          </select>
        </div>

        {/* Undo / Redo with Steps Capacity Selector */}
        <div className="h-7 flex items-center bg-[#242427] rounded border border-[#333338] px-1 gap-0.5">
          <button
            onClick={actions.undo}
            disabled={historyIndex <= 0}
            title={`Undo (Ctrl+Z) - Step ${historyIndex}/${history.length - 1}`}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={actions.redo}
            disabled={historyIndex >= history.length - 1}
            title={`Redo (Ctrl+Y) - Step ${historyIndex}/${history.length - 1}`}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-[1px] bg-[#333338] mx-0.5 hidden sm:block" />
          <select
            value={maxHistorySteps || 64}
            onChange={(e) => actions.setMaxHistorySteps(parseInt(e.target.value, 10))}
            title="Max Undo/Redo History Steps"
            className="bg-transparent text-zinc-400 hover:text-zinc-200 text-[10px] outline-none cursor-pointer font-mono hidden sm:block"
          >
            <option value="16" className="bg-[#242427]">16 steps</option>
            <option value="32" className="bg-[#242427]">32 steps</option>
            <option value="64" className="bg-[#242427]">64 steps</option>
            <option value="128" className="bg-[#242427]">128 steps</option>
            <option value="256" className="bg-[#242427]">256 steps</option>
          </select>
        </div>
      </div>

      {/* Right: Overlays & VS Code Panel Toggles */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Box Model Overlay Toggle (Icon Only) */}
        <button
          onClick={actions.toggleOverlays}
          title="Toggle Visual Box-Model Overlays (Content, Padding, Border, Margin)"
          className={`h-7 w-7 flex items-center justify-center rounded border text-[11px] transition-colors ${
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
          className={`h-7 w-7 flex items-center justify-center rounded border text-[11px] transition-colors ${
            showRulers
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#333338] mx-0.5" />

        {/* VS Code Style 3-Panel Layout Toggles */}
        <div className="h-7 flex items-center bg-[#242427] rounded border border-[#333338] p-0.5 gap-0.5">
          <button
            onClick={actions.toggleLeftPanel}
            title={showLeftPanel ? 'Hide Primary Sidebar (Palette & Hierarchy)' : 'Show Primary Sidebar (Palette & Hierarchy)'}
            className={`h-5.5 w-5.5 flex items-center justify-center rounded transition-colors ${
              showLeftPanel
                ? 'bg-blue-600/30 text-blue-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={actions.toggleBottomPanel}
            title={showBottomPanel ? 'Hide Bottom Panel (Script Editor)' : 'Show Bottom Panel (Script Editor)'}
            className={`h-5.5 w-5.5 flex items-center justify-center rounded transition-colors ${
              showBottomPanel
                ? 'bg-blue-600/30 text-blue-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={actions.toggleRightPanel}
            title={showRightPanel ? 'Hide Secondary Sidebar (Details Inspector)' : 'Show Secondary Sidebar (Details Inspector)'}
            className={`h-5.5 w-5.5 flex items-center justify-center rounded transition-colors ${
              showRightPanel
                ? 'bg-blue-600/30 text-blue-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
