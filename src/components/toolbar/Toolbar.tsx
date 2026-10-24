import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Ruler, 
  BarChart3, 
  Download, 
  Undo2, 
  Redo2, 
  Monitor,
  Flame,
  UploadCloud
} from 'lucide-react';
import { useEditorStore, DEVICE_PRESETS } from '../../store/editorStore';
import { LAYOUT_PRESETS } from '../../core/presets';

interface ToolbarProps {
  onOpenExport: () => void;
  onOpenImport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenExport, onOpenImport }) => {
  const {
    zoom,
    scrollSensitivity,
    devicePreset,
    showOverlays,
    showRulers,
    showMetrics,
    historyIndex,
    history,
    actions,
  } = useEditorStore();

  return (
    <header className="h-11 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-3 z-30 select-none text-xs">
      {/* Brand & Preset Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-black text-xs">
            U
          </div>
          <span className="hidden md:inline font-semibold text-slate-200">
            UI Editor
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 font-semibold">
            v1.0 Engine
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#333338]" />

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] text-zinc-400 font-medium">Preset:</span>
          <select
            className="bg-[#242427] hover:bg-[#2c2c30] text-zinc-200 text-xs rounded border border-[#3f3f46] px-2 py-1 outline-none cursor-pointer font-medium transition-colors"
            onChange={(e) => actions.loadPreset(e.target.value)}
            defaultValue={LAYOUT_PRESETS[0].id}
          >
            {LAYOUT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                [{preset.category}] {preset.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Canvas Viewport & Zoom controls */}
      <div className="flex items-center gap-2">
        {/* Device Resolution */}
        <div className="flex items-center gap-1.5 bg-[#242427] px-2 py-1 rounded border border-[#333338]">
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <select
            className="bg-transparent text-zinc-200 text-[11px] outline-none cursor-pointer font-mono"
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
        <div className="flex items-center bg-[#242427] rounded border border-[#333338] px-1 py-0.5">
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
            className="px-1.5 font-mono text-[11px] text-zinc-300 cursor-pointer hover:text-white"
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
        <div className="flex items-center gap-1 bg-[#242427] px-2 py-0.5 rounded border border-[#333338]" title="Mouse Wheel / Trackpad Zoom Sensitivity">
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

        {/* Undo / Redo */}
        <div className="flex items-center bg-[#242427] rounded border border-[#333338] px-0.5">
          <button
            onClick={actions.undo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={actions.redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Overlays, Inspector Toggles & Export */}
      <div className="flex items-center gap-2">
        {/* Box Model Overlay Toggle */}
        <button
          onClick={actions.toggleOverlays}
          title="Toggle Visual Box-Model Overlays (Content, Padding, Border, Margin)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
            showOverlays
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Box Model Overlay</span>
        </button>

        {/* Rulers Toggle */}
        <button
          onClick={actions.toggleRulers}
          title="Toggle Coordinate Rulers & Grid"
          className={`p-1.5 rounded border text-[11px] transition-colors ${
            showRulers
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Metrics Toggle */}
        <button
          onClick={actions.toggleMetrics}
          title="Toggle Layout Engine Computed Metrics Drawer"
          className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] transition-colors ${
            showMetrics
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
              : 'bg-[#242427] border-[#333338] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Metrics</span>
        </button>

        {/* Import Tether YAML */}
        <button
          onClick={onOpenImport}
          title="Import Tether UI YAML (modal.yaml, dashboard.yaml, index.yaml)"
          className="flex items-center gap-1.5 bg-[#25252b] hover:bg-[#32323a] text-zinc-200 border border-[#3f3f4c] px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import</span>
        </button>

        {/* Export Golden Test Vector */}
        <button
          onClick={onOpenExport}
          title="Export Layout Test Case (YAML, JSON, HTML/CSS)"
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-3 py-1 rounded shadow-sm text-[11px] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
