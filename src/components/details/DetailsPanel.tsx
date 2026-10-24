import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BoxModelInput } from './BoxModelInput';
import { FlexControls } from './FlexControls';
import { GridControls } from './GridControls';
import { 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  Move, 
  Eye, 
  Palette as PaletteIcon, 
  LayoutGrid,
  Maximize,
  Type as TypeIcon,
  Layers
} from 'lucide-react';

const COLOR_SWATCHES = [
  'transparent',
  '#09090b',
  '#18181b',
  '#27272a',
  '#3f3f46',
  '#2563eb',
  '#38bdf8',
  '#16a34a',
  '#10b981',
  '#f59e0b',
  '#ea580c',
  '#dc2626',
  '#7c3aed',
  '#a855f7',
  '#ec4899',
  '#ffffff',
];

export const DetailsPanel: React.FC = () => {
  const { selectedNode, metricsMap, actions } = useEditorStore();

  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    sizing: true,
    overflow: true,
    boxModel: true,
    flex: true,
    grid: true,
    positioning: true,
    appearance: false,
    typography: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!selectedNode) {
    return (
      <div className="h-full bg-[#1e1e22] text-zinc-400 p-4 flex flex-col items-center justify-center text-center select-none">
        <Sliders className="w-8 h-8 text-zinc-600 mb-2" />
        <span className="text-xs font-medium text-zinc-300">No Widget Selected</span>
        <span className="text-[11px] text-zinc-500 mt-1">
          Select an item from the Hierarchy or Viewport to inspect properties.
        </span>
      </div>
    );
  }

  const { style } = selectedNode;
  const metrics = metricsMap[selectedNode.id];
  const isFlex = style.display.includes('flex');
  const isGrid = style.display.includes('grid');

  const handleStyleChange = (updates: any) => {
    actions.updateNodeStyle(selectedNode.id, updates);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-l border-[#27272a] select-none text-xs">
      {/* Header */}
      <div className="h-10 px-3 border-b border-[#27272a] flex items-center justify-between bg-[#19191c]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-zinc-100 text-[11px] uppercase tracking-wider">
            Details
          </span>
          <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/50 truncate">
            #{selectedNode.id}
          </span>
        </div>

        <input
          type="text"
          value={selectedNode.name}
          onChange={(e) => actions.updateNodeProps(selectedNode.id, { name: e.target.value })}
          className="bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none w-36 text-right focus:w-44 transition-all"
        />
      </div>

      {/* Property Sections Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
        {/* Text Content (if applicable) */}
        {(selectedNode.type === 'text' || selectedNode.type === 'button') && (
          <div className="p-2 rounded bg-[#242429] border border-[#33333b] space-y-1">
            <label className="text-[10px] uppercase font-semibold text-zinc-400 block">
              Text Content
            </label>
            <input
              type="text"
              value={selectedNode.textContent || ''}
              onChange={(e) =>
                actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })
              }
              className="w-full bg-[#1c1c20] border border-[#3c3c47] rounded px-2 py-1 text-xs text-zinc-100 outline-none"
            />
          </div>
        )}

        {/* 1. Layout Mode & Display */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('transform')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] uppercase tracking-wider">Layout Mode & Flow</span>
            </div>
            {expandedSections.transform ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.transform && (
            <div className="p-2.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                    Display
                  </label>
                  <select
                    value={style.display}
                    onChange={(e) => handleStyleChange({ display: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer font-medium"
                  >
                    <option value="block">block</option>
                    <option value="flex">flex</option>
                    <option value="inline-flex">inline-flex</option>
                    <option value="grid">grid</option>
                    <option value="inline-grid">inline-grid</option>
                    <option value="inline-block">inline-block</option>
                    <option value="inline">inline</option>
                    <option value="none">none</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                    Box-Sizing
                  </label>
                  <select
                    value={style.boxSizing}
                    onChange={(e) => handleStyleChange({ boxSizing: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="border-box">border-box (Standard)</option>
                    <option value="content-box">content-box (Legacy)</option>
                  </select>
                </div>
              </div>

              {/* Tether UI Flow & Alignment */}
              <div className="pt-2 border-t border-[#2e2e38] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    Flow Layout (Tether UI)
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    flow: {style.flow || 'COLUMN'}
                  </span>
                </div>

                {/* Flow Buttons: ROW / COLUMN / NONE */}
                <div className="grid grid-cols-3 gap-1">
                  {(['ROW', 'COLUMN', 'NONE'] as const).map((f) => {
                    const isActive = (style.flow || (style.flexDirection === 'row' ? 'ROW' : 'COLUMN')) === f;
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          if (f === 'ROW') {
                            handleStyleChange({ flow: 'ROW', display: 'flex', flexDirection: 'row' });
                          } else if (f === 'COLUMN') {
                            handleStyleChange({ flow: 'COLUMN', display: 'flex', flexDirection: 'column' });
                          } else {
                            handleStyleChange({ flow: 'NONE', display: 'block' });
                          }
                        }}
                        className={`py-1 rounded border text-[10px] font-bold transition-colors text-center ${
                          isActive
                            ? 'bg-sky-600/40 border-sky-500 text-sky-200 shadow-sm'
                            : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>

                {/* Fill Ratio (Weighted Proportional Sizing) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-300 font-semibold">
                      Fill Ratio (fill_ratio)
                    </label>
                    <div className="flex items-center gap-1">
                      {['0.1', '0.22', '0.25', '0.5', '0.78', '0.92', '1.0'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleStyleChange({ fillRatio: r, flexGrow: r })}
                          className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                            style.fillRatio === r
                              ? 'bg-sky-600/40 border-sky-500 text-sky-300'
                              : 'bg-[#1c1c20] border-[#34343d] text-zinc-400'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={style.fillRatio || style.flexGrow || '1.0'}
                    onChange={(e) => handleStyleChange({ fillRatio: e.target.value, flexGrow: e.target.value })}
                    placeholder="1.0"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-sky-300 outline-none font-mono"
                  />
                </div>

                {/* Content Alignment */}
                <div className="pt-1">
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    Content Align (content_align)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['START', 'CENTER', 'END'] as const).map((align) => {
                      const isActive = (style.contentAlign || 'START') === align;
                      return (
                        <button
                          key={align}
                          onClick={() => handleStyleChange({ contentAlign: align })}
                          className={`py-0.5 rounded border text-[9px] font-semibold transition-colors text-center ${
                            isActive
                              ? 'bg-sky-600/40 border-sky-500 text-sky-200'
                              : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Unreal Engine Style Visual Anchors (anchor_min, anchor_max) */}
                <div className="pt-2 border-t border-[#2e2e38] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Anchors (anchor_min / max)
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      [{style.anchorMin || '0.0'}, {style.anchorMax || '1.0'}]
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                    {[
                      { label: 'Stretch All', min: '0.0', max: '1.0' },
                      { label: 'Top-Left', min: '0.0 0.0', max: '0.0 0.0' },
                      { label: 'Center', min: '0.5 0.5', max: '0.5 0.5' },
                      { label: 'Bottom-Right', min: '1.0 1.0', max: '1.0 1.0' },
                    ].map((a) => {
                      const isCur = (style.anchorMin || '0.0') === a.min && (style.anchorMax || '1.0') === a.max;
                      return (
                        <button
                          key={a.label}
                          onClick={() => handleStyleChange({ anchorMin: a.min, anchorMax: a.max })}
                          className={`py-1 rounded border text-center transition-colors ${
                            isCur
                              ? 'bg-sky-600/40 border-sky-500 text-sky-200 font-bold'
                              : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactivity (interactable: true) */}
                <div className="pt-2 border-t border-[#2e2e38] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-zinc-300">
                      Interactable (Buttons/Events)
                    </span>
                    <span className="text-[9px] text-zinc-500">
                      Enables hover & click states
                    </span>
                  </div>
                  <button
                    onClick={() => handleStyleChange({ interactable: !style.interactable })}
                    className={`px-2.5 py-0.5 rounded border text-[10px] font-bold transition-colors ${
                      style.interactable
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-[#1c1c20] border-[#34343d] text-zinc-500'
                    }`}
                  >
                    {style.interactable ? 'ENABLED' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Sizing & Dimensions (with Quick Auto & 100% Buttons) */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('sizing')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] uppercase tracking-wider">Sizing & Constraints</span>
            </div>
            {expandedSections.sizing ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.sizing && (
            <div className="p-2.5 space-y-2.5">
              {/* Width */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-semibold text-zinc-400">Width</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStyleChange({ width: 'auto' })}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border transition-colors ${
                        style.width === 'auto'
                          ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => handleStyleChange({ width: '100%' })}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border transition-colors ${
                        style.width === '100%'
                          ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      100%
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={style.width}
                  onChange={(e) => handleStyleChange({ width: e.target.value })}
                  placeholder="auto"
                  className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                />
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-semibold text-zinc-400">Height</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStyleChange({ height: 'auto' })}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border transition-colors ${
                        style.height === 'auto'
                          ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => handleStyleChange({ height: '100%' })}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border transition-colors ${
                        style.height === '100%'
                          ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      100%
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={style.height}
                  onChange={(e) => handleStyleChange({ height: e.target.value })}
                  placeholder="auto"
                  className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                />
              </div>

              {/* Min & Max Width */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Min Width</label>
                    <button
                      onClick={() => handleStyleChange({ minWidth: 'auto' })}
                      className="text-[8px] text-zinc-500 hover:text-zinc-300"
                    >
                      auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={style.minWidth}
                    onChange={(e) => handleStyleChange({ minWidth: e.target.value })}
                    placeholder="auto"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Max Width</label>
                    <button
                      onClick={() => handleStyleChange({ maxWidth: 'none' })}
                      className="text-[8px] text-zinc-500 hover:text-zinc-300"
                    >
                      none
                    </button>
                  </div>
                  <input
                    type="text"
                    value={style.maxWidth}
                    onChange={(e) => handleStyleChange({ maxWidth: e.target.value })}
                    placeholder="none"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Min & Max Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Min Height</label>
                    <button
                      onClick={() => handleStyleChange({ minHeight: 'auto' })}
                      className="text-[8px] text-zinc-500 hover:text-zinc-300"
                    >
                      auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={style.minHeight}
                    onChange={(e) => handleStyleChange({ minHeight: e.target.value })}
                    placeholder="auto"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Max Height</label>
                    <button
                      onClick={() => handleStyleChange({ maxHeight: 'none' })}
                      className="text-[8px] text-zinc-500 hover:text-zinc-300"
                    >
                      none
                    </button>
                  </div>
                  <input
                    type="text"
                    value={style.maxHeight}
                    onChange={(e) => handleStyleChange({ maxHeight: e.target.value })}
                    placeholder="none"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2.5 Gap (Container Children Distance) */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-medium border-b border-[#2d2d35]">
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-wider font-bold">
                Gap (Spacing Between Items)
              </span>
            </div>
            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-900/50">
              gap: [{parseInt(style.columnGap || style.gap || '0', 10) || 0}, {parseInt(style.rowGap || style.gap || '0', 10) || 0}]
            </span>
          </div>

          <div className="p-2.5 space-y-2.5">
            {/* Quick Gap Presets (matching Tether UI patterns) */}
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block mb-1">
                Tether UI Gap Presets [X, Y]
              </span>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { label: '[0, 8]', x: '0px', y: '8px' },
                  { label: '[0, 15]', x: '0px', y: '15px' },
                  { label: '[15, 0]', x: '15px', y: '0px' },
                  { label: '[12, 0]', x: '12px', y: '0px' },
                  { label: '[0, 30]', x: '0px', y: '30px' },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleStyleChange({ columnGap: p.x, rowGap: p.y, gap: p.x === p.y ? p.x : `${p.y} ${p.x}` })}
                    className="py-0.5 px-1 rounded border border-[#34343d] bg-[#1c1c20] hover:bg-[#282832] text-amber-300 font-mono text-[9px] text-center"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap X (Column Gap / Horizontal) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-300 font-semibold">
                  Column Gap (Horizontal X)
                </label>
                <div className="flex items-center gap-1">
                  {['0px', '8px', '12px', '15px', '24px'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleStyleChange({ columnGap: g })}
                      className="px-1 py-0.2 rounded text-[8px] font-mono border border-[#34343d] bg-[#1c1c20] text-zinc-400 hover:text-white"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={style.columnGap || style.gap || '0px'}
                onChange={(e) => handleStyleChange({ columnGap: e.target.value })}
                placeholder="15px"
                className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
              />
            </div>

            {/* Gap Y (Row Gap / Vertical) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-300 font-semibold">
                  Row Gap (Vertical Y)
                </label>
                <div className="flex items-center gap-1">
                  {['0px', '8px', '12px', '15px', '30px'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleStyleChange({ rowGap: g })}
                      className="px-1 py-0.2 rounded text-[8px] font-mono border border-[#34343d] bg-[#1c1c20] text-zinc-400 hover:text-white"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={style.rowGap || style.gap || '0px'}
                onChange={(e) => handleStyleChange({ rowGap: e.target.value })}
                placeholder="15px"
                className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Overflow & Scrolling Settings */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('overflow')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] uppercase tracking-wider">Overflow & Clipping</span>
            </div>
            {expandedSections.overflow ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.overflow && (
            <div className="p-2.5 space-y-3">
              {/* Overflow X: 4 Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                    Overflow X (Horizontal)
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {style.overflowX || style.overflow}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['visible', 'hidden', 'scroll', 'auto'] as const).map((mode) => {
                    const isActive = (style.overflowX || style.overflow) === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => handleStyleChange({ overflowX: mode })}
                        className={`py-1 px-1 rounded border text-[10px] font-medium capitalize transition-colors text-center ${
                          isActive
                            ? 'bg-purple-600/40 border-purple-500 text-purple-200 font-bold shadow-sm'
                            : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#25252b]'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overflow Y: 4 Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Overflow Y (Vertical)
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {style.overflowY || style.overflow}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['visible', 'hidden', 'scroll', 'auto'] as const).map((mode) => {
                    const isActive = (style.overflowY || style.overflow) === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => handleStyleChange({ overflowY: mode })}
                        className={`py-1 px-1 rounded border text-[10px] font-medium capitalize transition-colors text-center ${
                          isActive
                            ? 'bg-cyan-600/40 border-cyan-500 text-cyan-200 font-bold shadow-sm'
                            : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#25252b]'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Box Model Spacing (Separated Edit vs Readonly) */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('boxModel')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-wider">Box Model Spacing</span>
            </div>
            {expandedSections.boxModel ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.boxModel && (
            <div className="p-2.5">
              <BoxModelInput
                label="Geometry"
                margin={style.margin}
                padding={style.padding}
                borderWidth={style.borderWidth}
                gap={style.gap}
                rowGap={style.rowGap}
                columnGap={style.columnGap}
                contentWidth={metrics?.contentBox.width}
                contentHeight={metrics?.contentBox.height}
                onMarginChange={(m) => handleStyleChange({ margin: m })}
                onPaddingChange={(p) => handleStyleChange({ padding: p })}
                onBorderChange={(b) => handleStyleChange({ borderWidth: b })}
                onGapChange={(updates) => handleStyleChange(updates)}
              />
            </div>
          )}
        </div>

        {/* 5. Flexbox */}
        {(isFlex || style.flexGrow !== '0' || style.flexShrink !== '1') && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <button
              onClick={() => toggleSection('flex')}
              className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-wider">Flexbox Parameters</span>
              </div>
              {expandedSections.flex ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedSections.flex && (
              <div className="p-2.5">
                <FlexControls style={style} onChange={handleStyleChange} />
              </div>
            )}
          </div>
        )}

        {/* 6. Grid */}
        {isGrid && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <button
              onClick={() => toggleSection('grid')}
              className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] uppercase tracking-wider">Grid Parameters</span>
              </div>
              {expandedSections.grid ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedSections.grid && (
              <div className="p-2.5">
                <GridControls style={style} onChange={handleStyleChange} />
              </div>
            )}
          </div>
        )}

        {/* 7. Positioning & Coordinates */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('positioning')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider">Positioning & Coordinates</span>
            </div>
            {expandedSections.positioning ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.positioning && (
            <div className="p-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                    Position
                  </label>
                  <select
                    value={style.position}
                    onChange={(e) => handleStyleChange({ position: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="static">static</option>
                    <option value="relative">relative</option>
                    <option value="absolute">absolute</option>
                    <option value="fixed">fixed</option>
                    <option value="sticky">sticky</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                    Z-Index
                  </label>
                  <input
                    type="text"
                    value={style.zIndex}
                    onChange={(e) => handleStyleChange({ zIndex: e.target.value })}
                    placeholder="auto"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>
              </div>

              {style.position !== 'static' && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <div key={side}>
                      <label className="text-[9px] text-zinc-500 uppercase block">{side}</label>
                      <input
                        type="text"
                        value={style[side]}
                        onChange={(e) => handleStyleChange({ [side]: e.target.value })}
                        placeholder="auto"
                        className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-1.5 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 8. Appearance & Color Swatches Palette */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <PaletteIcon className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[11px] uppercase tracking-wider">Appearance & Colors</span>
            </div>
            {expandedSections.appearance ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.appearance && (
            <div className="p-2.5 space-y-3">
              {/* Background Color with Swatches */}
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={style.backgroundColor}
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                  />
                  <input
                    type="color"
                    value={style.backgroundColor.startsWith('#') && style.backgroundColor.length === 7 ? style.backgroundColor : '#18181b'}
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border border-[#444] cursor-pointer bg-transparent"
                    title="Choose color"
                  />
                </div>

                {/* Quick Swatch Bar */}
                <div className="flex flex-wrap gap-1 p-1 bg-[#17171a] rounded border border-[#2d2d35]">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => handleStyleChange({ backgroundColor: swatch })}
                      title={swatch}
                      style={{ backgroundColor: swatch === 'transparent' ? 'transparent' : swatch }}
                      className={`w-4 h-4 rounded-xs border transition-transform hover:scale-125 relative ${
                        swatch === 'transparent' ? 'border-dashed border-red-500/60' : 'border-[#444]'
                      } ${style.backgroundColor === swatch ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                    >
                      {swatch === 'transparent' && (
                        <span className="absolute inset-0 text-[8px] text-red-500 flex items-center justify-center font-bold">
                          ×
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Color & Style with Picker */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block mb-0.5">Border Color & Style</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={style.borderColor}
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                    className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                  <input
                    type="color"
                    value={style.borderColor.startsWith('#') && style.borderColor.length === 7 ? style.borderColor : '#475569'}
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                    className="w-6 h-6 rounded border border-[#444] cursor-pointer bg-transparent"
                    title="Choose border color"
                  />
                  <select
                    value={style.borderStyle}
                    onChange={(e) => handleStyleChange({ borderStyle: e.target.value as any })}
                    className="w-24 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="solid">solid</option>
                    <option value="dashed">dashed</option>
                    <option value="dotted">dotted</option>
                    <option value="double">double</option>
                    <option value="none">none</option>
                  </select>
                </div>
                {/* Border Color Swatches */}
                <div className="flex flex-wrap gap-1 p-1 bg-[#17171a] rounded border border-[#2d2d35]">
                  {COLOR_SWATCHES.slice(0, 10).map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => handleStyleChange({ borderColor: swatch })}
                      title={`Border: ${swatch}`}
                      style={{ backgroundColor: swatch === 'transparent' ? 'transparent' : swatch }}
                      className={`w-3.5 h-3.5 rounded-xs border transition-transform hover:scale-125 ${
                        swatch === 'transparent' ? 'border-dashed border-red-500/60' : 'border-[#444]'
                      } ${style.borderColor === swatch ? 'ring-1 ring-blue-500 scale-110' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Border Radius with Quick Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-zinc-400">Border Radius</label>
                  <div className="flex items-center gap-1">
                    {(['0px', '4px', '8px', '16px', '9999px'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleStyleChange({ borderRadius: r })}
                        className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                          style.borderRadius === r
                            ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                            : 'bg-[#1c1c20] border-[#34343d] text-zinc-400'
                        }`}
                      >
                        {r === '9999px' ? 'Pill' : r}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={style.borderRadius}
                  onChange={(e) => handleStyleChange({ borderRadius: e.target.value })}
                  className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                />
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-zinc-400">Opacity</label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Math.round(parseFloat(style.opacity || '1') * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={style.opacity || '1'}
                  onChange={(e) => handleStyleChange({ opacity: e.target.value })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* 9. Typography Controls */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            onClick={() => toggleSection('typography')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <TypeIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider">Typography & Text</span>
            </div>
            {expandedSections.typography ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.typography && (
            <div className="p-2.5 space-y-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Text Color</label>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={style.color}
                    onChange={(e) => handleStyleChange({ color: e.target.value })}
                    className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                  <input
                    type="color"
                    value={style.color.startsWith('#') && style.color.length === 7 ? style.color : '#e2e8f0'}
                    onChange={(e) => handleStyleChange({ color: e.target.value })}
                    className="w-6 h-6 rounded border border-[#444] cursor-pointer bg-transparent"
                    title="Choose text color"
                  />
                </div>
                {/* Text Color Swatches */}
                <div className="flex flex-wrap gap-1 p-1 bg-[#17171a] rounded border border-[#2d2d35]">
                  {['#ffffff', '#e2e8f0', '#94a3b8', '#38bdf8', '#34d399', '#fde047', '#f87171', '#c084fc'].map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => handleStyleChange({ color: swatch })}
                      title={`Text: ${swatch}`}
                      style={{ backgroundColor: swatch }}
                      className={`w-3.5 h-3.5 rounded-xs border border-[#444] transition-transform hover:scale-125 ${
                        style.color === swatch ? 'ring-1 ring-blue-500 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Font Size</label>
                <input
                  type="text"
                  value={style.fontSize}
                  onChange={(e) => handleStyleChange({ fontSize: e.target.value })}
                  className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Font Weight</label>
                  <select
                    value={style.fontWeight}
                    onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="300">300 (Light)</option>
                    <option value="400">400 (Regular)</option>
                    <option value="500">500 (Medium)</option>
                    <option value="600">600 (Semi-Bold)</option>
                    <option value="700">700 (Bold)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Text Align</label>
                  <select
                    value={style.textAlign}
                    onChange={(e) => handleStyleChange({ textAlign: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Transform</label>
                  <select
                    value={style.textTransform || 'none'}
                    onChange={(e) => handleStyleChange({ textTransform: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="none">none</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">White-Space</label>
                  <select
                    value={style.whiteSpace || 'normal'}
                    onChange={(e) => handleStyleChange({ whiteSpace: e.target.value as any })}
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="normal">normal</option>
                    <option value="nowrap">nowrap</option>
                    <option value="pre">pre</option>
                    <option value="pre-wrap">pre-wrap</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
