import React, { useState } from 'react';
import { 
  Columns, 
  Rows, 
  Grid3X3, 
  Box, 
  Type, 
  MousePointerClick, 
  Image, 
  MoveHorizontal,
  GripVertical,
  Info
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { LayoutNodeType } from '../../types/layout';

interface PaletteItem {
  type: LayoutNodeType;
  label: string;
  icon: React.ReactNode;
  category: 'Containers' | 'Primitives';
  description: string;
  cssSnippet: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'flex',
    label: 'Flex Row',
    icon: <Columns className="w-4 h-4 text-blue-400" />,
    category: 'Containers',
    description: 'Horizontal flexbox container. Arranges child widgets in a row with customizable gap and alignment.',
    cssSnippet: 'display: flex;\nflex-direction: row;\ngap: 12px;',
  },
  {
    type: 'flex',
    label: 'Flex Column',
    icon: <Rows className="w-4 h-4 text-cyan-400" />,
    category: 'Containers',
    description: 'Vertical flexbox container. Stacks child widgets top-to-bottom with spacing and cross-axis stretching.',
    cssSnippet: 'display: flex;\nflex-direction: column;\ngap: 12px;',
  },
  {
    type: 'grid',
    label: 'Grid Container',
    icon: <Grid3X3 className="w-4 h-4 text-purple-400" />,
    category: 'Containers',
    description: '2D CSS grid container. Aligns child items into customizable column and row tracks with auto-flow.',
    cssSnippet: 'display: grid;\ngrid-template-columns: 1fr 1fr;\ngap: 12px;',
  },
  {
    type: 'container',
    label: 'Block Container',
    icon: <Box className="w-4 h-4 text-slate-400" />,
    category: 'Containers',
    description: 'Standard block-flow container (div). Occupies full width and stacks vertically in normal document flow.',
    cssSnippet: 'display: block;\nwidth: auto;\npadding: 12px;',
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: <Type className="w-4 h-4 text-emerald-400" />,
    category: 'Primitives',
    description: 'Typography paragraph or heading widget with font weight, size, line-height, and alignment styling.',
    cssSnippet: 'display: block;\nfont-size: 14px;\nfont-weight: 500;',
  },
  {
    type: 'button',
    label: 'Button',
    icon: <MousePointerClick className="w-4 h-4 text-amber-400" />,
    category: 'Primitives',
    description: 'Interactive button widget with built-in padding, hover styling, and centered label.',
    cssSnippet: 'display: inline-block;\npadding: 8px 16px;\ncursor: pointer;',
  },
  {
    type: 'image',
    label: 'Image / Box',
    icon: <Image className="w-4 h-4 text-orange-400" />,
    category: 'Primitives',
    description: 'Visual media box with configurable aspect-ratio, fixed dimensions, or responsive scaling.',
    cssSnippet: 'width: 120px;\nheight: 80px;\nborder-radius: 4px;',
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: <MoveHorizontal className="w-4 h-4 text-pink-400" />,
    category: 'Primitives',
    description: 'Flexible empty spacer element configured with flex-grow: 1 to push adjacent widgets apart.',
    cssSnippet: 'flex-grow: 1;\nmin-width: 20px;',
  },
];

export const Palette: React.FC = () => {
  const { selectedNodeId, rootNode, actions } = useEditorStore();
  const [hoveredItem, setHoveredItem] = useState<{ item: PaletteItem; top: number } | null>(null);

  const handleAddWidget = (item: PaletteItem) => {
    const targetParentId = selectedNodeId || rootNode.id;
    actions.addNode(targetParentId, item.type, item.label);
  };

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    const payload = JSON.stringify({ widgetType: item.type, widgetLabel: item.label });
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('widgetType', item.type);
    e.dataTransfer.setData('widgetLabel', item.label);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const categories = ['Containers', 'Primitives'] as const;

  return (
    <div className="relative flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-r border-[#27272a] select-none">
      {/* Panel Header */}
      <div className="h-8 px-3 border-b border-[#27272a] flex items-center justify-between bg-[#19191c] flex-shrink-0">
        <span className="font-semibold text-zinc-200 text-[11px] uppercase tracking-wider">
          Palette
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Drag or Click</span>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5 custom-scrollbar">
        {categories.map((category) => (
          <div key={category} className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 px-1 py-0.5 tracking-wider">
              {category}
            </div>

            <div className="grid grid-cols-1 gap-1">
              {PALETTE_ITEMS.filter((i) => i.category === category).map((item) => (
                <div
                  key={item.label}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => handleAddWidget(item)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItem({ item, top: rect.top });
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="group flex items-center justify-between p-1.5 rounded bg-[#242429] hover:bg-[#2c2c34] active:bg-[#34343e] border border-[#303038] hover:border-blue-500/60 transition-all text-left cursor-grab active:cursor-grabbing relative"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
                    <div className="p-1 rounded bg-[#1c1c20] border border-[#2b2b30] group-hover:bg-blue-600/10 group-hover:border-blue-500/40 transition-colors flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-blue-300">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-blue-400 px-1.5 py-0.2 rounded bg-[#1c1c20] border border-[#2b2b30]">
                    +
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rich Floating Tooltip (Shown on Hover) */}
      {hoveredItem && (
        <div
          style={{ top: `${Math.max(10, Math.min(hoveredItem.top - 20, window.innerHeight - 200))}px` }}
          className="fixed left-[270px] z-50 w-64 bg-[#18181b]/98 border border-[#3f3f4c] shadow-2xl rounded-lg p-3 text-xs pointer-events-none transition-all backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
              {hoveredItem.item.icon}
              <span>{hoveredItem.item.label}</span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#242429] text-zinc-400 border border-[#33333d]">
              {hoveredItem.item.category}
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-normal mb-2">
            {hoveredItem.item.description}
          </p>

          <div className="bg-[#101012] p-2 rounded border border-[#25252c] font-mono text-[10px] text-emerald-400 mb-2 whitespace-pre leading-relaxed">
            {hoveredItem.item.cssSnippet}
          </div>

          <div className="text-[9px] text-blue-400 flex items-center gap-1 font-medium">
            <Info className="w-3 h-3" />
            <span>Drag into canvas or click to insert</span>
          </div>
        </div>
      )}

      {/* Target Status */}
      <div className="p-1.5 border-t border-[#27272a] bg-[#1a1a1d] text-[10px] text-zinc-400 flex items-center justify-between flex-shrink-0">
        <span>Target:</span>
        <span className="font-mono text-blue-400 truncate max-w-[140px]">
          {selectedNodeId ? `#${selectedNodeId}` : 'Root Canvas'}
        </span>
      </div>
    </div>
  );
};
