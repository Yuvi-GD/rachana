import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Columns, 
  Rows, 
  Grid3X3, 
  Box, 
  Type, 
  Heading as HeadingIcon,
  MousePointerClick, 
  FormInput,
  Tag,
  Minus,
  Image, 
  MoveHorizontal,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { LayoutNode, LayoutNodeType, isContainerNodeType } from '../../types/layout';
import { ContextMenu } from '../common/ContextMenu';

let globalDraggedId: string | null = null;

const getNodeIcon = (type: LayoutNodeType, style?: LayoutNode['style']) => {
  if (type === 'flex') {
    return style?.flexDirection?.includes('column') ? (
      <Rows className="w-3.5 h-3.5 text-cyan-400" />
    ) : (
      <Columns className="w-3.5 h-3.5 text-blue-400" />
    );
  }
  switch (type) {
    case 'grid':
      return <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />;
    case 'card':
      return <Box className="w-3.5 h-3.5 text-amber-400" />;
    case 'scroll':
      return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
    case 'container':
      return <Box className="w-3.5 h-3.5 text-slate-400" />;
    case 'heading':
      return <HeadingIcon className="w-3.5 h-3.5 text-yellow-400" />;
    case 'text':
      return <Type className="w-3.5 h-3.5 text-emerald-400" />;
    case 'button':
      return <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />;
    case 'input':
      return <FormInput className="w-3.5 h-3.5 text-indigo-400" />;
    case 'badge':
      return <Tag className="w-3.5 h-3.5 text-pink-400" />;
    case 'image':
      return <Image className="w-3.5 h-3.5 text-orange-400" />;
    case 'divider':
      return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
    case 'spacer':
      return <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />;
    default:
      return <Box className="w-3.5 h-3.5 text-zinc-400" />;
  }
};

