import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { LayoutNode, ComputedMetrics, LayoutNodeType } from '../../types/layout';
import { nodeStyleToCss } from '../../core/layoutSerializer';
import { BoxModelOverlay } from './BoxModelOverlay';
import { InfiniteRuler } from './InfiniteRuler';

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
    actions,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const rootElementRef = useRef<HTMLElement | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Resize State for any selected element (including root)
  const [isResizingElement, setIsResizingElement] = useState(false);
  const [elementResizeHandle, setElementResizeHandle] = useState<'right' | 'bottom' | 'corner' | null>(null);
  const [startElementPos, setStartElementPos] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Drag & drop drop target
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

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
    if (e.button === 0) {
      actions.selectNode(null);
    }
  };

  // Start Resizing any Element (including Root)
  const handleElementResizeStart = (
    e: React.MouseEvent,
    handle: 'right' | 'bottom' | 'corner',
    curW: number,
    curH: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingElement(true);
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

        const isRoot = selectedNodeId === rootNode.id;
        const newW = Math.max(isRoot ? 200 : 16, Math.round(startElementPos.w + deltaX));
        const newH = Math.max(isRoot ? 150 : 16, Math.round(startElementPos.h + deltaY));

        const updates: any = {};
        if (elementResizeHandle === 'right' || elementResizeHandle === 'corner') {
          updates.width = `${newW}px`;
        }
        if (elementResizeHandle === 'bottom' || elementResizeHandle === 'corner') {
          updates.height = `${newH}px`;
        }

        if (isRoot) {
          actions.setScreenSize(
            elementResizeHandle === 'bottom' ? startElementPos.w : newW,
            elementResizeHandle === 'right' ? startElementPos.h : newH
          );
        } else {
          actions.updateNodeStyle(selectedNodeId, updates);
        }
      }
    };

    const handleWindowMouseUp = () => {
      setIsPanning(false);
      setIsResizingElement(false);
      setElementResizeHandle(null);
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const extractDraggedWidget = (e: React.DragEvent): { widgetType: LayoutNodeType | null; widgetLabel?: string } => {
    let widgetType: LayoutNodeType | null = null;
    let widgetLabel: string | undefined;

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

  const handleNodeDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (dropTargetId !== nodeId) setDropTargetId(nodeId);
  };

  const handleNodeDragLeave = (e: React.DragEvent, nodeId: string) => {
    e.stopPropagation();
    if (dropTargetId === nodeId) setDropTargetId(null);
  };

  const handleNodeDrop = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);

    const { widgetType, widgetLabel } = extractDraggedWidget(e);
    const draggedTreeId = e.dataTransfer.getData('draggedNodeId');

    if (widgetType) {
      actions.addNode(targetNodeId, widgetType, widgetLabel);
    } else if (draggedTreeId && draggedTreeId !== targetNodeId) {
      actions.reparentNode(draggedTreeId, targetNodeId);
    }
  };

  // Render a LayoutNode into actual interactive DOM
  const renderNode = (node: LayoutNode) => {
    if (node.isHidden) return null;

    const isHovered = hoveredNodeId === node.id;
    const isDropTarget = dropTargetId === node.id;
    const cssStyle = nodeStyleToCss(node.style);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      actions.selectNode(node.id);
    };

    // Note: Do NOT add duplicate outline here; BoxModelOverlay renders the unified selection outline!
    const commonProps = {
      id: `node-dom-${node.id}`,
      onClick: handleClick,
      onDragOver: (e: React.DragEvent) => handleNodeDragOver(e, node.id),
      onDragLeave: (e: React.DragEvent) => handleNodeDragLeave(e, node.id),
      onDrop: (e: React.DragEvent) => handleNodeDrop(e, node.id),
      style: cssStyle,
      className: `relative transition-[box-shadow] duration-75 cursor-pointer ${
        isDropTarget
          ? 'ring-2 ring-emerald-400 bg-emerald-500/10'
          : isHovered
          ? 'ring-1 ring-cyan-400/50'
          : ''
      }`,
    };

    if (node.type === 'button') {
      return (
        <button key={node.id} {...commonProps}>
          {node.textContent || 'Button'}
        </button>
      );
    }

    if (node.type === 'text') {
      return (
        <p key={node.id} {...commonProps} className={`${commonProps.className} m-0`}>
          {node.textContent || ''}
        </p>
      );
    }

    return (
      <div key={node.id} {...commonProps}>
        {isDropTarget && (
          <div className="absolute top-1 right-1 z-30 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow pointer-events-none">
            + Drop here
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
      onContextMenu={handleContextMenu}
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
    </div>
  );
};
