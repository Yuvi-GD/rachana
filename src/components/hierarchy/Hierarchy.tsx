import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Columns, 
  Rows, 
  Grid3X3, 
  Box, 
  Type, 
  MousePointerClick, 
  FormInput,
  Tag,
  Minus,
  Image, 
  MoveHorizontal,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Layers,
  Copy,
  Trash2,
  ListFilter,
  Activity,
  CheckSquare,
  SlidersHorizontal
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
    case 'text':
      return <Type className="w-3.5 h-3.5 text-emerald-400" />;
    case 'button':
      return <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />;
    case 'input':
      return <FormInput className="w-3.5 h-3.5 text-indigo-400" />;
    case 'select':
      return <ListFilter className="w-3.5 h-3.5 text-cyan-400" />;
    case 'progress':
      return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
    case 'checkbox':
      return <CheckSquare className="w-3.5 h-3.5 text-blue-400" />;
    case 'slider':
      return <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />;
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
  activeDrop: { id: string; pos: 'inside' | 'before' | 'after' } | null;
  setActiveDrop: (target: { id: string; pos: 'inside' | 'before' | 'after' } | null) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ 
  node, 
  depth, 
  onContextMenu, 
  activeDrop, 
  setActiveDrop 
}) => {
  const { rootNode, selectedNodeId, selectedNodeIds, hoveredNodeId, actions } = useEditorStore();

  const isSelected = (selectedNodeIds && selectedNodeIds.includes(node.id)) || selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded !== false;
  const isRoot = node.id === rootNode.id;
  const isContainer = isContainerNodeType(node.type);

  const isDropTarget = activeDrop?.id === node.id;
  const dropPosition = isDropTarget ? activeDrop.pos : null;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.updateNodeProps(node.id, { isExpanded: !isExpanded });
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      actions.toggleSelectNode(node.id);
    } else if (e.shiftKey) {
      actions.selectNodeRange(node.id);
    } else {
      actions.selectNode(node.id);
    }
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
    setActiveDrop(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Support both internal move and palette copy
    const isPaletteDrag = Boolean((window as any).__draggedPaletteWidget);
    e.dataTransfer.dropEffect = isPaletteDrag ? 'copy' : 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const height = rect.height;

    let pos: 'inside' | 'before' | 'after';
    if (isContainer) {
      if (relY < height * 0.25 && !isRoot) {
        pos = 'before';
      } else if (relY > height * 0.75 && !isRoot) {
        pos = 'after';
      } else {
        pos = 'inside';
      }
    } else {
      // Leaf elements cannot receive children: drop before or after
      pos = relY < height * 0.5 ? 'before' : 'after';
    }

    if (activeDrop?.id !== node.id || activeDrop?.pos !== pos) {
      setActiveDrop({ id: node.id, pos });
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
      if (activeDrop?.id === node.id) {
        setActiveDrop(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = activeDrop?.id === node.id ? activeDrop.pos : null;
    setActiveDrop(null);

    const draggedNodeId = globalDraggedId || e.dataTransfer.getData('draggedNodeId') || null;
    globalDraggedId = null;

    // Check if dropping a new widget from the palette
    let widgetType = (e.dataTransfer.getData('widgetType') as LayoutNodeType) || null;
    let widgetLabel = e.dataTransfer.getData('widgetLabel');

    if (!widgetType && (window as any).__draggedPaletteWidget) {
      widgetType = (window as any).__draggedPaletteWidget.type;
      widgetLabel = (window as any).__draggedPaletteWidget.label;
    }

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

    (window as any).__draggedPaletteWidget = null;

    if (widgetType) {
      if ((pos === 'before' || pos === 'after') && !isRoot) {
        actions.addNodeAround(node.id, widgetType, widgetLabel, pos);
      } else if (pos === 'inside' && isContainer) {
        actions.addNode(node.id, widgetType, widgetLabel);
      } else {
        actions.addNodeAround(node.id, widgetType, widgetLabel, 'after');
      }
      return;
    }

    if (draggedNodeId && draggedNodeId !== node.id) {
      if (pos === 'inside' && isContainer) {
        actions.reparentNode(draggedNodeId, node.id);
      } else if (pos === 'before' || pos === 'after') {
        actions.reparentNodeAround(draggedNodeId, node.id, pos);
      } else if (!isRoot) {
        actions.reparentNodeAround(draggedNodeId, node.id, 'after');
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
        } ${node.isHidden ? 'opacity-50 italic' : ''}`}
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

        {/* Right Side: Row Action Buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Reorder Up/Down for non-root elements on hover or selection */}
          {!isRoot && (isSelected || isHovered) && (
            <>
              <button
                type="button"
                onClick={handleMoveUp}
                title="Move Up"
                className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d] transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleMoveDown}
                title="Move Down"
                className="p-0.5 hover:text-white text-zinc-400 rounded hover:bg-[#34343d] transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </>
          )}

          {/* Visibility Eye Icon (Always shown if hidden, or on hover/select) */}
          {(isSelected || isHovered || node.isHidden) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                actions.updateNodeProps(node.id, { isHidden: !node.isHidden });
              }}
              title={node.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
              className={`p-0.5 rounded hover:bg-[#34343d] transition-colors ${
                node.isHidden ? "text-amber-400 hover:text-amber-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              {node.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeItem 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              onContextMenu={onContextMenu}
              activeDrop={activeDrop}
              setActiveDrop={setActiveDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Hierarchy: React.FC = () => {
  const { rootNode, selectedNodeIds, actions } = useEditorStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: LayoutNode } | null>(null);
  const [activeDrop, setActiveDrop] = useState<{ id: string; pos: 'inside' | 'before' | 'after' } | null>(null);

  // Global dragend/drop cleaner to ensure insertion lines never get stuck
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setActiveDrop(null);
      (window as any).__draggedPaletteWidget = null;
      globalDraggedId = null;
    };
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

  const handleRowContextMenu = (e: React.MouseEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedNodeIds || !selectedNodeIds.includes(node.id)) {
      actions.selectNode(node.id);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const isPaletteDrag = Boolean((window as any).__draggedPaletteWidget);
    e.dataTransfer.dropEffect = isPaletteDrag ? 'copy' : 'move';
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDrop(null);
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
        {selectedNodeIds && selectedNodeIds.length > 1 ? (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-blue-400 font-mono font-semibold bg-blue-500/15 px-1.5 py-0.2 rounded border border-blue-500/30">
              {selectedNodeIds.length} Selected
            </span>
            <button
              onClick={() => actions.duplicateSelectedNodes()}
              title="Duplicate Selected (Ctrl+D)"
              className="p-1 text-zinc-400 hover:text-white hover:bg-[#252530] rounded cursor-pointer transition-colors"
            >
              <Copy className="w-3 h-3 text-cyan-400" />
            </button>
            <button
              onClick={() => actions.deleteSelectedNodes()}
              title="Delete Selected (Del)"
              className="p-1 text-zinc-400 hover:text-rose-300 hover:bg-rose-500/20 rounded cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-500 font-mono">Tree View</span>
        )}
      </div>

      {/* Tree Content with drop-to-root support on empty space */}
      <div 
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
        onContextMenu={(e) => handleRowContextMenu(e, rootNode)}
        className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar"
      >
        <TreeNodeItem 
          node={rootNode} 
          depth={0} 
          onContextMenu={handleRowContextMenu}
          activeDrop={activeDrop}
          setActiveDrop={setActiveDrop}
        />
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
