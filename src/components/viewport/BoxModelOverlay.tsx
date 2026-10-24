import React from 'react';
import { ComputedMetrics } from '../../types/layout';

interface BoxModelOverlayProps {
  metrics: ComputedMetrics;
  canvasRect: DOMRect | null;
  zoom: number;
  isHovered?: boolean;
  onResizeStart?: (
    e: React.MouseEvent,
    handle: 'right' | 'bottom' | 'corner',
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
  if (!canvasRect || zoom <= 0) return null;

  const r = metrics.boundingRect;
  const m = metrics.margin;
  const p = metrics.padding;
  const b = metrics.border;

  // Normalized local canvas coordinates
  const relLeft = (r.left - canvasRect.left) / zoom;
  const relTop = (r.top - canvasRect.top) / zoom;
  const relWidth = r.width / zoom;
  const relHeight = r.height / zoom;

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

  const roundedW = Math.round(relWidth);
  const roundedH = Math.round(relHeight);

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
        {/* Interactive Resize Handles */}
        {!isHovered && onResizeStart && (
          <div className="pointer-events-auto">
            {/* Right edge handle */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'right', relWidth, relHeight)}
              title="Drag to resize Width"
              className="absolute top-0 -right-2 bottom-0 w-3 cursor-ew-resize flex items-center justify-center group"
            >
              <div className="w-1.5 h-4 bg-blue-500 border border-white rounded-xs shadow group-hover:scale-125 transition-transform" />
            </div>

            {/* Bottom edge handle */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'bottom', relWidth, relHeight)}
              title="Drag to resize Height"
              className="absolute -bottom-2 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group"
            >
              <div className="h-1.5 w-4 bg-blue-500 border border-white rounded-xs shadow group-hover:scale-125 transition-transform" />
            </div>

            {/* Bottom-right corner handle */}
            <div
              onMouseDown={(e) => onResizeStart(e, 'corner', relWidth, relHeight)}
              title="Drag to resize Width & Height"
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 cursor-nwse-resize bg-blue-600 hover:bg-blue-400 border-2 border-white rounded-xs shadow-md z-30 transition-transform hover:scale-125"
            />

            {/* Corner visual anchors */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-xs" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-xs" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-xs" />
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

      {/* ======================================================== */}
      {/* Sleek Minimalist Measurement Lines & Compact Badge       */}
      {/* ======================================================== */}
      {!isHovered && (
        <>
          {/* Top Width Caliper Line */}
          <div
            style={{
              left: `${borderRect.x}px`,
              top: `${borderRect.y - 14}px`,
              width: `${borderRect.width}px`,
            }}
            className="absolute flex items-center justify-between pointer-events-none"
          >
            <div className="h-2 w-[1px] bg-blue-400" />
            <div className="flex-1 h-[1px] bg-blue-400/80 mx-1 relative flex items-center justify-center">
              <span className="bg-[#18181b]/95 text-blue-300 text-[9px] font-bold px-1 rounded border border-blue-500/80 shadow leading-none">
                {roundedW}px
              </span>
            </div>
            <div className="h-2 w-[1px] bg-blue-400" />
          </div>

          {/* Right Height Caliper Line */}
          <div
            style={{
              left: `${borderRect.x + borderRect.width + 4}px`,
              top: `${borderRect.y}px`,
              height: `${borderRect.height}px`,
            }}
            className="absolute flex flex-col items-center justify-between pointer-events-none"
          >
            <div className="w-2 h-[1px] bg-blue-400" />
            <div className="flex-1 w-[1px] bg-blue-400/80 my-1 relative flex items-center justify-center">
              <span className="bg-[#18181b]/95 text-blue-300 text-[9px] font-bold px-1 rounded border border-blue-500/80 shadow leading-none whitespace-nowrap -rotate-90">
                {roundedH}px
              </span>
            </div>
            <div className="w-2 h-[1px] bg-blue-400" />
          </div>
        </>
      )}

      {/* Target Tag Compact Pill */}
      <div
        style={{
          left: `${borderRect.x}px`,
          top: `${Math.max(2, borderRect.y - 30)}px`,
        }}
        className="absolute flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#161619]/95 text-white border border-[#3f3f48] shadow-md text-[9px] whitespace-nowrap font-medium"
      >
        <span className="text-zinc-400 font-mono">#{metrics.id}</span>
        <span className="text-blue-300 font-bold">
          {roundedW} × {roundedH}
        </span>
        <span className="text-zinc-500 text-[8px] uppercase">
          {metrics.computedStyle.display}
        </span>
      </div>
    </div>
  );
};
