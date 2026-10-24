import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BoxModelInput } from './BoxModelInput';
import { FlexControls } from './FlexControls';
import { GridControls } from './GridControls';
import { UnitInput } from '../common/UnitInput';
import { ColorPickerPopover } from '../common/ColorPickerPopover';
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
  Edit3, 
  Eye,
  ChevronRight
} from 'lucide-react';

interface UnrealSectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  rightContent?: React.ReactNode;
}

const UnrealSectionHeader: React.FC<UnrealSectionHeaderProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  rightContent,
}) => (
  <div
    onClick={onToggle}
    className="flex items-center justify-between px-3 py-1.5 bg-[#19191e] hover:bg-[#202026] border-t border-b border-[#292932] cursor-pointer select-none transition-colors"
  >
    <div className="flex items-center gap-1.5 min-w-0">
      <ChevronRight
        className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 flex-shrink-0 ${
          isOpen ? 'rotate-90 text-white' : ''
        }`}
      />
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider truncate">
        {title}
      </span>
    </div>
    {rightContent && (
      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
        {rightContent}
      </div>
    )}
  </div>
);

export const DetailsPanel: React.FC = () => {
  const { rootNode, selectedNode, metricsMap, actions } = useEditorStore();
  const [boxModelMode, setBoxModelMode] = useState<'edit' | 'inspect'>('edit');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeColorPicker, setActiveColorPicker] = useState<'background' | 'border' | 'text' | null>(null);
  const [colorPickerPos, setColorPickerPos] = useState<{ left: number; top: number } | null>(null);

  const handleOpenColorPicker = (e: React.MouseEvent, type: 'background' | 'border' | 'text') => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 270;
    const popoverHeight = 440;

    let left = rect.left - popoverWidth - 8;
    if (left < 10) left = rect.right + 8;
    if (left + popoverWidth > window.innerWidth - 10) left = window.innerWidth - popoverWidth - 10;

    let top = rect.top - 20;
    if (top + popoverHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - popoverHeight - 10);
    }
    if (top < 10) top = 10;

    setColorPickerPos({ left, top });
    setActiveColorPicker(type);
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

  const isSectionOpen = (key: string) => !collapsedSections[key];
  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStyleChange = (updates: any) => {
    actions.updateNodeStyle(selectedNode.id, updates);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-l border-[#27272a] select-none text-xs overflow-hidden">
      {/* ======================================================== */}
      {/* 1. STICKY TOP HEADER (Clean Unreal Engine Style) */}
      {/* ======================================================== */}
      <div className="flex-shrink-0 bg-[#19191c] border-b border-[#27272a]">
        {/* Title and #ID (Reset button removed for root element) */}
        <div className="h-8 px-3 flex items-center justify-between border-b border-[#232327]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-zinc-100 text-[11px] uppercase tracking-wider">
              {isRoot ? 'Root Canvas' : 'Details'}
            </span>
            <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-900/50 font-bold truncate">
              #{selectedNode.id}
            </span>
          </div>

          <span className="font-mono text-[10px] text-zinc-300 bg-[#25252b] px-2 py-0.5 rounded border border-[#33333d] uppercase font-semibold">
            {selectedNode.type}
          </span>
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
      {/* 2. SCROLLABLE PROPERTY SECTIONS (Flat Unreal Engine Style) */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto space-y-0 custom-scrollbar">
        {/* SPECIFIC: TEXT CONTENT & HEADING */}
        {(isTextType || isButtonType || isBadgeType) && (
          <div>
            <UnrealSectionHeader
              title="Typography Content"
              icon={<TypeIcon className="w-3.5 h-3.5 text-emerald-400" />}
              isOpen={isSectionOpen('textContent')}
              onToggle={() => toggleSection('textContent')}
            />
            {isSectionOpen('textContent') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
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
          </div>
        )}

        {/* SPECIFIC: INPUT FIELD PROPERTIES */}
        {isInputType && (
          <div>
            <UnrealSectionHeader
              title="Form Input Attributes"
              icon={<Sliders className="w-3.5 h-3.5 text-indigo-400" />}
              isOpen={isSectionOpen('inputProps')}
              onToggle={() => toggleSection('inputProps')}
            />
            {isSectionOpen('inputProps') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
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
          </div>
        )}

        {/* SPECIFIC: IMAGE MEDIA PROPERTIES */}
        {isImageType && (
          <div>
            <UnrealSectionHeader
              title="Media Assets"
              icon={<ImageIcon className="w-3.5 h-3.5 text-orange-400" />}
              isOpen={isSectionOpen('mediaProps')}
              onToggle={() => toggleSection('mediaProps')}
            />
            {isSectionOpen('mediaProps') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
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
          </div>
        )}

        {/* 1. SPACING & BOX MODEL */}
        {!isDividerType && (
          <div>
            <UnrealSectionHeader
              title="Spacing & Box Model"
              icon={<BoxSelect className="w-3.5 h-3.5 text-amber-400" />}
              isOpen={isSectionOpen('boxModel')}
              onToggle={() => toggleSection('boxModel')}
              rightContent={
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-[#151518] rounded p-0.5 border border-[#30303a]">
                    <button
                      type="button"
                      onClick={() => setBoxModelMode('edit')}
                      title="Edit Spacing & Geometry"
                      className={`p-1 rounded transition-colors ${
                        boxModelMode === 'edit'
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoxModelMode('inspect')}
                      title="View Computed Geometry (DevTools)"
                      className={`p-1 rounded transition-colors ${
                        boxModelMode === 'inspect'
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  {metrics && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {Math.round(metrics.contentBox.width)}×{Math.round(metrics.contentBox.height)}px
                    </span>
                  )}
                </div>
              }
            />
            {isSectionOpen('boxModel') && (
              <div className="p-2.5 bg-[#17171b]/40">
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
                  mode={boxModelMode}
                  onMarginChange={(m) => handleStyleChange({ margin: m })}
                  onPaddingChange={(p) => handleStyleChange({ padding: p })}
                  onBorderChange={(b) => handleStyleChange({ borderWidth: b })}
                  onGapChange={isContainerType ? (updates) => handleStyleChange(updates) : undefined}
                />
              </div>
            )}
          </div>
        )}

        {/* 2. POSITIONING & COORDINATES */}
        <div>
          <UnrealSectionHeader
            title="Positioning & Coordinates"
            icon={<Move className="w-3.5 h-3.5 text-emerald-400" />}
            isOpen={isSectionOpen('position')}
            onToggle={() => toggleSection('position')}
          />
          {isSectionOpen('position') && (
            <div className="p-2.5 space-y-2 bg-[#17171b]/40">
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
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#292930]">
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
          )}
        </div>

        {/* 3. LAYOUT MODE & FLOW (Containers Only) */}
        {isContainerType && (
          <div>
            <UnrealSectionHeader
              title="Layout Mode & Flow"
              icon={<Move className="w-3.5 h-3.5 text-blue-400" />}
              isOpen={isSectionOpen('layoutFlow')}
              onToggle={() => toggleSection('layoutFlow')}
            />
            {isSectionOpen('layoutFlow') && (
              <div className="p-2.5 space-y-2.5 bg-[#17171b]/40">
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
                <div className="pt-2 border-t border-[#292930] space-y-2">
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
            )}
          </div>
        )}

        {/* 4. FLEXBOX & GRID CONTROLS */}
        {isFlex && (
          <div>
            <UnrealSectionHeader
              title="Flexbox Parameters"
              icon={<Sliders className="w-3.5 h-3.5 text-blue-400" />}
              isOpen={isSectionOpen('flexbox')}
              onToggle={() => toggleSection('flexbox')}
            />
            {isSectionOpen('flexbox') && (
              <div className="p-2.5 bg-[#17171b]/40">
                <FlexControls style={style} onChange={handleStyleChange} />
              </div>
            )}
          </div>
        )}

        {isGrid && (
          <div>
            <UnrealSectionHeader
              title="Grid Parameters"
              icon={<LayoutGrid className="w-3.5 h-3.5 text-purple-400" />}
              isOpen={isSectionOpen('grid')}
              onToggle={() => toggleSection('grid')}
            />
            {isSectionOpen('grid') && (
              <div className="p-2.5 bg-[#17171b]/40">
                <GridControls style={style} onChange={handleStyleChange} />
              </div>
            )}
          </div>
        )}

        {/* 5. SIZING & CONSTRAINTS */}
        {!isDividerType && (
          <div>
            <UnrealSectionHeader
              title="Sizing & Constraints"
              icon={<Maximize className="w-3.5 h-3.5 text-cyan-400" />}
              isOpen={isSectionOpen('sizing')}
              onToggle={() => toggleSection('sizing')}
            />
            {isSectionOpen('sizing') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
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
            )}
          </div>
        )}

        {/* 6. STYLE & APPEARANCE (Full Color Palette Popover Integration) */}
        {!isSpacerType && (
          <div>
            <UnrealSectionHeader
              title="Appearance & Materials"
              icon={<PaletteIcon className="w-3.5 h-3.5 text-pink-400" />}
              isOpen={isSectionOpen('appearance')}
              onToggle={() => toggleSection('appearance')}
            />
            {isSectionOpen('appearance') && (
              <div className="p-2.5 space-y-3 bg-[#17171b]/40">
                {/* Background Color */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Background Color
                    </label>
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'background')}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-semibold uppercase"
                    >
                      Open Palette
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={style.backgroundColor}
                      onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                      className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'background')}
                      style={{
                        backgroundColor: style.backgroundColor === 'transparent' ? 'transparent' : style.backgroundColor,
                      }}
                      title="Open full RGB/HSV Color Palette Window"
                      className="w-7 h-7 rounded border border-[#444] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative shadow-sm"
                    >
                      {style.backgroundColor === 'transparent' && (
                        <span className="text-[9px] text-red-500 font-bold">×</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Border Color & Style */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Border Color & Style</label>
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'border')}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-semibold uppercase"
                    >
                      Open Palette
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={style.borderColor}
                      onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                      className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'border')}
                      style={{
                        backgroundColor: style.borderColor === 'transparent' ? 'transparent' : style.borderColor,
                      }}
                      title="Open full RGB/HSV Color Palette Window"
                      className="w-6 h-6 rounded border border-[#444] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative shadow-sm"
                    >
                      {style.borderColor === 'transparent' && (
                        <span className="text-[8px] text-red-500 font-bold">×</span>
                      )}
                    </button>
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

                {/* Border Radius */}
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
        )}

        {/* 7. TYPOGRAPHY STYLING */}
        {(isTextType || isButtonType || isInputType || isBadgeType) && (
          <div>
            <UnrealSectionHeader
              title="Typography Styling"
              icon={<TypeIcon className="w-3.5 h-3.5 text-emerald-400" />}
              isOpen={isSectionOpen('typography')}
              onToggle={() => toggleSection('typography')}
            />
            {isSectionOpen('typography') && (
              <div className="p-2.5 space-y-2.5 bg-[#17171b]/40">
                {/* Text Color */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-400">Text Color</label>
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'text')}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-semibold uppercase"
                    >
                      Open Palette
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={style.color}
                      onChange={(e) => handleStyleChange({ color: e.target.value })}
                      className="flex-1 bg-[#1c1c20] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'text')}
                      style={{
                        backgroundColor: style.color === 'transparent' ? 'transparent' : style.color,
                      }}
                      title="Open full RGB/HSV Color Palette Window"
                      className="w-6 h-6 rounded border border-[#444] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative shadow-sm"
                    >
                      {style.color === 'transparent' && (
                        <span className="text-[8px] text-red-500 font-bold">×</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Font Size */}
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
            )}
          </div>
        )}

        {/* 8. OVERFLOW & SCROLLING */}
        {isContainerType && (
          <div>
            <UnrealSectionHeader
              title="Overflow & Clipping"
              icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
              isOpen={isSectionOpen('overflow')}
              onToggle={() => toggleSection('overflow')}
            />
            {isSectionOpen('overflow') && (
              <div className="p-2.5 space-y-3 bg-[#17171b]/40">
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
            )}
          </div>
        )}
      </div>

      {/* Anchored Popover Window for Full RGB/HSV Color Palette (No Background Blur) */}
      {activeColorPicker && colorPickerPos && (
        <>
          {/* Transparent click catcher to close popover */}
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setActiveColorPicker(null)}
          />
          {/* Floating Window positioned near clicked swatch */}
          <div 
            style={{ 
              left: `${colorPickerPos.left}px`, 
              top: `${colorPickerPos.top}px` 
            }}
            className="fixed z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ColorPickerPopover
              color={
                activeColorPicker === 'background'
                  ? style.backgroundColor
                  : activeColorPicker === 'border'
                  ? style.borderColor
                  : style.color
              }
              onChange={(newColor) => {
                if (activeColorPicker === 'background') handleStyleChange({ backgroundColor: newColor });
                else if (activeColorPicker === 'border') handleStyleChange({ borderColor: newColor });
                else if (activeColorPicker === 'text') handleStyleChange({ color: newColor });
              }}
              onClose={() => setActiveColorPicker(null)}
              label={
                activeColorPicker === 'background'
                  ? 'Background Color'
                  : activeColorPicker === 'border'
                  ? 'Border Color'
                  : 'Text Color'
              }
            />
          </div>
        </>
      )}
    </div>
  );
};
