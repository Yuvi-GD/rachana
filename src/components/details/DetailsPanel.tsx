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
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Copy,
  Check,
  Columns,
  Rows,
  Grid3X3,
  Box
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
    className="flex items-center justify-between px-3 py-1.5 bg-[#141417] hover:bg-[#1a1a1f] border-t border-b border-[#27272a] cursor-pointer select-none transition-colors"
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
  const { rootNode, selectedNode, metricsMap, zoom, actions } = useEditorStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showBoxModelDrawer, setShowBoxModelDrawer] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<'background' | 'border' | 'text' | null>(null);
  const [colorPickerPos, setColorPickerPos] = useState<{ left: number; top: number } | null>(null);
  const [propertyToast, setPropertyToast] = useState<string | null>(null);
  const [propContextMenu, setPropContextMenu] = useState<{
    x: number;
    y: number;
    key: string;
    value: any;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setPropertyToast(msg);
    setTimeout(() => setPropertyToast(null), 1500);
  };

  const copyProperty = (key: string, value: any) => {
    const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    navigator.clipboard.writeText(strVal);
    (window as any).__rachanaPropertyClipboard = { key, value: strVal };
    triggerToast(`Copied ${key}: ${strVal}`);
  };

  const pasteProperty = (key: string) => {
    const clip = (window as any).__rachanaPropertyClipboard;
    if (clip && clip.value !== undefined) {
      handleStyleChange({ [key]: clip.value });
      triggerToast(`Pasted ${key}: ${clip.value}`);
    } else {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          handleStyleChange({ [key]: text });
          triggerToast(`Pasted ${key}: ${text}`);
        }
      }).catch(() => {});
    }
  };

  const getPropHandlers = (key: string, value: any) => ({
    onMouseDown: (e: React.MouseEvent) => {
      if (e.shiftKey && e.button === 0) {
        e.preventDefault();
        e.stopPropagation();
        copyProperty(key, value);
      }
    },
    onContextMenu: (e: React.MouseEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        pasteProperty(key);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setPropContextMenu({ x: e.clientX, y: e.clientY, key, value });
    },
  });

  const handleOpenColorPicker = (e: React.MouseEvent, type: 'background' | 'border' | 'text') => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 275;
    const popoverHeight = 500;

    // Default: place to the left of the clicked color swatch/button
    let left = rect.left - popoverWidth - 8;
    // If overflowing left edge of browser window, flip to the right side of the swatch
    if (left < 12) {
      if (rect.right + popoverWidth + 12 <= window.innerWidth) {
        left = rect.right + 8;
      } else {
        left = Math.max(12, window.innerWidth - popoverWidth - 12);
      }
    }
    // Hard clamp within window horizontal margins
    left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

    // Align vertically near swatch, then clamp inside window vertical margins
    let top = rect.top - 24;
    if (top + popoverHeight > window.innerHeight - 12) {
      top = Math.max(12, window.innerHeight - popoverHeight - 12);
    }
    if (top < 12) top = 12;

    setColorPickerPos({ left, top });
    setActiveColorPicker(type);
  };

  if (!selectedNode) {
    return (
      <div className="h-full bg-[#18181b] text-zinc-400 p-4 flex flex-col items-center justify-center text-center select-none">
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

  // Relative coordinates to the Screen Canvas
  const rootMetrics = metricsMap[rootNode.id];
  const effectiveZoom = zoom || 1;
  const relX = isRoot ? 0 : (rootMetrics && metrics ? Math.round((metrics.boundingRect.left - rootMetrics.boundingRect.left) / effectiveZoom) : 0);
  const relY = isRoot ? 0 : (rootMetrics && metrics ? Math.round((metrics.boundingRect.top - rootMetrics.boundingRect.top) / effectiveZoom) : 0);

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
    <div className="flex flex-col h-full bg-[#18181b] text-zinc-300 border-l border-[#27272a] select-none text-xs overflow-hidden">
      {/* ======================================================== */}
      {/* 1. STICKY TOP HEADER (Clean Unreal Engine Style) */}
      {/* ======================================================== */}
      <div className="flex-shrink-0 bg-[#141417] border-b border-[#27272a]">
        {/* Title and #ID (Reset button removed for root element) */}
        <div className="h-8 px-3 flex items-center justify-between border-b border-[#27272a]">
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
          <div className="flex items-center gap-1.5" title="Screen Coordinates (Relative to Canvas Root)">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">Pos:</span>
            <span className="text-blue-300 font-medium bg-[#141e2c] px-2 py-0.5 rounded border border-blue-800/40">
              {metrics ? `X: ${relX}, Y: ${relY}` : '—'}
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
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Typography Content"
              icon={<TypeIcon className="w-3.5 h-3.5 text-emerald-400" />}
              isOpen={isSectionOpen('textContent')}
              onToggle={() => toggleSection('textContent')}
            />
            {isSectionOpen('textContent') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
                <div {...getPropHandlers('textContent', selectedNode.textContent || '')}>
                  <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-1">
                    String Label
                  </label>
                  <input
                    type="text"
                    value={selectedNode.textContent || ''}
                    onChange={(e) => actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })}
                    placeholder="Enter text..."
                    className="w-full bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#3c3c47] focus:border-blue-500 rounded px-2.5 py-1 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPECIFIC: INPUT FIELD PROPERTIES */}
        {isInputType && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Form Input Attributes"
              icon={<Sliders className="w-3.5 h-3.5 text-indigo-400" />}
              isOpen={isSectionOpen('inputProps')}
              onToggle={() => toggleSection('inputProps')}
            />
            {isSectionOpen('inputProps') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
                <div {...getPropHandlers('placeholder', selectedNode.placeholder || '')}>
                  <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedNode.placeholder || ''}
                    onChange={(e) => actions.updateNodeProps(selectedNode.id, { placeholder: e.target.value })}
                    placeholder="e.g. Enter email..."
                    className="w-full bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#3c3c47] focus:border-blue-500 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div {...getPropHandlers('textContent', selectedNode.textContent || '')}>
                  <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                    Default Value
                  </label>
                  <input
                    type="text"
                    value={selectedNode.textContent || ''}
                    onChange={(e) => actions.updateNodeProps(selectedNode.id, { textContent: e.target.value })}
                    placeholder="Initial text..."
                    className="w-full bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#3c3c47] focus:border-blue-500 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPECIFIC: IMAGE MEDIA PROPERTIES */}
        {isImageType && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Media Assets"
              icon={<ImageIcon className="w-3.5 h-3.5 text-orange-400" />}
              isOpen={isSectionOpen('mediaProps')}
              onToggle={() => toggleSection('mediaProps')}
            />
            {isSectionOpen('mediaProps') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
                <div {...getPropHandlers('src', selectedNode.src || '')}>
                  <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                    Image Source URL
                  </label>
                  <input
                    type="text"
                    value={selectedNode.src || ''}
                    onChange={(e) => actions.updateNodeProps(selectedNode.id, { src: e.target.value })}
                    placeholder="https://... or data:image/..."
                    className="w-full bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#3c3c47] focus:border-blue-500 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                    Object Fit
                  </label>
                  <select
                    value={style.objectFit || 'cover'}
                    onChange={(e) => handleStyleChange({ objectFit: e.target.value as any })}
                    className="w-full bg-[#1c1c20] hover:bg-[#222227] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
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
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Spacing & Box Model"
              icon={<BoxSelect className="w-3.5 h-3.5 text-amber-400" />}
              isOpen={isSectionOpen('boxModel')}
              onToggle={() => toggleSection('boxModel')}
              rightContent={
                metrics && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {Math.round(metrics.contentBox.width)}×{Math.round(metrics.contentBox.height)}px
                  </span>
                )
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
                  mode="edit"
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
        <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
          <UnrealSectionHeader
            title="Positioning & Coordinates"
            icon={<Move className="w-3.5 h-3.5 text-emerald-400" />}
            isOpen={isSectionOpen('position')}
            onToggle={() => toggleSection('position')}
          />
          {isSectionOpen('position') && (
            <div className="p-2.5 space-y-2 bg-[#17171b]/40">
              <div className="grid grid-cols-2 gap-2">
                <div {...getPropHandlers('position', style.position)}>
                  <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
                    Position
                  </label>
                  <select
                    value={style.position}
                    onChange={(e) => handleStyleChange({ position: e.target.value as any })}
                    className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="static">static (Normal flow)</option>
                    <option value="relative">relative</option>
                    <option value="absolute">absolute</option>
                    <option value="fixed">fixed</option>
                    <option value="sticky">sticky</option>
                  </select>
                </div>

                <div {...getPropHandlers('zIndex', style.zIndex)}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] uppercase font-semibold text-zinc-400">
                      Z-Index
                    </label>
                    <button
                      type="button"
                      onClick={() => handleStyleChange({ zIndex: 'auto' })}
                      className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                        style.zIndex === 'auto' || !style.zIndex
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                          : 'bg-[#1c1c20] text-zinc-400 border-[#34343d] hover:text-white'
                      }`}
                      title="Set z-index to auto"
                    >
                      Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={style.zIndex}
                    onChange={(e) => handleStyleChange({ zIndex: e.target.value })}
                    placeholder="auto"
                    className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>
              </div>

              {style.position !== 'static' && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#292930]">
                  {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                    <div key={side} {...getPropHandlers(side, style[side])}>
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
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Layout Mode & Flow"
              icon={<Move className="w-3.5 h-3.5 text-blue-400" />}
              isOpen={isSectionOpen('layoutFlow')}
              onToggle={() => toggleSection('layoutFlow')}
            />
            {isSectionOpen('layoutFlow') && (
              <div className="p-2.5 space-y-3 bg-[#17171b]/40">
                {/* Modern Container Architecture Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Container Layout Mode
                    </label>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {isFlex ? (style.flexDirection?.includes('column') ? 'Flex Column' : 'Flex Row') : isGrid ? 'CSS Grid' : 'Freeform Canvas'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Flex Row */}
                    <button
                      type="button"
                      onClick={() => handleStyleChange({ display: 'flex', flexDirection: 'row', flow: 'ROW' })}
                      className={`flex items-center gap-2 p-2 rounded border text-left transition-all ${
                        isFlex && (!style.flexDirection || style.flexDirection.includes('row'))
                          ? 'bg-blue-600/25 border-blue-500 text-blue-200 shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#232328]'
                      }`}
                    >
                      <Columns className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold leading-tight">Flex Row</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">1D Horizontal Flow</div>
                      </div>
                    </button>

                    {/* Flex Column */}
                    <button
                      type="button"
                      onClick={() => handleStyleChange({ display: 'flex', flexDirection: 'column', flow: 'COLUMN' })}
                      className={`flex items-center gap-2 p-2 rounded border text-left transition-all ${
                        isFlex && style.flexDirection?.includes('column')
                          ? 'bg-cyan-600/25 border-cyan-500 text-cyan-200 shadow-sm ring-1 ring-cyan-500/30'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#232328]'
                      }`}
                    >
                      <Rows className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold leading-tight">Flex Column</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">1D Vertical Stack</div>
                      </div>
                    </button>

                    {/* CSS Grid */}
                    <button
                      type="button"
                      onClick={() => handleStyleChange({ display: 'grid', flow: 'NONE' })}
                      className={`flex items-center gap-2 p-2 rounded border text-left transition-all ${
                        isGrid
                          ? 'bg-purple-600/25 border-purple-500 text-purple-200 shadow-sm ring-1 ring-purple-500/30'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#232328]'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold leading-tight">CSS Grid</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">2D Matrix Tracks</div>
                      </div>
                    </button>

                    {/* Freeform Canvas */}
                    <button
                      type="button"
                      onClick={() => handleStyleChange({ display: 'block', position: 'relative', flow: 'NONE' })}
                      className={`flex items-center gap-2 p-2 rounded border text-left transition-all ${
                        !isFlex && !isGrid
                          ? 'bg-amber-600/25 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/30'
                          : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#232328]'
                      }`}
                    >
                      <Box className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold leading-tight">Freeform Canvas</div>
                        <div className="text-[9px] text-zinc-500 leading-tight">Absolute Positioning</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Box-Sizing */}
                <div className="pt-2 border-t border-[#292930]">
                  <div {...getPropHandlers('boxSizing', style.boxSizing)}>
                    <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
                      Box-Sizing
                    </label>
                    <select
                      value={style.boxSizing}
                      onChange={(e) => handleStyleChange({ boxSizing: e.target.value as any })}
                      className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                    >
                      <option value="border-box">border-box (Standard)</option>
                      <option value="content-box">content-box (Legacy)</option>
                    </select>
                  </div>
                </div>

                {/* Child Slot Stretch & Fill (Tether UI & Flex item fill) */}
                <div className="pt-2 border-t border-[#292930] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Child Alignment & Fill
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      flow: {style.flow || (isFlex ? (style.flexDirection === 'row' ? 'ROW' : 'COLUMN') : 'NONE')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div {...getPropHandlers('fillRatio', style.fillRatio || style.flexGrow || '0')}>
                      <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-1">
                        Fill Ratio (flex-grow)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={style.fillRatio || style.flexGrow || '0'}
                        onChange={(e) => handleStyleChange({ fillRatio: e.target.value, flexGrow: e.target.value })}
                        placeholder="0"
                        className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-sky-300 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase font-semibold block mb-1">
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
                              className={`py-1 rounded border text-[9px] font-semibold transition-colors text-center ${
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
          </div>
        )}

        {/* 4. FLEXBOX & GRID CONTROLS */}
        {isFlex && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
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
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
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
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Sizing & Constraints"
              icon={<Maximize className="w-3.5 h-3.5 text-cyan-400" />}
              isOpen={isSectionOpen('sizing')}
              onToggle={() => toggleSection('sizing')}
            />
            {isSectionOpen('sizing') && (
              <div className="p-2.5 space-y-2 bg-[#17171b]/40">
                <div {...getPropHandlers('width', style.width)}>
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

                <div {...getPropHandlers('height', style.height)}>
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
                  <div {...getPropHandlers('minWidth', style.minWidth)}>
                    <label className="text-[10px] text-zinc-400 block mb-1">Min Width</label>
                    <UnitInput
                      value={style.minWidth}
                      onChange={(val) => handleStyleChange({ minWidth: val })}
                      units={['px', '%', 'vw']}
                      allowAuto={true}
                      placeholder="auto"
                    />
                  </div>

                  <div {...getPropHandlers('maxWidth', style.maxWidth)}>
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
                  <div {...getPropHandlers('minHeight', style.minHeight)}>
                    <label className="text-[10px] text-zinc-400 block mb-1">Min Height</label>
                    <UnitInput
                      value={style.minHeight}
                      onChange={(val) => handleStyleChange({ minHeight: val })}
                      units={['px', '%', 'vh']}
                      allowAuto={true}
                      placeholder="auto"
                    />
                  </div>

                  <div {...getPropHandlers('maxHeight', style.maxHeight)}>
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

        {/* 6. STYLE & APPEARANCE */}
        {!isSpacerType && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Appearance & Materials"
              icon={<PaletteIcon className="w-3.5 h-3.5 text-pink-400" />}
              isOpen={isSectionOpen('appearance')}
              onToggle={() => toggleSection('appearance')}
            />
            {isSectionOpen('appearance') && (
              <div className="p-2.5 space-y-3 bg-[#17171b]/40">
                {/* Background Color Alone */}
                <div {...getPropHandlers('backgroundColor', style.backgroundColor)}>
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
                      placeholder="#000000 or transparent"
                      className="flex-1 bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none font-mono"
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

                {/* Border Color Alone */}
                <div {...getPropHandlers('borderColor', style.borderColor)}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Border Color
                    </label>
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
                      placeholder="#3f3f46 or transparent"
                      className="flex-1 bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'border')}
                      style={{
                        backgroundColor: style.borderColor === 'transparent' ? 'transparent' : style.borderColor,
                      }}
                      title="Open full RGB/HSV Color Palette Window"
                      className="w-7 h-7 rounded border border-[#444] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative shadow-sm"
                    >
                      {style.borderColor === 'transparent' && (
                        <span className="text-[9px] text-red-500 font-bold">×</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Borders & Shape: Style & Radius Grouped Together */}
                <div className="bg-[#1a1a1e] p-2 rounded border border-[#2b2b36] space-y-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">
                    Borders & Shape
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div {...getPropHandlers('borderStyle', style.borderStyle)}>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-1">Style</label>
                      <select
                        value={style.borderStyle}
                        onChange={(e) => handleStyleChange({ borderStyle: e.target.value as any })}
                        className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                      >
                        <option value="solid">solid</option>
                        <option value="dashed">dashed</option>
                        <option value="dotted">dotted</option>
                        <option value="none">none</option>
                      </select>
                    </div>

                    <div {...getPropHandlers('borderRadius', style.borderRadius)}>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-1">Corner Radius</label>
                      <UnitInput
                        value={style.borderRadius}
                        onChange={(val) => handleStyleChange({ borderRadius: val })}
                        units={['px', '%', 'rem']}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div {...getPropHandlers('opacity', style.opacity)}>
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
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Cursor */}
                <div {...getPropHandlers('cursor', style.cursor || 'default')}>
                  <label className="text-[10px] text-zinc-400 block mb-1">Cursor</label>
                  <select
                    value={style.cursor || 'default'}
                    onChange={(e) => handleStyleChange({ cursor: e.target.value })}
                    className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="default">default</option>
                    <option value="pointer">pointer (Hand / Clickable)</option>
                    <option value="text">text (I-beam)</option>
                    <option value="move">move (4-way Grab)</option>
                    <option value="not-allowed">not-allowed (Disabled)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. TYPOGRAPHY STYLING */}
        {(isTextType || isButtonType || isInputType || isBadgeType) && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Typography Styling"
              icon={<TypeIcon className="w-3.5 h-3.5 text-emerald-400" />}
              isOpen={isSectionOpen('typography')}
              onToggle={() => toggleSection('typography')}
            />
            {isSectionOpen('typography') && (
              <div className="p-2.5 space-y-2.5 bg-[#17171b]/40">
                {/* Text Color */}
                <div {...getPropHandlers('color', style.color)}>
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
                      placeholder="#ffffff or transparent"
                      className="flex-1 bg-[#1c1c20] hover:bg-[#222227] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenColorPicker(e, 'text')}
                      style={{
                        backgroundColor: style.color === 'transparent' ? 'transparent' : style.color,
                      }}
                      title="Open full RGB/HSV Color Palette Window"
                      className="w-7 h-7 rounded border border-[#444] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative shadow-sm"
                    >
                      {style.color === 'transparent' && (
                        <span className="text-[8px] text-red-500 font-bold">×</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div {...getPropHandlers('fontSize', style.fontSize)}>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Font Size</label>
                  <UnitInput
                    value={style.fontSize}
                    onChange={(val) => handleStyleChange({ fontSize: val })}
                    units={['px', 'rem', '%']}
                    placeholder="14"
                  />
                </div>

                {/* Font Weight & Text Align as Button Group */}
                <div className="grid grid-cols-2 gap-2">
                  <div {...getPropHandlers('fontWeight', style.fontWeight)}>
                    <label className="text-[10px] text-zinc-400 block mb-1">Font Weight</label>
                    <select
                      value={style.fontWeight}
                      onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
                      className="w-full bg-[#1c1c20] hover:bg-[#23232a] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                    >
                      <option value="300">300 (Light)</option>
                      <option value="400">400 (Regular)</option>
                      <option value="500">500 (Medium)</option>
                      <option value="600">600 (Semi-Bold)</option>
                      <option value="700">700 (Bold)</option>
                      <option value="800">800 (Extra-Bold)</option>
                    </select>
                  </div>

                  <div {...getPropHandlers('textAlign', style.textAlign)}>
                    <label className="text-[10px] text-zinc-400 block mb-1">Text Align</label>
                    <div className="grid grid-cols-4 gap-0.5 bg-[#17171b] p-0.5 rounded border border-[#34343d]">
                      {[
                        { val: 'left', icon: <AlignLeft className="w-3.5 h-3.5" />, title: 'Align Left' },
                        { val: 'center', icon: <AlignCenter className="w-3.5 h-3.5" />, title: 'Align Center' },
                        { val: 'right', icon: <AlignRight className="w-3.5 h-3.5" />, title: 'Align Right' },
                        { val: 'justify', icon: <AlignJustify className="w-3.5 h-3.5" />, title: 'Justify' },
                      ].map((align) => (
                        <button
                          key={align.val}
                          type="button"
                          onClick={() => handleStyleChange({ textAlign: align.val as any })}
                          title={align.title}
                          className={`flex items-center justify-center py-1 rounded text-xs transition-colors ${
                            style.textAlign === align.val
                              ? 'bg-blue-600 text-white shadow-sm font-bold'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#25252e]'
                          }`}
                        >
                          {align.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. OVERFLOW & SCROLLING */}
        {isContainerType && (
          <div className="mb-3.5 pb-1 border-b border-[#292934]/40">
            <UnrealSectionHeader
              title="Overflow & Clipping"
              icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
              isOpen={isSectionOpen('overflow')}
              onToggle={() => toggleSection('overflow')}
            />
            {isSectionOpen('overflow') && (
              <div className="p-2.5 space-y-3 bg-[#17171b]/40">
                {/* Quick Scroll Presets */}
                <div>
                  <label className="text-[9px] uppercase font-semibold text-zinc-400 block mb-1">
                    Quick Scroll Presets
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'None', ox: 'visible', oy: 'visible', title: 'Default (no scrollbar)' },
                      { label: 'Scroll Y', ox: 'hidden', oy: 'auto', title: 'Vertical scrolling list' },
                      { label: 'Scroll X', ox: 'auto', oy: 'hidden', title: 'Horizontal carousel/row' },
                      { label: 'Both', ox: 'auto', oy: 'auto', title: '2D scrollable viewport' },
                    ].map((preset) => {
                      const currentOx = style.overflowX || style.overflow || 'visible';
                      const currentOy = style.overflowY || style.overflow || 'visible';
                      const isActive = currentOx === preset.ox && currentOy === preset.oy;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleStyleChange({ overflow: 'visible', overflowX: preset.ox as any, overflowY: preset.oy as any })}
                          title={preset.title}
                          className={`py-1 rounded border text-[10px] font-medium transition-colors text-center ${
                            isActive
                              ? 'bg-blue-600/40 border-blue-500 text-blue-200 font-bold shadow-sm'
                              : 'bg-[#1c1c20] border-[#34343d] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div {...getPropHandlers('overflowX', style.overflowX || style.overflow)}>
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

                <div {...getPropHandlers('overflowY', style.overflowY || style.overflow)}>
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

      {/* Docked Collapsible Box Model Inspector (DevTools Concentric Diagram) */}
      <div className="flex-shrink-0 border-t border-[#292934] bg-[#161619]">
        <div
          onClick={() => setShowBoxModelDrawer(!showBoxModelDrawer)}
          className="h-7 px-3 flex items-center justify-between cursor-pointer hover:bg-[#1d1d23] select-none text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <ChevronRight className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${showBoxModelDrawer ? 'rotate-90 text-white' : ''}`} />
            <BoxSelect className="w-3.5 h-3.5 text-amber-400" />
            <span>Box Model Inspector</span>
          </div>
          {metrics && (
            <span className="font-mono text-[9px] text-zinc-400 bg-[#22222a] px-1.5 py-0.5 rounded border border-[#31313c]">
              {Math.round(metrics.boundingRect.width)}×{Math.round(metrics.boundingRect.height)} px
            </span>
          )}
        </div>

        {showBoxModelDrawer && (
          <div className="p-2.5 max-h-56 overflow-y-auto bg-[#131316] border-t border-[#22222a] custom-scrollbar">
            <BoxModelInput
              label="Geometry Inspector"
              margin={style.margin}
              padding={style.padding}
              borderWidth={style.borderWidth}
              contentWidth={metrics?.contentBox.width}
              contentHeight={metrics?.contentBox.height}
              mode="inspect"
              onMarginChange={(m) => handleStyleChange({ margin: m })}
              onPaddingChange={(p) => handleStyleChange({ padding: p })}
              onBorderChange={(b) => handleStyleChange({ borderWidth: b })}
            />
          </div>
        )}
      </div>

      {/* Property Context Menu (Right Click on property row) */}
      {propContextMenu && (
        <>
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setPropContextMenu(null)}
          />
          <div
            style={{ 
              left: `${Math.min(propContextMenu.x, window.innerWidth - 180)}px`, 
              top: `${Math.min(propContextMenu.y, window.innerHeight - 150)}px` 
            }}
            className="fixed z-50 w-44 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 text-xs text-zinc-200 select-none animate-in fade-in zoom-in-95 duration-75"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[9px] font-mono text-zinc-400 uppercase tracking-wider border-b border-[#25252d]">
              Property: {propContextMenu.key}
            </div>
            <button
              onClick={() => {
                copyProperty(propContextMenu.key, propContextMenu.value);
                setPropContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 text-left hover:bg-blue-600/30 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Value</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">Shift+Click</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(propContextMenu.key);
                triggerToast(`Copied name: ${propContextMenu.key}`);
                setPropContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Property Name</span>
            </button>
            <button
              onClick={() => {
                pasteProperty(propContextMenu.key);
                setPropContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 text-left hover:bg-blue-600/30 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paste Value</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">Shift+RClick</span>
            </button>
          </div>
        </>
      )}

      {/* Floating Property Toast Notification */}
      {propertyToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#16161a] border border-blue-500/60 shadow-2xl rounded px-3 py-1.5 text-xs text-blue-200 font-mono animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{propertyToast}</span>
        </div>
      )}

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
