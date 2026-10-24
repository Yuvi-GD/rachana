import React, { useState, useEffect, useRef } from 'react';
import { LayoutNode, LayoutNodeType } from '../../types/layout';
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
  Rows, 
  Grid3X3, 
  Box, 
  Type, 
  Heading as HeadingIcon, 
  MousePointerClick, 
  FormInput, 
  Tag, 
  Image as ImageIcon, 
  Minus, 
  MoveHorizontal,
  ChevronRight,
  Layers,
  RotateCcw
} from 'lucide-react';

export interface ContextMenuProps {
  x: number;
  y: number;
  node: LayoutNode;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, node, onClose }) => {
  const { rootNode, actions } = useEditorStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'add' | 'replace' | 'wrap' | null>(null);
  const [copied, setCopied] = useState(false);

  const isRoot = node.id === rootNode.id;

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
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  const handleAddChild = (type: LayoutNodeType, label?: string) => {
    actions.addNode(node.id, type, label);
    onClose();
  };

  const handleReplaceType = (newType: LayoutNodeType) => {
    actions.replaceNodeType(node.id, newType);
    onClose();
  };

  const handleWrap = (wrapperType: LayoutNodeType) => {
    actions.wrapNode(node.id, wrapperType);
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
    actions.deleteNode(node.id); // for root or parent with children
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-56 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl text-xs text-zinc-200 select-none py-1 font-sans backdrop-blur-md"
    >
      {/* Node Header Identity */}
      <div className="px-3 py-1.5 border-b border-[#25252d] flex items-center justify-between text-[11px] bg-[#141417]">
        <span className="font-semibold text-zinc-100 truncate max-w-[120px]">
          {node.name}
        </span>
        <span className="font-mono text-[9px] text-blue-400 bg-blue-950/70 px-1.5 py-0.2 rounded border border-blue-900/50">
          #{node.id}
        </span>
      </div>

      {/* Menu Actions */}
      <div className="py-1">
        {/* 1. Add Child Submenu */}
        <div
          onMouseEnter={() => setActiveSubmenu('add')}
          className="relative group px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded-xs mx-1"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Child Widget</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />

          {/* Submenu */}
          {activeSubmenu === 'add' && (
            <div className="absolute left-full top-0 ml-1 w-48 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 z-50">
              <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                Containers
              </div>
              <button
                onClick={() => handleAddChild('flex', 'Flex Row')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Columns className="w-3.5 h-3.5 text-blue-400" />
                <span>Flex Row</span>
              </button>
              <button
                onClick={() => handleAddChild('flex', 'Flex Column')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Rows className="w-3.5 h-3.5 text-cyan-400" />
                <span>Flex Column</span>
              </button>
              <button
                onClick={() => handleAddChild('grid', 'Grid Container')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Grid 2x2</span>
              </button>
              <button
                onClick={() => handleAddChild('card', 'Card Box')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Card Box</span>
              </button>
              <button
                onClick={() => handleAddChild('container', 'Block Container')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>Block Container</span>
              </button>

              <div className="border-t border-[#26262e] my-1" />
              <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                Primitives
              </div>
              <button
                onClick={() => handleAddChild('heading', 'Heading')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <HeadingIcon className="w-3.5 h-3.5 text-yellow-400" />
                <span>Heading Text</span>
              </button>
              <button
                onClick={() => handleAddChild('text', 'Text Block')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Type className="w-3.5 h-3.5 text-emerald-400" />
                <span>Text Block</span>
              </button>
              <button
                onClick={() => handleAddChild('button', 'Button')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />
                <span>Button Widget</span>
              </button>
              <button
                onClick={() => handleAddChild('input', 'Input Field')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <FormInput className="w-3.5 h-3.5 text-indigo-400" />
                <span>Text Input</span>
              </button>
              <button
                onClick={() => handleAddChild('badge', 'Badge')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Tag className="w-3.5 h-3.5 text-pink-400" />
                <span>Badge Pill</span>
              </button>
              <button
                onClick={() => handleAddChild('image', 'Image Box')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                <span>Image Box</span>
              </button>
              <button
                onClick={() => handleAddChild('divider', 'Divider')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Minus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Divider Line</span>
              </button>
              <button
                onClick={() => handleAddChild('spacer', 'Spacer')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />
                <span>Flex Spacer</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Replace Type Submenu (Works for ROOT & all nodes!) */}
        <div
          onMouseEnter={() => setActiveSubmenu('replace')}
          className="relative group px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded-xs mx-1"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replace / Change Type</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />

          {activeSubmenu === 'replace' && (
            <div className="absolute left-full top-0 ml-1 w-44 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 z-50">
              <button
                onClick={() => handleReplaceType('flex')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Columns className="w-3.5 h-3.5 text-blue-400" />
                <span>Flex Container</span>
              </button>
              <button
                onClick={() => handleReplaceType('grid')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Grid Container</span>
              </button>
              <button
                onClick={() => handleReplaceType('card')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Card Box</span>
              </button>
              <button
                onClick={() => handleReplaceType('container')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>Block Container</span>
              </button>
              <button
                onClick={() => handleReplaceType('scroll')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scroll Area</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Wrap in Container Submenu */}
        <div
          onMouseEnter={() => setActiveSubmenu('wrap')}
          className="relative group px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between cursor-pointer rounded-xs mx-1"
        >
          <div className="flex items-center gap-2">
            <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>Wrap in Container</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />

          {activeSubmenu === 'wrap' && (
            <div className="absolute left-full top-0 ml-1 w-44 rounded-lg bg-[#18181c] border border-[#2e2e38] shadow-2xl py-1 z-50">
              <button
                onClick={() => handleWrap('flex')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Columns className="w-3.5 h-3.5 text-blue-400" />
                <span>Wrap in Flex Row</span>
              </button>
              <button
                onClick={() => handleWrap('container')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>Wrap in Block</span>
              </button>
              <button
                onClick={() => handleWrap('card')}
                className="w-full px-2.5 py-1 text-left hover:bg-blue-600/30 hover:text-white flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Wrap in Card</span>
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#25252d] my-1" />

        {/* 4. Duplicate (Ctrl+D) */}
        {!isRoot && (
          <button
            onClick={handleDuplicate}
            className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between text-left rounded-xs mx-1"
          >
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duplicate</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Ctrl+D</span>
          </button>
        )}

        {/* 5. Copy YAML */}
        <button
          onClick={handleCopyYaml}
          className="w-full px-2 py-1.5 hover:bg-blue-600/20 hover:text-white flex items-center justify-between text-left rounded-xs mx-1"
        >
          <div className="flex items-center gap-2">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copied YAML!' : 'Copy YAML Snippet'}</span>
          </div>
        </button>

        {/* 6. Clear Children (if has children) */}
        {node.children && node.children.length > 0 && (
          <button
            onClick={handleClearChildren}
            className="w-full px-2 py-1.5 hover:bg-amber-600/20 hover:text-amber-200 text-amber-400/90 flex items-center gap-2 text-left rounded-xs mx-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Children ({node.children.length})</span>
          </button>
        )}

        {/* 7. Delete Widget / Reset Root */}
        <div className="border-t border-[#25252d] my-1" />
        <button
          onClick={handleDelete}
          className="w-full px-2 py-1.5 hover:bg-red-600/20 text-red-400 hover:text-red-300 flex items-center justify-between text-left rounded-xs mx-1"
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
