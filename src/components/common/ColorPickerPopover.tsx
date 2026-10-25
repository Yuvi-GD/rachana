import React, { useState, useRef, useCallback } from 'react';
import { Pipette, X, RotateCcw } from 'lucide-react';

interface ColorPickerPopoverProps {
  color: string; // Hex, rgba, or rgb string
  onChange: (newColor: string) => void;
  onClose?: () => void;
  label?: string;
}

// Convert Hex or RGBA string to RGBA object
function parseColorToRgba(str: string): { r: number; g: number; b: number; a: number } {
  const s = (str || '').trim().toLowerCase();
  if (s === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbMatch = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  // Hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: parseInt(hex[3] + hex[3], 16) / 255,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: parseInt(hex.substring(6, 8), 16) / 255,
      };
    }
  }

  // Default fallback
  return { r: 59, g: 130, b: 246, a: 1 };
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let rNorm = 0;
  let gNorm = 0;
  let bNorm = 0;

  if (h >= 0 && h < 60) {
    rNorm = c; gNorm = x; bNorm = 0;
  } else if (h >= 60 && h < 120) {
    rNorm = x; gNorm = c; bNorm = 0;
  } else if (h >= 120 && h < 180) {
    rNorm = 0; gNorm = c; bNorm = x;
  } else if (h >= 180 && h < 240) {
    rNorm = 0; gNorm = x; bNorm = c;
  } else if (h >= 240 && h < 300) {
    rNorm = x; gNorm = 0; bNorm = c;
  } else {
    rNorm = c; gNorm = 0; bNorm = x;
  }

  return {
    r: Math.round((rNorm + m) * 255),
    g: Math.round((gNorm + m) * 255),
    b: Math.round((bNorm + m) * 255),
  };
}

// Convert RGBA to HEX string
function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hexRgb = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    const alphaHex = toHex(Math.round(a * 255));
    return `${hexRgb}${alphaHex}`;
  }
  return hexRgb;
}