interface TreeNodeItemProps {
  node: LayoutNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: LayoutNode) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, depth, onContextMenu }) => {
  const { rootNode, selectedNodeId, hoveredNodeId, actions } = useEditorStore();
  const [dropPosition, setDropPosition] = useState<'inside' | 'before' | 'after' | null>(null);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded !== false;
  const isRoot = node.id === rootNode.id;
  const isContainer = isContainerNodeType(node.type);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.updateNodeProps(node.id, { isExpanded: !isExpanded });
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.selectNode(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.deleteNode(node.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.duplicateNode(node.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.moveNode(node.id, 'up');
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.moveNode(node.id, 'down');
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isRoot) return;
    globalDraggedId = node.id;
    e.dataTransfer.setData('draggedNodeId', node.id);
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    globalDraggedId = null;
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const height = rect.height;

    if (isContainer) {
      if (relY < height * 0.25 && !isRoot) {
        setDropPosition('before');
      } else if (relY > height * 0.75 && !isRoot) {
        setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
    } else {
      // Leaf elements cannot receive children: drop before or after
      if (relY < height * 0.5) {
        setDropPosition('before');
      } else {
        setDropPosition('after');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropPosition;
    setDropPosition(null);

    const draggedNodeId = globalDraggedId || e.dataTransfer.getData('draggedNodeId') || null;
    globalDraggedId = null;

    // Check if dropping a new widget from the palette
    let widgetType = (e.dataTransfer.getData('widgetType') as LayoutNodeType) || null;
    let widgetLabel = e.dataTransfer.getData('widgetLabel');

    if (!widgetType) {
      const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (parsed.widgetType) {
            widgetType = parsed.widgetType;
            widgetLabel = parsed.widgetLabel;
          }
        } catch {}
      }
    }

    if (widgetType) {
      actions.addNode(node.id, widgetType, widgetLabel);
      return;
    }

    if (draggedNodeId && draggedNodeId !== node.id) {
      if (pos === 'inside' && isContainer) {
        actions.reparentNode(draggedNodeId, node.id);
      } else if (pos === 'before') {
        actions.reparentNode(draggedNodeId, node.id, 0);
      } else {
        actions.reparentNode(draggedNodeId, node.id);
      }
    }
  };

  return (
    <div>
      <div
        draggable={!isRoot}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelect}
        onContextMenu={(e) => onContextMenu(e, node)}
        onMouseEnter={() => actions.setHoveredNode(node.id)}
        onMouseLeave={() => actions.setHoveredNode(null)}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
        className={`group relative flex items-center justify-between py-1 px-1.5 rounded cursor-pointer transition-colors text-xs select-none ${
          dropPosition === 'inside'
            ? 'bg-emerald-600/30 border border-emerald-500 shadow-sm'
            : isSelected
            ? 'bg-blue-600/30 text-white border-l-2 border-blue-500 font-medium'
            : isHovered
            ? 'bg-[#2a2a30] text-zinc-100'
            : 'text-zinc-300 hover:bg-[#25252a]'
        }`}
      >
        {/* Drop Insertion Indicators */}
        {dropPosition === 'before' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 z-30 shadow-[0_0_4px_#34d399]" />
        )}
        {dropPosition === 'after' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 z-30 shadow-[0_0_4px_#34d399]" />
        )}

        {/* Left Side: Expand button + Icon + Responsive Name */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          {hasChildren ? (
            <button
              onClick={handleToggleExpand}
              className="p-0.5 hover:text-white text-zinc-400 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 flex-shrink-0" />
          )}

          {/* Icon with hover tooltip indicating type and display mode */}
          <div 
            title={`${node.type} (${node.style.display || 'block'})`}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-help"
          >
            {getNodeIcon(node.type, node.style)}
          </div>

          {/* Full Name taking available width */}
          <span className="flex-1 min-w-0 truncate text-[11px] font-medium text-zinc-200">
            {node.name}
          </span>
        </div>

        {/* Right Side: Action buttons visible on hover or selection */}
        {(isSelected || isHovered) && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={handleMoveUp}
              title="Move Up"
              className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d]"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={handleMoveDown}
              title="Move Down"
              className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d]"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={handleDuplicate}
              title="Duplicate (Ctrl+D)"
              className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d]"
            >
              <Copy className="w-3 h-3" />
            </button>
            {isRoot ? (
              <button
                onClick={handleDelete}
                title="Clear Canvas (Remove all widgets)"
                className="p-0.5 hover:text-amber-400 text-zinc-500 rounded hover:bg-[#34343d]"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleDelete}
                title="Delete Widget (Del / Backspace)"
                className="p-0.5 hover:text-red-400 text-zinc-400 rounded hover:bg-[#34343d]"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Hierarchy: React.FC = () => {
  const { rootNode, actions } = useEditorStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: LayoutNode } | null>(null);

  const handleRowContextMenu = (e: React.MouseEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    actions.selectNode(node.id);
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    let draggedNodeId = e.dataTransfer.getData('draggedNodeId') || null;

    const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.widgetType) {
          actions.addNode(rootNode.id, parsed.widgetType, parsed.widgetLabel);
          return;
        }
        if (parsed.draggedNodeId) {
          draggedNodeId = parsed.draggedNodeId;
        }
      } catch {}
    }

    const widgetType = e.dataTransfer.getData('widgetType') as LayoutNodeType;
    const widgetLabel = e.dataTransfer.getData('widgetLabel');
    if (widgetType) {
      actions.addNode(rootNode.id, widgetType, widgetLabel);
    } else if (draggedNodeId && draggedNodeId !== rootNode.id) {
      actions.reparentNode(draggedNodeId, rootNode.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-r border-[#27272a] select-none relative">
      {/* Header */}
      <div className="h-8 px-3 border-b border-[#27272a] flex items-center justify-between bg-[#19191c]">
        <span className="font-semibold text-zinc-200 text-[11px] uppercase tracking-wider">
          Hierarchy
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Tree View</span>
      </div>

      {/* Tree Content with drop-to-root support on empty space */}
      <div 
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
        onContextMenu={(e) => handleRowContextMenu(e, rootNode)}
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar"
      >
        <TreeNodeItem node={rootNode} depth={0} onContextMenu={handleRowContextMenu} />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
