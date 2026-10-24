import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BoxModelInput } from './BoxModelInput';
import { FlexControls } from './FlexControls';
import { GridControls } from './GridControls';
import { UnitInput } from '../common/UnitInput';
import { LayoutNodeType } from '../../types/layout';
import { 
  Sliders, 
  Move, 
  Palette as PaletteIcon, 
  LayoutGrid,
  Maximize,
  Type as TypeIcon,
  Layers,
  BoxSelect,
  Image as ImageIcon,
  RotateCcw
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
  const { rootNode, selectedNode, metricsMap, actions } = useEditorStore();

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
  const isRoot = selectedNode.id === rootNode.id;

  // Context-sensitive category detection
  const isContainerType = ['container', 'flex', 'grid', 'card', 'scroll'].includes(selectedNode.type);
  const isTextType = ['text', 'heading'].includes(selectedNode.type);
  const isButtonType = selectedNode.type === 'button';
  const isInputType = selectedNode.type === 'input';
  const isBadgeType = selectedNode.type === 'badge';
  const isImageType = selectedNode.type === 'image';
  const isDividerType = selectedNode.type === 'divider';
  const isSpacerType = selectedNode.type === 'spacer';

  const handleStyleChange = (updates: any) => {
    actions.updateNodeStyle(selectedNode.id, updates);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-l border-[#27272a] select-none text-xs overflow-hidden">
      {/* ======================================================== */}
      {/* 1. STICKY TOP HEADER (Non-scrolling Identity & Quick Rep) */}
      {/* ======================================================== */}
      <div className="flex-shrink-0 bg-[#19191c] border-b border-[#27272a]">
        {/* Title, #ID and Replace/Type Selector */}
        <div className="h-9 px-3 flex items-center justify-between border-b border-[#232327]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-zinc-100 text-[11px] uppercase tracking-wider">
              {isRoot ? 'Root Canvas' : 'Details'}
            </span>
            <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-900/50 font-bold truncate">
              #{selectedNode.id}
            </span>
          </div>

          {/* Type / Replace Selector (Works for Root AND all widgets!) */}
          <div className="flex items-center gap-1">
            <select
              value={selectedNode.type}
              onChange={(e) => actions.replaceNodeType(selectedNode.id, e.target.value as LayoutNodeType)}
              title="Change / Replace element type"
              className="bg-[#23232a] hover:bg-[#2a2a33] border border-[#373744] rounded px-1.5 py-0.5 text-[10px] text-zinc-200 outline-none font-semibold cursor-pointer"
            >
              <optgroup label="Containers">
                <option value="flex">Flex Container</option>
                <option value="grid">Grid 2x2</option>
                <option value="card">Card Box</option>
                <option value="container">Block Container</option>
                <option value="scroll">Scroll Area</option>
              </optgroup>
              <optgroup label="Primitives">
                <option value="heading">Heading Text</option>
                <option value="text">Text Block</option>
                <option value="button">Button Widget</option>
                <option value="input">Text Input</option>
                <option value="badge">Badge Pill</option>
                <option value="image">Image Box</option>
                <option value="divider">Divider Line</option>
                <option value="spacer">Spacer</option>
              </optgroup>
            </select>

            {/* Reset Root Canvas Button */}
            {isRoot && (
              <button
                type="button"
                onClick={() => actions.resetRootCanvas('container')}
                title="Reset / Clear root canvas to empty container"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-300 text-[9px] font-semibold transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
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
      {/* 2. SCROLLABLE PROPERTY SECTIONS (Always Open / Expanded) */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">

        {/* SPECIFIC: TEXT CONTENT & HEADING */}
        {(isTextType || isButtonType || isBadgeType) && (
          <div className="border border-[#2d2d38] rounded-md bg-[#222227] p-2.5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Text & Typography Content
            </span>
            <div>
              <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-1">
                String Label
              </label>
              <input
                type="text"
                value={selectedNode.textContent || ''}
                onChange={(e) => actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })}
                placeholder="Enter text..."
                className="w-full bg-[#1c1c20] border border-[#3c3c47] rounded px-2.5 py-1 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>
        )}

        {/* SPECIFIC: INPUT FIELD PROPERTIES */}
        {isInputType && (
          <div className="border border-[#2d2d38] rounded-md bg-[#222227] p-2.5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
              Form Input Attributes
            </span>
            <div>
              <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Placeholder Text
              </label>
              <input
                type="text"
                value={selectedNode.placeholder || ''}
                onChange={(e) => actions.updateNodeProps(selectedNode.id, { placeholder: e.target.value })}
                placeholder="e.g. Enter email..."
                className="w-full bg-[#1c1c20] border border-[#3c3c47] rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Default Value
              </label>
              <input
                type="text"
                value={selectedNode.textContent || ''}
                onChange={(e) => actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })}
                placeholder="Initial text..."
                className="w-full bg-[#1c1c20] border border-[#3c3c47] rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>
        )}

        {/* SPECIFIC: IMAGE MEDIA PROPERTIES */}
        {isImageType && (
          <div className="border border-[#2d2d38] rounded-md bg-[#222227] p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase text-[10px] tracking-wider">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Media</span>
            </div>
            <div>
              <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Image Source URL
              </label>
              <input
                type="text"
                value={selectedNode.src || ''}
                onChange={(e) => actions.updateNodeProps(selectedNode.id, { src: e.target.value })}
                placeholder="https://... or data:image/..."
                className="w-full bg-[#1c1c20] border border-[#3c3c47] rounded px-2 py-0.5 text-xs text-zinc-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Object Fit
              </label>
              <select
                value={style.objectFit || 'cover'}
                onChange={(e) => handleStyleChange({ objectFit: e.target.value as any })}
                className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
              >
                <option value="cover">cover (Crop to fill)</option>
                <option value="contain">contain (Aspect fit)</option>
                <option value="fill">fill (Stretch)</option>
                <option value="scale-down">scale-down</option>
                <option value="none">none</option>
              </select>
            </div>
          </div>
        )}

        {/* 1. SPACING & BOX MODEL (Padding, Margin, Gap, Border) */}
        {!isDividerType && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <BoxSelect className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] uppercase tracking-wider">Spacing & Box Model</span>
              </div>
            </div>

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
                onGapChange={isContainerType ? (updates) => handleStyleChange(updates) : undefined}
              />
            </div>
          </div>
        )}

        {/* 2. POSITIONING & COORDINATES (Moved Up!) */}
        <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
          <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider">Positioning & Coordinates</span>
            </div>
          </div>

          <div className="p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
                  Position
                </label>
                <select
                  value={style.position}
                  onChange={(e) => handleStyleChange({ position: e.target.value as any })}
                  className="w-full bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="static">static (Normal flow)</option>
                  <option value="relative">relative</option>
                  <option value="absolute">absolute</option>
                  <option value="fixed">fixed</option>
                  <option value="sticky">sticky</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
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
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2d2d35]">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">{side}</label>
                    <UnitInput
                      value={style[side]}
                      onChange={(val) => handleStyleChange({ [side]: val })}
                      units={['px', '%', 'vw', 'vh']}
                      allowAuto={true}
                      placeholder="auto"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. LAYOUT MODE & FLOW (Containers Only) */}
        {isContainerType && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-wider">Layout Mode & Flow</span>
              </div>
            </div>

            <div className="p-2.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
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
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
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

              {/* Flow Direction Buttons */}
              <div className="pt-2 border-t border-[#2e2e38] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    Flow Direction
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    flow: {style.flow || 'COLUMN'}
                  </span>
                </div>

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

                {/* Fill Ratio */}
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
                    Content Align
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
          </div>
        )}

        {/* 4. FLEXBOX & GRID CONTROLS (Only when applicable) */}
        {isFlex && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-wider">Flexbox Parameters</span>
              </div>
            </div>
            <div className="p-2.5">
              <FlexControls style={style} onChange={handleStyleChange} />
            </div>
          </div>
        )}

        {isGrid && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] uppercase tracking-wider">Grid Parameters</span>
              </div>
            </div>
            <div className="p-2.5">
              <GridControls style={style} onChange={handleStyleChange} />
            </div>
          </div>
        )}

        {/* 5. SIZING & CONSTRAINTS */}
        {!isDividerType && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] uppercase tracking-wider">Sizing & Constraints</span>
              </div>
            </div>

            <div className="p-2.5 space-y-2.5">
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
          </div>
        )}

        {/* 6. STYLE & APPEARANCE (Colors, Borders, Radius, Opacity) */}
        {!isSpacerType && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <PaletteIcon className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[11px] uppercase tracking-wider">Appearance & Colors</span>
              </div>
            </div>

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

              {/* Border Color & Style */}
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
                    <option value="none">none</option>
                  </select>
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
          </div>
        )}

        {/* 7. TYPOGRAPHY (When element contains or styles text) */}
        {(isTextType || isButtonType || isInputType || isBadgeType) && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <TypeIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] uppercase tracking-wider">Typography Styling</span>
              </div>
            </div>

            <div className="p-2.5 space-y-2.5">
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
            </div>
          </div>
        )}

        {/* 8. OVERFLOW & SCROLLING (Containers only) */}
        {isContainerType && (
          <div className="border border-[#2d2d35] rounded-md bg-[#222227] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-[#1f1f24] flex items-center justify-between text-zinc-200 font-semibold border-b border-[#2d2d35]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] uppercase tracking-wider">Overflow & Clipping</span>
              </div>
            </div>

            <div className="p-2.5 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-1">
                  Overflow X
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['visible', 'hidden', 'scroll', 'auto'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => handleStyleChange({ overflowX: mode })}
                      className={`py-1 px-1 rounded border text-[10px] font-medium capitalize transition-colors text-center ${
                        (style.overflowX || style.overflow) === mode
                          ? 'bg-purple-600/40 border-purple-500 text-purple-200 font-bold'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                  Overflow Y
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['visible', 'hidden', 'scroll', 'auto'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => handleStyleChange({ overflowY: mode })}
                      className={`py-1 px-1 rounded border text-[10px] font-medium capitalize transition-colors text-center ${
                        (style.overflowY || style.overflow) === mode
                          ? 'bg-cyan-600/40 border-cyan-500 text-cyan-200 font-bold'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
