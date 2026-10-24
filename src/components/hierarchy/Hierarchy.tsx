import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Columns, 
  Rows, 
  Grid3X3, 
  Box, 
  Type, 
  MousePointerClick, 
  Image, 
  MoveHorizontal,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { LayoutNode, LayoutNodeType } from '../../types/layout';

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
    case 'container':
      return <Box className="w-3.5 h-3.5 text-slate-400" />;
    case 'text':
      return <Type className="w-3.5 h-3.5 text-emerald-400" />;
    case 'button':
      return <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />;
    case 'image':
      return <Image className="w-3.5 h-3.5 text-orange-400" />;
    case 'spacer':
      return <MoveHorizontal className="w-3.5 h-3.5 text-pink-400" />;
    default:
      return <Box className="w-3.5 h-3.5 text-zinc-400" />;
  }
};

interface TreeNodeItemProps {
  node: LayoutNode;
  depth: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, depth }) => {
  const { selectedNodeId, hoveredNodeId, actions } = useEditorStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded !== false;

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

  const handleToggleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.updateNodeProps(node.id, { isHidden: !node.isHidden });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('draggedNodeId', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let widgetType: LayoutNodeType | null = null;
    let widgetLabel: string | undefined;

    const rawData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.widgetType) {
          widgetType = parsed.widgetType;
          widgetLabel = parsed.widgetLabel;
        }
      } catch {
        // Not JSON
      }
    }

    if (!widgetType) {
      widgetType = (e.dataTransfer.getData('widgetType') as LayoutNodeType) || null;
    }

    const draggedNodeId = e.dataTransfer.getData('draggedNodeId');

    if (widgetType) {
      actions.addNode(node.id, widgetType, widgetLabel);
    } else if (draggedNodeId && draggedNodeId !== node.id) {
      actions.reparentNode(draggedNodeId, node.id);
    }
  };

  return (
    <div>
      <div
        draggable={node.id !== 'root'}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelect}
        onMouseEnter={() => actions.setHoveredNode(node.id)}
        onMouseLeave={() => actions.setHoveredNode(null)}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
        className={`group flex items-center justify-between py-1 px-1.5 rounded cursor-pointer transition-colors text-xs select-none ${
          isDragOver
            ? 'bg-emerald-600/30 border border-emerald-500'
            : isSelected
            ? 'bg-blue-600/30 text-white border-l-2 border-blue-500 font-medium'
            : isHovered
            ? 'bg-[#2a2a30] text-zinc-100'
            : 'text-zinc-300 hover:bg-[#25252a]'
        }`}
      >
        {/* Left Side: Expand button + Icon + Responsive Name + Display Tag */}
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

          {/* Icon (always fixed size and visible) */}
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {getNodeIcon(node.type, node.style)}
          </div>

          {/* Full Name taking all available width */}
          <span className="flex-1 min-w-0 truncate text-[11px] font-medium text-zinc-200">
            {node.name}
          </span>

          {/* Display Mode Tag */}
          <span className="text-[9px] text-zinc-500 font-mono flex-shrink-0 px-1 py-0.2 rounded bg-[#18181b]">
            {node.style.display}
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
              title="Duplicate"
              className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d]"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={handleToggleHide}
              title={node.isHidden ? 'Show' : 'Hide'}
              className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d]"
            >
              {node.isHidden ? (
                <EyeOff className="w-3 h-3 text-amber-500" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </button>
            {node.id !== 'root' && (
              <button
                onClick={handleDelete}
                title="Delete"
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
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Hierarchy: React.FC = () => {
  const { rootNode, selectedNodeId, actions } = useEditorStore();

  return (
    <div className="flex flex-col h-full bg-[#1e1e22] text-zinc-300 border-r border-[#27272a] select-none">
      {/* Header */}
      <div className="h-8 px-3 border-b border-[#27272a] flex items-center justify-between bg-[#19191c]">
        <span className="font-semibold text-zinc-200 text-[11px] uppercase tracking-wider">
          Hierarchy
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Tree View</span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
        <TreeNodeItem node={rootNode} depth={0} />
      </div>

      {/* Selected Indicator */}
      <div className="p-1.5 border-t border-[#27272a] bg-[#1a1a1d] flex items-center justify-between text-[10px] text-zinc-400">
        <span>Selected:</span>
        <button
          onClick={() => actions.selectNode(rootNode.id)}
          className="text-blue-400 hover:underline font-mono truncate max-w-[140px]"
        >
          {selectedNodeId ? `#${selectedNodeId}` : 'none'}
        </button>
      </div>
    </div>
  );
};
