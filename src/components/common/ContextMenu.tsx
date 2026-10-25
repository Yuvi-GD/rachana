import React, { useState, useEffect, useRef } from 'react';
import { LayoutNode, LayoutNodeType, isContainerNodeType } from '../../types/layout';
import { useEditorStore } from '../../store/editorStore';
import { exportLayoutEngineYaml } from '../../core/layoutSerializer';
import { 
  Plus, 
  RefreshCw, 
  FolderPlus, 
  Copy, 
  Trash2, 
  Check, 
  Columns, 
  Grid3X3, 
  Box, 
  Type, 
  MousePointerClick, 
  FormInput, 
  Image as ImageIcon, 
  Minus, 
  MoveHorizontal,
  ChevronRight,
  RotateCcw,
  Ungroup,
  ListFilter,
  Activity,
  CheckSquare,
  SlidersHorizontal
} from 'lucide-react';

interface MenuItemDef {
  type: LayoutNodeType;
  label: string;
  icon: React.ReactNode;
  category: 'Containers' | 'Primitives' | 'Form Controls';
}

const MENU_WIDGET_ITEMS: MenuItemDef[] = [
  { type: 'flex', label: 'Flex', icon: <Columns className="w-3.5 h-3.5 text-blue-400" />, category: 'Containers' },
  { type: 'grid', label: 'Grid', icon: <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />, category: 'Containers' },
  { type: 'container', label: 'Canvas', icon: <Box className="w-3.5 h-3.5 text-amber-400" />, category: 'Containers' },
  { type: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5 text-emerald-400" />, category: 'Primitives' },
  { type: 'button', label: 'Button', icon: <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />, category: 'Primitives' },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-orange-400" />, category: 'Primitives' },
  { type: 'divider', label: 'Divider', icon: <Minus className="w-3.5 h-3.5 text-zinc-400" />, category: 'Primitives' },
  { type: 'spacer', label: 'Spacer', icon: <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />, category: 'Primitives' },
  { type: 'input', label: 'Text Input', icon: <FormInput className="w-3.5 h-3.5 text-indigo-400" />, category: 'Form Controls' },
  { type: 'select', label: 'Dropdown', icon: <ListFilter className="w-3.5 h-3.5 text-cyan-400" />, category: 'Form Controls' },
  { type: 'progress', label: 'Progress Bar', icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />, category: 'Form Controls' },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-3.5 h-3.5 text-blue-400" />, category: 'Form Controls' },
  { type: 'slider', label: 'Range Slider', icon: <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />, category: 'Form Controls' },
];

export interface ContextMenuProps {
  x: number;
  y: number;
  node: LayoutNode;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, node, onClose }) => {
  const { rootNode, selectedNodeIds, actions } = useEditorStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'add' | 'replace' | 'wrap' | null>(null);
  const [copied, setCopied] = useState(false);

  const isRoot = node.id === rootNode.id;
  const isMulti = Boolean(selectedNodeIds && selectedNodeIds.length > 1 && selectedNodeIds.includes(node.id));

  // Close on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Viewport bounds clamp
  const isNearRightEdge = x + 440 > window.innerWidth;
  const adjustedX = Math.max(10, Math.min(x, window.innerWidth - 230));
  const adjustedY = Math.max(10, Math.min(y, window.innerHeight - 340));

  const handleAddChild = (type: LayoutNodeType, label?: string) => {
    actions.addNode(node.id, type, label);
    onClose();
  };

  const handleReplaceType = (newType: LayoutNodeType, label?: string) => {
    actions.replaceNodeType(node.id, newType, label);
    onClose();
  };

  const handleWrap = (wrapperType: LayoutNodeType, label?: string) => {
    actions.wrapNode(node.id, wrapperType, label);
    onClose();
  };

  const handleUnwrap = () => {
    actions.unwrapNode(node.id);
    onClose();
  };

  const handleDelete = () => {
    actions.deleteNode(node.id);
    onClose();
  };

  const handleDuplicate = () => {
    actions.duplicateNode(node.id);
    onClose();
  };

  const handleCopyYaml = () => {
    const yaml = exportLayoutEngineYaml(node);
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 600);
  };

  const handleClearChildren = () => {
    actions.deleteNode(node.id);
    onClose();
  };

  const containerItems = MENU_WIDGET_ITEMS.filter((i) => i.category === 'Containers');
  const primitiveItems = MENU_WIDGET_ITEMS.filter((i) => i.category === 'Primitives');
  const formControlItems = MENU_WIDGET_ITEMS.filter((i) => i.category === 'Form Controls');

  const submenuPosClass = isNearRightEdge ? 'right-full top-0 pr-1' : 'left-full top-0 pl-1';

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-56 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl text-xs text-zinc-200 select-none py-1 font-sans"
    >
      {/* Node Header Identity */}
      <div className="px-3 py-1.5 border-b border-[#25252d] flex items-center justify-between text-[11px] bg-[#141417] rounded-t-lg">
        <span className="font-semibold text-zinc-100 truncate max-w-[120px]">
          {node.name}
        </span>
        <span className="font-mono text-[9px] text-blue-400 bg-blue-950/70 px-1.5 py-0.2 rounded border border-blue-900/50">
          #{node.id}
        </span>
      </div>

      {/* Menu Actions */}
      <div className="p-1 space-y-0.5">
        {/* 1. Add Child Submenu (Only on containers) */}
        {isContainerNodeType(node.type) && (
          <div
            onMouseEnter={() => setActiveSubmenu('add')}
            className="relative group"
          >
            <div className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded transition-colors">
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Child Widget</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            {/* Submenu with seamless hover bridge */}
            {activeSubmenu === 'add' && (
              <div 
                className={`absolute ${submenuPosClass} w-48 z-50`}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <div className="rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                    Containers
                  </div>
                  {containerItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleAddChild(item.type, item.label)}
                      className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-[#26262e] my-1" />
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                    Primitives
                  </div>
                  {primitiveItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleAddChild(item.type, item.label)}
                      className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-[#26262e] my-1" />
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                    Form Controls
                  </div>
                  {formControlItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleAddChild(item.type, item.label)}
                      className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Replace Type Submenu */}
        <div
          onMouseEnter={() => setActiveSubmenu('replace')}
          className="relative group"
        >
          <div className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded transition-colors">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Replace / Change Type</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          {activeSubmenu === 'replace' && (
            <div 
              className={`absolute ${submenuPosClass} w-52 z-50`}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <div className="rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 max-h-80 overflow-y-auto custom-scrollbar">
                {node.children && node.children.length > 0 && !isRoot && (
                  <>
                    <button
                      onClick={handleUnwrap}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-amber-600/30 text-amber-300 hover:text-white flex items-center gap-2 border-b border-[#26262e] mb-1"
                    >
                      <Ungroup className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold">Replace with Children (Unwrap)</span>
                    </button>
                  </>
                )}
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Containers
                </div>
                {containerItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleReplaceType(item.type, item.label)}
                    className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="border-t border-[#26262e] my-1" />
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Primitives
                </div>
                {primitiveItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleReplaceType(item.type, item.label)}
                    className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="border-t border-[#26262e] my-1" />
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Form Controls
                </div>
                {formControlItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleReplaceType(item.type, item.label)}
                    className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Wrap in Container Submenu */}
        <div
          onMouseEnter={() => setActiveSubmenu('wrap')}
          className="relative group"
        >
          <div className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded transition-colors">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>{isMulti ? `Wrap ${selectedNodeIds!.length} Items` : 'Wrap in Container'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          {activeSubmenu === 'wrap' && (
            <div 
              className={`absolute ${submenuPosClass} w-48 z-50`}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <div className="rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1">
                <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  {isMulti ? `Wrap (${selectedNodeIds!.length} Selected)` : 'Containers'}
                </div>
                {containerItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleWrap(item.type, item.label)}
                    className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Replace with Children (Unwrap) */}
        {node.children && node.children.length > 0 && !isRoot && (
          <button
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={handleUnwrap}
            className="w-full px-2 py-1.5 hover:bg-amber-600/20 hover:text-amber-200 text-amber-300 flex items-center justify-between text-left rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <Ungroup className="w-3.5 h-3.5 text-amber-400" />
              <span>Replace with Children (Unwrap)</span>
            </div>
          </button>
        )}

        <div className="border-t border-[#25252d] my-1" />

        {/* 5. Duplicate (Ctrl+D) */}
        {!isRoot && (
          <button
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={handleDuplicate}
            className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between text-left rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duplicate</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Ctrl+D</span>
          </button>
        )}

        {/* 6. Copy YAML */}
        <button
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={handleCopyYaml}
          className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between text-left rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied YAML!' : 'Copy YAML Snippet'}</span>
          </div>
        </button>

        {/* 7. Clear Children (if has children) */}
        {node.children && node.children.length > 0 && (
          <button
            onMouseEnter={() => setActiveSubmenu(null)}
            onClick={handleClearChildren}
            className="w-full px-2 py-1.5 hover:bg-amber-600/20 hover:text-amber-200 text-amber-400/90 flex items-center gap-2 text-left rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Children ({node.children.length})</span>
          </button>
        )}

        {/* 8. Delete Widget / Reset Root */}
        <div className="border-t border-[#25252d] my-1" />
        <button
          onMouseEnter={() => setActiveSubmenu(null)}
          onClick={handleDelete}
          className="w-full px-2 py-1.5 hover:bg-red-600/20 text-red-400 hover:text-red-300 flex items-center justify-between text-left rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRoot ? 'Reset / Clear Canvas' : 'Delete Widget'}</span>
          </div>
          <span className="text-[10px] text-red-500/70 font-mono">Del</span>
        </button>
      </div>
    </div>
  );
};
