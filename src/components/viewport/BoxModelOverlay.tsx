import React from 'react';
import { ComputedMetrics } from '../../types/layout';

export type ResizeHandleDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface BoxModelOverlayProps {
  metrics: ComputedMetrics;
  canvasRect: DOMRect | null;
  zoom: number;
  isHovered?: boolean;
  onResizeStart?: (
    e: React.MouseEvent,
    handle: ResizeHandleDirection,
    currentWidth: number,
    currentHeight: number
  ) => void;
}

export const BoxModelOverlay: React.FC<BoxModelOverlayProps> = ({
  metrics,
  canvasRect,
  zoom,
  isHovered = false,
  onResizeStart,
}) => {
  if (!metrics || zoom <= 0) return null;

  const r = metrics.boundingRect;
  const m = metrics.margin;
  const p = metrics.padding;
  const b = metrics.border;

  // Normalized local canvas coordinates (invariant under panning, locks overlay smoothly)
  const local = metrics.localRect;
  const relLeft = local ? local.x : (canvasRect ? (r.left - canvasRect.left) / zoom : 0);
  const relTop = local ? local.y : (canvasRect ? (r.top - canvasRect.top) / zoom : 0);
  const relWidth = local ? local.width : (zoom > 0 ? r.width / zoom : r.width);
  const relHeight = local ? local.height : (zoom > 0 ? r.height / zoom : r.height);

  // Outer Margin bounds
  const marginRect = {
    x: relLeft - m.left,
    y: relTop - m.top,
    width: relWidth + m.left + m.right,
    height: relHeight + m.top + m.bottom,
  };

  // Border / Selection bounds
  const borderRect = {
    x: relLeft,
    y: relTop,
    width: relWidth,
    height: relHeight,
  };

  // Padding bounds
  const paddingRect = {
    x: relLeft + b.left,
    y: relTop + b.top,
    width: Math.max(0, relWidth - b.left - b.right),
    height: Math.max(0, relHeight - b.top - b.bottom),
  };


  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-visible font-mono">
      {/* 1. Margin Area (Subtle dashed orange boundary, 100% transparent interior) */}
      {(m.top > 0 || m.right > 0 || m.bottom > 0 || m.left > 0) && (
        <div
          style={{
            left: `${marginRect.x}px`,
            top: `${marginRect.y}px`,
            width: `${marginRect.width}px`,
            height: `${marginRect.height}px`,
          }}
          className="absolute border border-dashed border-amber-500/70 bg-amber-500/[0.03]"
        >
          {/* Margin tag */}
          <span className="absolute -top-3.5 left-1 text-[8px] text-amber-500 font-semibold bg-[#18181b]/90 px-1 rounded">
            margin
          </span>
        </div>
      )}

      {/* 2. Border Box & Active Selection Outline (Transparent interior) */}
      <div
        style={{
          left: `${borderRect.x}px`,
          top: `${borderRect.y}px`,
          width: `${borderRect.width}px`,
          height: `${borderRect.height}px`,
        }}
        className={`absolute bg-transparent transition-colors ${
          isHovered
            ? 'border-2 border-dashed border-cyan-400'
            : 'border-2 border-blue-500 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Interactive Resize Handles (All 8 Directions) */}
        {!isHovered && onResizeStart && (
          <div className="pointer-events-auto">
            {/* Top edge handle (N) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'n', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Height (Top)"
              className="absolute -top-1 left-3 right-3 h-2 cursor-ns-resize flex items-center justify-center group z-20"
            >
              <div className="h-0.5 w-5 bg-blue-500 border border-white/90 rounded-xs shadow-xs group-hover:scale-125 transition-transform" />
            </div>

            {/* Bottom edge handle (S) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 's', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Height (Bottom)"
              className="absolute -bottom-1 left-3 right-3 h-2 cursor-ns-resize flex items-center justify-center group z-20"
            >
              <div className="h-0.5 w-5 bg-blue-500 border border-white/90 rounded-xs shadow-xs group-hover:scale-125 transition-transform" />
            </div>

            {/* Left edge handle (W) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'w', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Width (Left)"
              className="absolute top-3 -left-1 bottom-3 w-2 cursor-ew-resize flex items-center justify-center group z-20"
            >
              <div className="w-0.5 h-5 bg-blue-500 border border-white/90 rounded-xs shadow-xs group-hover:scale-125 transition-transform" />
            </div>

            {/* Right edge handle (E) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'e', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Width (Right)"
              className="absolute top-3 -right-1 bottom-3 w-2 cursor-ew-resize flex items-center justify-center group z-20"
            >
              <div className="w-0.5 h-5 bg-blue-500 border border-white/90 rounded-xs shadow-xs group-hover:scale-125 transition-transform" />
            </div>

            {/* Top-Left Corner (NW) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'nw', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Top-Left"
              className="absolute -top-1 -left-1 w-2.5 h-2.5 cursor-nwse-resize bg-blue-500 hover:bg-blue-300 border border-white rounded-[1px] shadow-sm z-30 transition-transform hover:scale-125"
            />

            {/* Top-Right Corner (NE) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'ne', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Top-Right"
              className="absolute -top-1 -right-1 w-2.5 h-2.5 cursor-nesw-resize bg-blue-500 hover:bg-blue-300 border border-white rounded-[1px] shadow-sm z-30 transition-transform hover:scale-125"
            />

            {/* Bottom-Left Corner (SW) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'sw', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Bottom-Left"
              className="absolute -bottom-1 -left-1 w-2.5 h-2.5 cursor-nesw-resize bg-blue-500 hover:bg-blue-300 border border-white rounded-[1px] shadow-sm z-30 transition-transform hover:scale-125"
            />

            {/* Bottom-Right Corner (SE) */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'se', relWidth, relHeight)}
              onClick={(e) => e.stopPropagation()}
              title="Drag to resize Bottom-Right"
              className="absolute -bottom-1 -right-1 w-2.5 h-2.5 cursor-nwse-resize bg-blue-500 hover:bg-blue-300 border border-white rounded-[1px] shadow-sm z-30 transition-transform hover:scale-125"
            />
          </div>
        )}
      </div>

      {/* 3. Padding Area (Subtle dotted green boundary, 100% transparent interior) */}
      {(p.top > 0 || p.right > 0 || p.bottom > 0 || p.left > 0) && (
        <div
          style={{
            left: `${paddingRect.x}px`,
            top: `${paddingRect.y}px`,
            width: `${paddingRect.width}px`,
            height: `${paddingRect.height}px`,
          }}
          className="absolute border border-dotted border-emerald-500/70 bg-transparent"
        />
      )}
    </div>
  );
};
