import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { LayoutNode, ComputedMetrics, LayoutNodeType, isContainerNodeType } from '../../types/layout';
import { nodeStyleToCss } from '../../core/layoutSerializer';
import { BoxModelOverlay, ResizeHandleDirection } from './BoxModelOverlay';
import { InfiniteRuler } from './InfiniteRuler';
import { ContextMenu } from '../common/ContextMenu';

export const Viewport: React.FC = () => {
  const {
    rootNode,
    selectedNodeId,
    hoveredNodeId,
    zoom,
    scrollSensitivity,
    panOffset,
    screenWidth,
    screenHeight,
    devicePreset,
    showOverlays,
    showRulers,
    metricsMap,
    scriptError,
    actions,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const rootElementRef = useRef<HTMLElement | null>(null);
  const wasInteractingRef = useRef(false);

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: LayoutNode } | null>(null);

  // Resize State for any selected element (including root)
  const [isResizingElement, setIsResizingElement] = useState(false);
  const [elementResizeHandle, setElementResizeHandle] = useState<ResizeHandleDirection | null>(null);
  const [startElementPos, setStartElementPos] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Drag & drop drop target (id and position)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);

  const parsePx = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Batched measurement of all rendered elements
  const measureAllNodes = useCallback(() => {
    const elements = document.querySelectorAll('[id^="node-dom-"]');
    if (!elements || elements.length === 0) return;

    const batch: Record<string, ComputedMetrics> = {};

    elements.forEach((node) => {
      const el = node as HTMLElement;
      const nodeId = el.id.replace('node-dom-', '');
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      const mTop = parsePx(style.marginTop);
      const mRight = parsePx(style.marginRight);
      const mBottom = parsePx(style.marginBottom);
      const mLeft = parsePx(style.marginLeft);

      const pTop = parsePx(style.paddingTop);
      const pRight = parsePx(style.paddingRight);
      const pBottom = parsePx(style.paddingBottom);
      const pLeft = parsePx(style.paddingLeft);

      const bTop = parsePx(style.borderTopWidth);
      const bRight = parsePx(style.borderRightWidth);
      const bBottom = parsePx(style.borderBottomWidth);
      const bLeft = parsePx(style.borderLeftWidth);

      const contentWidth = Math.max(0, rect.width - (bLeft + bRight) - (pLeft + pRight));
      const contentHeight = Math.max(0, rect.height - (bTop + bBottom) - (pTop + pBottom));

      batch[nodeId] = {
        id: nodeId,
        tagName: el.tagName.toLowerCase(),
        boundingRect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        },
        contentBox: {
          width: contentWidth,
          height: contentHeight,
        },
        margin: { top: mTop, right: mRight, bottom: mBottom, left: mLeft },
        padding: { top: pTop, right: pRight, bottom: pBottom, left: pLeft },
        border: { top: bTop, right: bRight, bottom: bBottom, left: bLeft },
        scroll: {
          scrollWidth: el.scrollWidth,
          scrollHeight: el.scrollHeight,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight,
          offsetWidth: el.offsetWidth,
          offsetHeight: el.offsetHeight,
        },
        computedStyle: {
          display: style.display,
          position: style.position,
          boxSizing: style.boxSizing,
          width: style.width,
          height: style.height,
          flexDirection: style.flexDirection,
          justifyContent: style.justifyContent,
          alignItems: style.alignItems,
          flexGrow: style.flexGrow,
          flexShrink: style.flexShrink,
          flexBasis: style.flexBasis,
          gridTemplateColumns: style.gridTemplateColumns,
          gridTemplateRows: style.gridTemplateRows,
        },
      };
    });

    if (Object.keys(batch).length > 0) {
      actions.registerMetricsBatch(batch);
    }
  }, [actions]);

  // Track container size for infinite rulers
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const updateRootBounds = useCallback(() => {
    const rootEl = document.getElementById(`node-dom-${rootNode.id}`);
    if (rootEl) {
      rootElementRef.current = rootEl;
      setCanvasRect(rootEl.getBoundingClientRect());
    }
  }, [rootNode.id]);

  useEffect(() => {
    updateRootBounds();
    const frameId = requestAnimationFrame(() => {
      measureAllNodes();
    });
    return () => cancelAnimationFrame(frameId);
  }, [selectedNodeId, rootNode, zoom, panOffset, screenWidth, screenHeight, measureAllNodes, updateRootBounds]);

  // Zoom centered on cursor location (Figma / CAD style) with normalized scrolling sensitivity
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const sensitivity = scrollSensitivity || 1.0;
    // Normalize delta: trackpad small deltas (1-10) vs mouse wheel steps (100)
    const rawDelta = -e.deltaY;
    const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 100);
    const zoomDelta = (clampedDelta / 100) * 0.08 * sensitivity;

    const newZoom = Math.min(Math.max(zoom + zoomDelta, 0.15), 5.0);

    // Coordinate on canvas under mouse before zoom
    const canvasX = (mouseX - panOffset.x) / zoom;
    const canvasY = (mouseY - panOffset.y) / zoom;

    // Adjust pan offset so point under mouse stays in place
    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    actions.setZoom(newZoom);
    actions.setPanOffset({ x: newPanX, y: newPanY });
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || e.target === containerRef.current) {
      e.preventDefault();
      setIsPanning(true);
      wasInteractingRef.current = true;
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  // Deselect when clicking empty viewport/canvas background
  const handleContainerClick = (e: React.MouseEvent) => {
    if (wasInteractingRef.current) {
      wasInteractingRef.current = false;
      return;
    }
    if (e.button === 0) {
      actions.selectNode(null);
    }
  };

  // Start Resizing any Element (including Root)
  const handleElementResizeStart = (
    e: React.MouseEvent,
    handle: ResizeHandleDirection,
    curW: number,
    curH: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingElement(true);
    wasInteractingRef.current = true;
    setElementResizeHandle(handle);
    setStartElementPos({
      x: e.clientX,
      y: e.clientY,
      w: curW,
      h: curH,
    });
  };

  // Global mousemove and mouseup listeners
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        actions.setPanOffset({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        });
      } else if (isResizingElement && elementResizeHandle && selectedNodeId) {
        const deltaX = (e.clientX - startElementPos.x) / zoom;
        const deltaY = (e.clientY - startElementPos.y) / zoom;

        let newW = startElementPos.w;
        let newH = startElementPos.h;

        // X-axis adjustments
        if (elementResizeHandle === 'e' || elementResizeHandle === 'se' || elementResizeHandle === 'ne') {
          newW = Math.round(startElementPos.w + deltaX);
        } else if (elementResizeHandle === 'w' || elementResizeHandle === 'sw' || elementResizeHandle === 'nw') {
          newW = Math.round(startElementPos.w - deltaX);
        }

        // Y-axis adjustments
        if (elementResizeHandle === 's' || elementResizeHandle === 'se' || elementResizeHandle === 'sw') {
          newH = Math.round(startElementPos.h + deltaY);
        } else if (elementResizeHandle === 'n' || elementResizeHandle === 'ne' || elementResizeHandle === 'nw') {
          newH = Math.round(startElementPos.h - deltaY);
        }

        const isRoot = selectedNodeId === rootNode.id;
        newW = Math.max(isRoot ? 200 : 16, newW);
        newH = Math.max(isRoot ? 150 : 16, newH);

        const updates: any = {};
        if (['e', 'w', 'se', 'sw', 'ne', 'nw'].includes(elementResizeHandle)) {
          updates.width = `${newW}px`;
          updates.flexBasis = `${newW}px`;
        }
        if (['s', 'n', 'se', 'sw', 'ne', 'nw'].includes(elementResizeHandle)) {
          updates.height = `${newH}px`;
        }

        if (isRoot) {
          actions.setScreenSize(newW, newH);
        } else {
          actions.updateNodeStyle(selectedNodeId, updates);
        }
      }
    };

    const handleWindowMouseUp = () => {
      if (isPanning || isResizingElement) {
        setIsPanning(false);
        setIsResizingElement(false);
        setElementResizeHandle(null);
        setTimeout(() => {
          wasInteractingRef.current = false;
        }, 120);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    isPanning,
    startPan,
    isResizingElement,
    elementResizeHandle,
    startElementPos,
    selectedNodeId,
    rootNode.id,
    zoom,
    actions,
  ]);

  const handleNodeContextMenu = (e: React.MouseEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    actions.selectNode(node.id);
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleContainerContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    actions.selectNode(rootNode.id);
    setContextMenu({ x: e.clientX, y: e.clientY, node: rootNode });
  };

  const extractDraggedWidget = (e: React.DragEvent): { widgetType: LayoutNodeType | null; widgetLabel?: string } => {
    let widgetType: LayoutNodeType | null = null;
    let widgetLabel: string | undefined;

    if ((window as any).__draggedPaletteWidget) {
      widgetType = (window as any).__draggedPaletteWidget.type;
      widgetLabel = (window as any).__draggedPaletteWidget.label;
      return { widgetType, widgetLabel };
    }

    const raw = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.widgetType) {
          widgetType = parsed.widgetType;
          widgetLabel = parsed.widgetLabel;
        }
      } catch {
        // Fallback
      }
    }

    if (!widgetType) {
      widgetType = (e.dataTransfer.getData('widgetType') as LayoutNodeType) || null;
      widgetLabel = e.dataTransfer.getData('widgetLabel');
    }

    return { widgetType, widgetLabel };
  };

  const handleNodeDragOver = (e: React.DragEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    const isRoot = node.id === rootNode.id;
    if (isRoot) {
      setDropTarget({ id: node.id, position: 'inside' });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isContainer = isContainerNodeType(node.type);
    const relY = e.clientY - rect.top;
    const relX = e.clientX - rect.left;
    const isWide = rect.width > rect.height * 1.5;

    let position: 'before' | 'after' | 'inside';

    if (isContainer) {
      if (isWide) {
        if (relX < rect.width * 0.25) position = 'before';
        else if (relX > rect.width * 0.75) position = 'after';
        else position = 'inside';
      } else {
        if (relY < rect.height * 0.25) position = 'before';
        else if (relY > rect.height * 0.75) position = 'after';
        else position = 'inside';
      }
    } else {
      // Leaf element cannot receive children; drop before or after
      if (isWide) {
        position = relX < rect.width * 0.5 ? 'before' : 'after';
      } else {
        position = relY < rect.height * 0.5 ? 'before' : 'after';
      }
    }

    setDropTarget({ id: node.id, position });
  };

  const handleNodeDragLeave = (e: React.DragEvent, nodeId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      if (dropTarget?.id === nodeId) {
        setDropTarget(null);
      }
    }
  };

  const handleNodeDrop = (e: React.DragEvent, targetNode: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();

    const currentDrop = dropTarget;
    setDropTarget(null);

    const { widgetType, widgetLabel } = extractDraggedWidget(e);
    const draggedTreeId = e.dataTransfer.getData('draggedNodeId');
    (window as any).__draggedPaletteWidget = null;

    const pos = currentDrop?.id === targetNode.id ? currentDrop.position : 'inside';

    if (widgetType) {
      if ((pos === 'before' || pos === 'after') && targetNode.id !== rootNode.id) {
        actions.addNodeAround(targetNode.id, widgetType, widgetLabel, pos);
      } else {
        actions.addNode(targetNode.id, widgetType, widgetLabel);
      }
      return;
    }

    if (draggedTreeId && draggedTreeId !== targetNode.id) {
      if ((pos === 'before' || pos === 'after') && targetNode.id !== rootNode.id) {
        actions.reparentNodeAround(draggedTreeId, targetNode.id, pos);
      } else {
        actions.reparentNode(draggedTreeId, targetNode.id);
      }
    }
  };

  // Render a LayoutNode into actual interactive DOM
  const renderNode = (node: LayoutNode) => {
    if (node.isHidden) return null;

    const isHovered = hoveredNodeId === node.id;
    const isTarget = dropTarget?.id === node.id;
    const isInsideDrop = isTarget && dropTarget.position === 'inside';
    const isBeforeDrop = isTarget && dropTarget.position === 'before';
    const isAfterDrop = isTarget && dropTarget.position === 'after';

    const cssStyle = nodeStyleToCss(node.style);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      actions.selectNode(node.id);
    };

    const renderDropLines = () => (
      <>
        {isBeforeDrop && (
          <div className="absolute -top-1 left-0 right-0 h-1 bg-emerald-400 rounded-full z-40 pointer-events-none shadow-[0_0_8px_#34d399]" />
        )}
        {isAfterDrop && (
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-400 rounded-full z-40 pointer-events-none shadow-[0_0_8px_#34d399]" />
        )}
      </>
    );

    // Note: Do NOT add duplicate outline here; BoxModelOverlay renders the unified selection outline!
    const commonProps = {
      id: `node-dom-${node.id}`,
      onClick: handleClick,
      onContextMenu: (e: React.MouseEvent) => handleNodeContextMenu(e, node),
      onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, node),
      onDragLeave: (e: React.DragEvent) => handleNodeDragLeave(e, node.id),
      onDrop: (e: React.DragEvent) => handleNodeDrop(e, node),
      style: cssStyle,
      className: `relative transition-[box-shadow] duration-75 cursor-pointer ${
        isInsideDrop
          ? 'ring-2 ring-emerald-400 bg-emerald-500/10'
          : isHovered
          ? 'ring-1 ring-cyan-400/50'
          : ''
      }`,
    };

    if (node.type === 'button') {
      return (
        <button key={node.id} {...commonProps}>
          {renderDropLines()}
          {node.textContent || 'Button'}
        </button>
      );
    }

    if (node.type === 'text') {
      return (
        <p key={node.id} {...commonProps} className={`${commonProps.className} m-0`}>
          {renderDropLines()}
          {node.textContent || ''}
        </p>
      );
    }

    if (node.type === 'heading') {
      return (
        <h3 key={node.id} {...commonProps} className={`${commonProps.className} m-0 font-bold`}>
          {renderDropLines()}
          {node.textContent || 'Heading'}
        </h3>
      );
    }

    if (node.type === 'input') {
      return (
        <div key={node.id} className="relative inline-block">
          {renderDropLines()}
          <input
            {...commonProps}
            readOnly
            value={node.textContent || ''}
            placeholder={node.placeholder || 'Enter text...'}
            className={`${commonProps.className} outline-none cursor-pointer`}
          />
        </div>
      );
    }

    if (node.type === 'badge') {
      return (
        <span key={node.id} {...commonProps} className={`${commonProps.className} select-none`}>
          {renderDropLines()}
          {node.textContent || 'Badge'}
        </span>
      );
    }

    if (node.type === 'divider') {
      return (
        <div key={node.id} {...commonProps}>
          {renderDropLines()}
        </div>
      );
    }

    if (node.type === 'image') {
      return (
        <div key={node.id} {...commonProps} className={`${commonProps.className} overflow-hidden flex items-center justify-center`}>
          {renderDropLines()}
          {node.src ? (
            <img src={node.src} alt={node.alt || ''} className="w-full h-full object-cover pointer-events-none" />
          ) : (
            <div className="text-[10px] text-zinc-500 font-mono select-none">Image Box</div>
          )}
        </div>
      );
    }

    return (
      <div key={node.id} {...commonProps}>
        {renderDropLines()}
        {isInsideDrop && (
          <div className="absolute top-1 right-1 z-30 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow pointer-events-none">
            + Drop inside
          </div>
        )}
        {node.children.map(renderNode)}
      </div>
    );
  };

  const selectedMetrics = selectedNodeId ? metricsMap[selectedNodeId] : null;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={handleContainerContextMenu}
      className="relative flex-1 h-full w-full overflow-hidden bg-[#121214] select-none cursor-default"
      style={{
        backgroundImage: `
          radial-gradient(circle, #25252d 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Infinite 2D Rulers (X-Axis & Y-Axis) */}
      {showRulers && (
        <InfiniteRuler
          panOffset={panOffset}
          zoom={zoom}
          width={containerSize.width}
          height={containerSize.height}
          mousePos={mousePos}
        />
      )}

      {/* GPU-Accelerated Transform Stage */}
      <div
        style={{
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        className="absolute pointer-events-auto"
      >
        {/* Top Screen Canvas Dimension Badge */}
        <div className="absolute -top-7 left-0 flex items-center gap-2 text-[10px] font-mono text-zinc-400 select-none pointer-events-none">
          <span className="font-semibold text-zinc-200 bg-[#222228] px-2 py-0.5 rounded border border-[#33333d]">
            Root Canvas
          </span>
          <span className="text-blue-400 font-bold">
            {screenWidth} × {screenHeight} px
          </span>
          <span className="text-zinc-500 font-normal">
            [{devicePreset.name}]
          </span>
        </div>

        {/* The Root Node is its OWN top-level container (No artificial wrapper box!) */}
        <div className="relative overflow-visible">
          {renderNode(rootNode)}

          {/* Unified Selection Box & DevTools Calipers Overlay */}
          {showOverlays && selectedMetrics && canvasRect && (
            <BoxModelOverlay
              metrics={selectedMetrics}
              canvasRect={canvasRect}
              zoom={zoom}
              isHovered={false}
              onResizeStart={handleElementResizeStart}
            />
          )}
        </div>
      </div>

      {/* Non-intrusive Script Syntax Warning in Viewport */}
      {scriptError && (
        <div className="absolute top-8 right-4 z-40 bg-amber-950/90 text-amber-300 border border-amber-800/80 rounded px-2.5 py-1.5 shadow-xl text-xs backdrop-blur flex items-center gap-2 max-w-sm pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-mono text-[11px] truncate">Script error: {scriptError} (Canvas sync paused)</span>
        </div>
      )}

      {/* Right Click Context Menu */}
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
