import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface InfiniteRulerProps {
  panOffset: { x: number; y: number };
  zoom: number;
  width: number;
  height: number;
  mousePos: { x: number; y: number } | null;
}

const getRulerColors = () => {
  if (typeof document === 'undefined') {
    return { bg: '#161619', border: '#2d2d35', tickMajor: '#6b7280', tickMinor: '#3f3f46', text: '#a1a1aa' };
  }
  const theme = document.documentElement.getAttribute('data-theme') || 'grey';
  if (theme === 'white') {
    return { bg: '#f1f5f9', border: '#e2e8f0', tickMajor: '#64748b', tickMinor: '#cbd5e1', text: '#334155' };
  }
  if (theme === 'amoled-black') {
    return { bg: '#000000', border: '#1f1f26', tickMajor: '#52525b', tickMinor: '#27272a', text: '#71717a' };
  }
  if (theme === 'custom') {
    const computed = getComputedStyle(document.documentElement);
    return {
      bg: computed.getPropertyValue('--theme-ruler-bg').trim() || '#161619',
      border: computed.getPropertyValue('--theme-border').trim() || '#2d2d35',
      tickMajor: computed.getPropertyValue('--theme-ruler-tick').trim() || '#6b7280',
      tickMinor: computed.getPropertyValue('--theme-ruler-subtick').trim() || '#3f3f46',
      text: computed.getPropertyValue('--theme-text-sub').trim() || '#a1a1aa',
    };
  }
  return { bg: '#161619', border: '#2d2d35', tickMajor: '#6b7280', tickMinor: '#3f3f46', text: '#a1a1aa' };
};

// Calculate adaptive LOD ruler tick intervals ensuring guaranteed pixel spacing between labels
const getRulerSteps = (zoom: number, minPixelDist: number = 75) => {
  const safeZoom = Math.max(0.01, zoom);
  const targetUnit = minPixelDist / safeZoom;
  const exp = Math.floor(Math.log10(targetUnit));
  const frac = targetUnit / Math.pow(10, exp);

  let mult = 1;
  if (frac <= 1.2) mult = 1;
  else if (frac <= 2.5) mult = 2;
  else if (frac <= 6) mult = 5;
  else mult = 10;

  const major = Math.max(1, mult * Math.pow(10, exp));
  const minor = Math.max(0.1, major / (mult === 2 ? 4 : 5));
  const sub = Math.max(0.1, minor / 2);

  return { major, minor, sub };
};