const PRESET_SWATCHES = [
  'transparent',
  '#000000',
  '#18181b',
  '#27272a',
  '#3f3f46',
  '#71717a',
  '#a1a1aa',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
];

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  color,
  onChange,
  onClose,
  label = 'Color Picker',
}) => {
  const initialRgba = useRef(parseColorToRgba(color));
  const [initialColorStr] = useState<string>(color);

  // Core state: HSV + Alpha
  const [hsv, setHsv] = useState(() => {
    const rgba = parseColorToRgba(color);
    return rgbToHsv(rgba.r, rgba.g, rgba.b);
  });
  const [alpha, setAlpha] = useState<number>(() => {
    const rgba = parseColorToRgba(color);
    return rgba.a;
  });

  // Color mode: 'rgb' | 'hsv'
  const [colorMode, setColorMode] = useState<'rgb' | 'hsv'>('rgb');

  const satValBoxRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);

  // Current RGB computed from HSV
  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbaToHex(currentRgb.r, currentRgb.g, currentRgb.b, alpha);

  // Notify parent on change
  const notifyChange = useCallback((newHsv: { h: number; s: number; v: number }, newAlpha: number) => {
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = rgbaToHex(rgb.r, rgb.g, rgb.b, newAlpha);
    onChange(hex);
  }, [onChange]);

  // Handle Saturation / Value 2D Box Dragging
  const handleSatValMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!satValBoxRef.current) return;
    const rect = satValBoxRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    setHsv((prev) => {
      const next = { ...prev, s, v };
      notifyChange(next, alpha);
      return next;
    });
  }, [alpha, notifyChange]);

  const handleSatValMouseDown = (e: React.MouseEvent) => {
    isDraggingSatVal.current = true;
    handleSatValMove(e);

    const onMouseMove = (ev: MouseEvent) => {
      if (isDraggingSatVal.current) {
        handleSatValMove(ev);
      }
    };
    const onMouseUp = () => {
      isDraggingSatVal.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Direct RGB component updates (from sliders or inputs)
  const updateRgbChannel = (channel: 'r' | 'g' | 'b', val: number) => {
    const nextRgb = { ...currentRgb, [channel]: Math.max(0, Math.min(255, Math.round(val))) };
    const nextHsv = rgbToHsv(nextRgb.r, nextRgb.g, nextRgb.b);
    setHsv(nextHsv);
    notifyChange(nextHsv, alpha);
  };

  // EyeDropper API (Chromium native)
  const handlePickScreenColor = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const rgba = parseColorToRgba(result.sRGBHex);
          const nextHsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
          setHsv(nextHsv);
          setAlpha(1);
          notifyChange(nextHsv, 1);
        }
      } catch {
        // Cancelled
      }
    }
  };

  // Revert to Initial Color
  const handleRevert = () => {
    const rgba = initialRgba.current;
    const nextHsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    setHsv(nextHsv);
    setAlpha(rgba.a);
    notifyChange(nextHsv, rgba.a);
  };

  // Set swatch
  const handleSelectSwatch = (swatch: string) => {
    if (swatch === 'transparent') {
      onChange('transparent');
      setAlpha(0);
      return;
    }
    const rgba = parseColorToRgba(swatch);
    const nextHsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    setHsv(nextHsv);
    setAlpha(rgba.a);
    notifyChange(nextHsv, rgba.a);
  };

  // Base hue color in full saturation and value
  const baseHueRgb = hsvToRgb(hsv.h, 100, 100);

  return (
    <div className="w-[268px] max-h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar bg-[#1a1a1e] border border-[#373742] rounded-lg shadow-2xl p-3 select-none text-zinc-300 font-sans z-50 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#282830]">
        <span className="font-bold text-[11px] text-zinc-200 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1">
          {/* Native EyeDropper Tool */}
          {'EyeDropper' in window && (
            <button
              type="button"
              onClick={handlePickScreenColor}
              title="Pick color from screen"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#282832] transition-colors"
            >
              <Pipette className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#282832] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2D Saturation / Value Gradient Box */}
      <div
        ref={satValBoxRef}
        onMouseDown={handleSatValMouseDown}
        style={{
          backgroundColor: `rgb(${baseHueRgb.r}, ${baseHueRgb.g}, ${baseHueRgb.b})`,
        }}
        className="relative w-full h-28 rounded cursor-crosshair overflow-hidden shadow-inner mb-2.5"
      >
        {/* Saturation Gradient (white to transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        {/* Value/Brightness Gradient (transparent to black) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        {/* Pointer Thumb */}
        <div
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
          }}
          className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        />
      </div>

      {/* Hue Rainbow Slider */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-zinc-400 font-mono w-3.5">H</span>
        <input
          type="range"
          min="0"
          max="360"
          value={hsv.h}
          onChange={(e) => {
            const h = parseInt(e.target.value, 10);
            const next = { ...hsv, h };
            setHsv(next);
            notifyChange(next, alpha);
          }}
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
          className="flex-1 h-2.5 rounded appearance-none cursor-pointer outline-none"
        />
        <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">{hsv.h}°</span>
      </div>

      {/* Alpha / Opacity Slider */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] text-zinc-400 font-mono w-3.5">A</span>
        <div
          className="flex-1 h-2.5 rounded relative overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(45deg, #2b2b33 25%, transparent 25%), linear-gradient(-45deg, #2b2b33 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2b2b33 75%), linear-gradient(-45deg, transparent 75%, #2b2b33 75%)',
            backgroundSize: '8px 8px',
            backgroundColor: '#1a1a20',
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={alpha}
            onChange={(e) => {
              const a = parseFloat(e.target.value);
              setAlpha(a);
              notifyChange(hsv, a);
            }}
            style={{
              background: `linear-gradient(to right, transparent, rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}))`,
            }}
            className="absolute inset-0 w-full h-full appearance-none cursor-pointer outline-none bg-transparent"
          />
        </div>
        <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
          {Math.round(alpha * 100)}%
        </span>
      </div>

      {/* Comparison: Previous (Initial) vs Current (New) Color */}
      <div className="flex items-center justify-between p-1.5 bg-[#121215] rounded border border-[#2b2b32] mb-2.5">
        <div className="flex items-center gap-2">
          {/* Previous Color Swatch */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-zinc-500 uppercase font-semibold mb-0.5">Original</span>
            <button
              type="button"
              onClick={handleRevert}
              title="Click to revert to original color"
              style={{
                backgroundColor: initialColorStr === 'transparent' ? 'transparent' : initialColorStr,
              }}
              className="w-7 h-5 rounded border border-[#444] relative hover:scale-105 transition-transform"
            >
              {initialColorStr === 'transparent' && (
                <span className="absolute inset-0 text-[10px] text-red-500 flex items-center justify-center font-bold">
                  ×
                </span>
              )}
            </button>
          </div>

          {/* Current New Color Swatch */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-zinc-400 uppercase font-semibold mb-0.5">New</span>
            <div
              style={{
                backgroundColor: currentHex,
              }}
              className="w-7 h-5 rounded border border-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleRevert}
          title="Reset to initial color"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#202026] hover:bg-[#282830] text-zinc-400 hover:text-white border border-[#33333d] text-[10px] font-semibold transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Hex & Mode Switch */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">HEX:</span>
          <input
            type="text"
            value={currentHex}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('#') && (val.length === 7 || val.length === 9)) {
                const rgba = parseColorToRgba(val);
                const next = rgbToHsv(rgba.r, rgba.g, rgba.b);
                setHsv(next);
                setAlpha(rgba.a);
                notifyChange(next, rgba.a);
              }
            }}
            className="w-full bg-[#121215] border border-[#2e2e38] rounded px-1.5 py-0.5 font-mono text-[10px] text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center bg-[#121215] rounded p-0.5 border border-[#2e2e38] flex-shrink-0">
          <button
            type="button"
            onClick={() => setColorMode('rgb')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
              colorMode === 'rgb' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            RGB
          </button>
          <button
            type="button"
            onClick={() => setColorMode('hsv')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
              colorMode === 'hsv' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HSV
          </button>
        </div>
      </div>

      {/* RGB Sliders & Numbers (0 to 255 with color gradients) */}
      {colorMode === 'rgb' ? (
        <div className="space-y-1.5 mb-2.5 bg-[#141417] p-2 rounded border border-[#272730]">
          {/* Red Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-red-400 w-3">R</span>
            <input
              type="range"
              min="0"
              max="255"
              value={currentRgb.r}
              onChange={(e) => updateRgbChannel('r', parseInt(e.target.value, 10))}
              style={{
                background: `linear-gradient(to right, rgb(0, ${currentRgb.g}, ${currentRgb.b}), rgb(255, ${currentRgb.g}, ${currentRgb.b}))`,
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={currentRgb.r}
              onChange={(e) => updateRgbChannel('r', parseInt(e.target.value, 10) || 0)}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>

          {/* Green Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 w-3">G</span>
            <input
              type="range"
              min="0"
              max="255"
              value={currentRgb.g}
              onChange={(e) => updateRgbChannel('g', parseInt(e.target.value, 10))}
              style={{
                background: `linear-gradient(to right, rgb(${currentRgb.r}, 0, ${currentRgb.b}), rgb(${currentRgb.r}, 255, ${currentRgb.b}))`,
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={currentRgb.g}
              onChange={(e) => updateRgbChannel('g', parseInt(e.target.value, 10) || 0)}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>

          {/* Blue Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 w-3">B</span>
            <input
              type="range"
              min="0"
              max="255"
              value={currentRgb.b}
              onChange={(e) => updateRgbChannel('b', parseInt(e.target.value, 10))}
              style={{
                background: `linear-gradient(to right, rgb(${currentRgb.r}, ${currentRgb.g}, 0), rgb(${currentRgb.r}, ${currentRgb.g}, 255))`,
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={currentRgb.b}
              onChange={(e) => updateRgbChannel('b', parseInt(e.target.value, 10) || 0)}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 mb-2.5 bg-[#141417] p-2 rounded border border-[#272730]">
          {/* Hue Numeric & Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 w-3">H</span>
            <input
              type="range"
              min="0"
              max="360"
              value={hsv.h}
              onChange={(e) => {
                const next = { ...hsv, h: parseInt(e.target.value, 10) };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none bg-zinc-700"
            />
            <input
              type="number"
              min="0"
              max="360"
              value={hsv.h}
              onChange={(e) => {
                const next = { ...hsv, h: parseInt(e.target.value, 10) || 0 };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>

          {/* Saturation */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 w-3">S</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsv.s}
              onChange={(e) => {
                const next = { ...hsv, s: parseInt(e.target.value, 10) };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none bg-zinc-700"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={hsv.s}
              onChange={(e) => {
                const next = { ...hsv, s: parseInt(e.target.value, 10) || 0 };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>

          {/* Value / Brightness */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 w-3">V</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsv.v}
              onChange={(e) => {
                const next = { ...hsv, v: parseInt(e.target.value, 10) };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="flex-1 h-2 rounded appearance-none cursor-pointer outline-none bg-zinc-700"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={hsv.v}
              onChange={(e) => {
                const next = { ...hsv, v: parseInt(e.target.value, 10) || 0 };
                setHsv(next);
                notifyChange(next, alpha);
              }}
              className="w-10 bg-[#121215] border border-[#2e2e38] rounded px-1 py-0.5 font-mono text-[10px] text-zinc-200 outline-none text-center"
            />
          </div>
        </div>
      )}

      {/* Preset Swatches Palette */}
      <div>
        <label className="text-[8px] text-zinc-500 uppercase font-semibold block mb-1">
          Preset Swatches
        </label>
        <div className="grid grid-cols-10 gap-1 p-1 bg-[#121215] rounded border border-[#272730]">
          {PRESET_SWATCHES.map((swatch) => (
            <button
              type="button"
              key={swatch}
              onClick={() => handleSelectSwatch(swatch)}
              title={swatch}
              style={{
                backgroundColor: swatch === 'transparent' ? 'transparent' : swatch,
              }}
              className={`w-4 h-4 rounded-xs border transition-transform hover:scale-125 relative ${
                swatch === 'transparent' ? 'border-dashed border-red-500/70' : 'border-[#3d3d48]'
              } ${currentHex.toLowerCase() === swatch.toLowerCase() ? 'ring-2 ring-blue-500 scale-110 z-10' : ''}`}
            >
              {swatch === 'transparent' && (
                <span className="absolute inset-0 text-[8px] text-red-500 flex items-center justify-center font-bold">
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
