import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BoxModelInput } from './BoxModelInput';
import { FlexControls } from './FlexControls';
import { GridControls } from './GridControls';
import { UnitInput } from '../common/UnitInput';
import { 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  Move, 
  Palette as PaletteIcon, 
  LayoutGrid,
  Maximize,
  Type as TypeIcon,
  Layers,
  BoxSelect
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
    boxModel: true,
    transform: true,
    flex: true,
    grid: true,
    sizing: true,
    overflow: false,
    appearance: false,
    properties: false,
    positioning: false,
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
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-l border-[#27272a] select-none text-xs overflow-hidden">
      {/* ======================================================== */}
      {/* 1. STICKY TOP HEADER (Non-scrolling identity & size)     */}
      {/* ======================================================== */}
      <div className="flex-shrink-0 bg-[#19191c] border-b border-[#27272a]">
        {/* Title & Tag Row */}
        <div className="h-9 px-3 flex items-center justify-between border-b border-[#232327]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-zinc-100 text-[11px] uppercase tracking-wider">
              Details
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50 font-bold">
              #{selectedNode.id}
            </span>
            <span className="text-[9px] uppercase font-bold text-zinc-400 bg-[#25252d] px-1.5 py-0.5 rounded border border-[#33333d]">
              {selectedNode.type}
            </span>
          </div>
        </div>

        {/* Full-width Widget Name Input */}
        <div className="px-3 pt-2 pb-1.5">
          <label className="text-[9px] text-zinc-500 uppercase font-semibold block mb-1">
            Widget Name
          </label>
          <input
            type="text"
            value={selectedNode.name}
            onChange={(e) => actions.updateNodeProps(selectedNode.id, { name: e.target.value })}
            placeholder="Widget Name"
            className="w-full bg-[#222227] hover:bg-[#27272e] focus:bg-[#202026] border border-[#34343e] focus:border-blue-500 rounded px-2.5 py-1 text-xs text-zinc-100 font-semibold outline-none transition-colors"
          />
        </div>

        {/* Compact Computed Size & Screen Position Info */}
        <div className="px-3 pb-2 pt-1 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">Size:</span>
            <span className="text-emerald-400 font-bold bg-[#14231b] px-2 py-0.5 rounded border border-emerald-800/40">
              {metrics ? `${Math.round(metrics.boundingRect.width)} × ${Math.round(metrics.boundingRect.height)} px` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">Pos:</span>
            <span className="text-blue-300 font-medium bg-[#141e2c] px-2 py-0.5 rounded border border-blue-800/40">
              {metrics ? `X: ${Math.round(metrics.boundingRect.x)}, Y: ${Math.round(metrics.boundingRect.y)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SCROLLABLE PROPERTY SECTIONS                          */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
        {/* Section 1: Spacing & Box Model (Padding, Margin, Gap, Border) - FIRST in list */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('boxModel')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <BoxSelect className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Spacing & Box Model</span>
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

        {/* Section 2: Layout Mode & Flow */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('transform')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Layout Mode & Flow</span>
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

              {/* Layout Engine Flow & Alignment */}
              <div className="pt-2 border-t border-[#2e2e38] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    Flow Layout (Direction)
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
                        type="button"
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
                  <label className="text-[10px] text-zinc-300 font-semibold block mb-1">
                    Fill Ratio (fill_ratio / flex-grow)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={style.fillRatio || style.flexGrow || '1.0'}
                    onChange={(e) => handleStyleChange({ fillRatio: e.target.value, flexGrow: e.target.value })}
                    placeholder="1.0"
                    className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-sky-300 outline-none font-mono"
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
                          type="button"
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
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Flexbox & Grid Controls */}
        {(isFlex || style.flexGrow !== '0' || style.flexShrink !== '1') && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('flex')}
              className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-wider font-semibold">Flexbox Parameters</span>
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

        {isGrid && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('grid')}
              className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] uppercase tracking-wider font-semibold">Grid Parameters</span>
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

        {/* Section 4: Sizing & Constraints */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('sizing')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Sizing & Constraints</span>
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
                <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                  Width
                </label>
                <UnitInput
                  value={style.width}
                  onChange={(val) => handleStyleChange({ width: val })}
                  units={['px', '%', 'vw', 'rem']}
                  allowAuto={true}
                  placeholder="auto"
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                  Height
                </label>
                <UnitInput
                  value={style.height}
                  onChange={(val) => handleStyleChange({ height: val })}
                  units={['px', '%', 'vh', 'rem']}
                  allowAuto={true}
                  placeholder="auto"
                />
              </div>

              {/* Min & Max Width */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Min Width</label>
                  <UnitInput
                    value={style.minWidth}
                    onChange={(val) => handleStyleChange({ minWidth: val })}
                    units={['px', '%', 'vw']}
                    allowAuto={true}
                    placeholder="auto"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Max Width</label>
                  <UnitInput
                    value={style.maxWidth}
                    onChange={(val) => handleStyleChange({ maxWidth: val })}
                    units={['px', '%', 'vw']}
                    allowNone={true}
                    placeholder="none"
                  />
                </div>
              </div>

              {/* Min & Max Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Min Height</label>
                  <UnitInput
                    value={style.minHeight}
                    onChange={(val) => handleStyleChange({ minHeight: val })}
                    units={['px', '%', 'vh']}
                    allowAuto={true}
                    placeholder="auto"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Max Height</label>
                  <UnitInput
                    value={style.maxHeight}
                    onChange={(val) => handleStyleChange({ maxHeight: val })}
                    units={['px', '%', 'vh']}
                    allowNone={true}
                    placeholder="none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Style & Appearance */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('appearance')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <PaletteIcon className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Appearance & Colors</span>
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
                      type="button"
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
                      type="button"
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

              {/* Border Radius with UnitInput */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Border Radius</label>
                <UnitInput
                  value={style.borderRadius}
                  onChange={(val) => handleStyleChange({ borderRadius: val })}
                  units={['px', '%', 'rem']}
                  placeholder="0"
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

        {/* Section 6: Properties, Content & Typography */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('properties')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <TypeIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Properties & Typography</span>
            </div>
            {expandedSections.properties ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedSections.properties && (
            <div className="p-2.5 space-y-3">
              {/* Text Content (if applicable) */}
              {(selectedNode.type === 'text' || selectedNode.type === 'button') && (
                <div className="p-2 rounded bg-[#1c1c20] border border-[#33333b] space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-zinc-400 block">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={selectedNode.textContent || ''}
                    onChange={(e) =>
                      actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })
                    }
                    className="w-full bg-[#18181b] border border-[#3c3c47] rounded px-2 py-1 text-xs text-zinc-100 outline-none"
                  />
                </div>
              )}

              {/* Text Color */}
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
                      type="button"
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

              {/* Font Size with UnitInput */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Font Size</label>
                <UnitInput
                  value={style.fontSize}
                  onChange={(val) => handleStyleChange({ fontSize: val })}
                  units={['px', 'rem', '%']}
                  placeholder="14"
                />
              </div>

              {/* Font Weight & Text Align */}
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

              {/* Visual Anchors (anchor_min, anchor_max) */}
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
                        type="button"
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

              {/* Interactivity Toggle */}
              <div className="pt-2 border-t border-[#2e2e38] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-zinc-300">
                    Interactable
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    Enables hover and press states
                  </span>
                </div>
                <button
                  type="button"
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
          )}
        </div>

        {/* Section 7: Overflow & Clipping */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('overflow')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Overflow & Clipping</span>
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
                        type="button"
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
                        type="button"
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

        {/* Section 8: Positioning & Coordinates */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('positioning')}
            className="w-full px-2.5 py-1.5 bg-[#1f1f24] hover:bg-[#25252b] flex items-center justify-between text-zinc-200 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Positioning & Coordinates</span>
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
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <div key={side}>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">{side}</label>
                      <UnitInput
                        value={style[side]}
                        onChange={(val) => handleStyleChange({ [side]: val })}
                        units={['px', '%', 'rem']}
                        allowAuto={true}
                        placeholder="auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