export const InfiniteRuler: React.FC<InfiniteRulerProps> = ({
  panOffset,
  zoom,
  width,
  height,
  mousePos,
}) => {
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const { preferences } = useEditorStore();
  const theme = preferences?.theme || 'grey';
  const colors = getRulerColors();

  const { major, minor, sub } = getRulerSteps(zoom, 75);

  // Render Top (Horizontal) Ruler
  useEffect(() => {
    const canvas = topCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(0, width - 20);
    const h = 20;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Bottom border
    ctx.fillStyle = colors.border;
    ctx.fillRect(0, h - 1, w, 1);

    // Visible canvas coordinate range
    const startMajorIndex = Math.floor((-panOffset.x) / (zoom * major)) - 1;
    const endMajorIndex = Math.ceil((w - panOffset.x) / (zoom * major)) + 1;

    ctx.font = '8.5px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Track text rendering to ensure ZERO overlapping text
    let lastLabelEnd = -Infinity;

    // Render major and minor ticks using integer step indices to prevent floating-point drift
    for (let mIdx = startMajorIndex; mIdx <= endMajorIndex; mIdx++) {
      const majorCoord = Math.round(mIdx * major);
      const majorScreenX = panOffset.x + majorCoord * zoom;

      // Draw Sub and Minor ticks between mIdx and mIdx + 1
      const ticksPerMajor = Math.round(major / minor);
      for (let t = 1; t < ticksPerMajor; t++) {
        const subCoord = majorCoord + t * minor;
        const subScreenX = panOffset.x + subCoord * zoom;
        if (subScreenX >= 0 && subScreenX <= w) {
          ctx.fillStyle = colors.tickMinor;
          ctx.fillRect(Math.round(subScreenX), 12, 1, 8);
        }
      }

      // Draw Major tick
      if (majorScreenX >= 0 && majorScreenX <= w) {
        ctx.fillStyle = colors.tickMajor;
        ctx.fillRect(Math.round(majorScreenX), 7, 1, 13);

        // Major Coordinate Label with strict collision prevention
        const label = `${majorCoord}`;
        const textWidth = ctx.measureText(label).width;

        if (majorScreenX >= lastLabelEnd + 8 && majorScreenX + textWidth <= w + 40) {
          ctx.fillStyle = majorCoord === 0 ? '#38bdf8' : colors.text;
          ctx.fillText(label, Math.round(majorScreenX) + 2, 2);
          lastLabelEnd = majorScreenX + textWidth;
        }
      }
    }

    // Mouse position indicator line
    if (mousePos && mousePos.x >= 20) {
      const mouseX = mousePos.x - 20;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mouseX, 0, 1, h);
    }
  }, [panOffset.x, zoom, width, mousePos, major, minor, sub, theme, colors.bg, colors.border, colors.tickMajor, colors.tickMinor, colors.text]);

  // Render Left (Vertical) Ruler
  useEffect(() => {
    const canvas = leftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 20;
    const h = Math.max(0, height - 20);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Right border
    ctx.fillStyle = colors.border;
    ctx.fillRect(w - 1, 0, 1, h);

    const startMajorIndex = Math.floor((-panOffset.y) / (zoom * major)) - 1;
    const endMajorIndex = Math.ceil((h - panOffset.y) / (zoom * major)) + 1;

    ctx.font = '8px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    for (let mIdx = startMajorIndex; mIdx <= endMajorIndex; mIdx++) {
      const majorCoord = Math.round(mIdx * major);
      const majorScreenY = panOffset.y + majorCoord * zoom;

      // Minor ticks
      const ticksPerMajor = Math.round(major / minor);
      for (let t = 1; t < ticksPerMajor; t++) {
        const subCoord = majorCoord + t * minor;
        const subScreenY = panOffset.y + subCoord * zoom;
        if (subScreenY >= 0 && subScreenY <= h) {
          ctx.fillStyle = colors.tickMinor;
          ctx.fillRect(12, Math.round(subScreenY), 8, 1);
        }
      }

      // Major tick
      if (majorScreenY >= 0 && majorScreenY <= h) {
        ctx.fillStyle = colors.tickMajor;
        ctx.fillRect(7, Math.round(majorScreenY), 13, 1);

        ctx.save();
        ctx.fillStyle = majorCoord === 0 ? '#38bdf8' : colors.text;
        ctx.fillText(`${majorCoord}`, 18, Math.round(majorScreenY) + 2);
        ctx.restore();
      }
    }

    // Mouse position indicator line
    if (mousePos && mousePos.y >= 20) {
      const mouseY = mousePos.y - 20;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, mouseY, w, 1);
    }
  }, [panOffset.y, zoom, height, mousePos, major, minor, sub, theme, colors.bg, colors.border, colors.tickMajor, colors.tickMinor, colors.text]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-mono text-[9px]">
      {/* Top-Left 20x20 Origin Corner */}
      <div 
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
        className="absolute top-0 left-0 w-5 h-5 border-r border-b flex items-center justify-center font-bold text-[8px] z-40 transition-colors"
      >
        px
      </div>

      {/* Top Horizontal Ruler */}
      <div className="absolute top-0 left-5 right-0 h-5">
        <canvas
          ref={topCanvasRef}
          style={{ width: `${Math.max(0, width - 20)}px`, height: '20px' }}
          className="block"
        />
      </div>

      {/* Left Vertical Ruler */}
      <div className="absolute top-5 left-0 bottom-0 w-5">
        <canvas
          ref={leftCanvasRef}
          style={{ width: '20px', height: `${Math.max(0, height - 20)}px` }}
          className="block"
        />
      </div>
    </div>
  );
};
