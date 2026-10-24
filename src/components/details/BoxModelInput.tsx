import React, { useState } from 'react';
import { SpacingSides } from '../../types/layout';
import { Link2, Unlink2, Eye, Edit3, Move } from 'lucide-react';

interface BoxModelInputProps {
  label: string;
  margin: SpacingSides;
  padding: SpacingSides;
  borderWidth: SpacingSides;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  contentWidth?: number;
  contentHeight?: number;
  onMarginChange: (margin: SpacingSides) => void;
  onPaddingChange: (padding: SpacingSides) => void;
  onBorderChange: (border: SpacingSides) => void;
  onGapChange?: (updates: { gap?: string; rowGap?: string; columnGap?: string }) => void;
}

export const BoxModelInput: React.FC<BoxModelInputProps> = ({
  margin,
  padding,
  borderWidth,
  gap = '0px',
  rowGap = '0px',
  columnGap = '0px',
  contentWidth = 0,
  contentHeight = 0,
  onMarginChange,
  onPaddingChange,
  onBorderChange,
  onGapChange,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'inspect'>('edit');
  const [marginLinked, setMarginLinked] = useState(false);
  const [paddingLinked, setPaddingLinked] = useState(false);
  const [borderLinked, setBorderLinked] = useState(false);
  const [gapLinked, setGapLinked] = useState(false);

  const cleanVal = (val: string) => (val || '0px').replace(/px$/, '');

  const handleMarginChange = (side: keyof SpacingSides, rawVal: string) => {
    const formatted = rawVal.trim() === '' ? '0px' : rawVal.endsWith('px') || rawVal.endsWith('%') || rawVal === 'auto' ? rawVal : `${rawVal}px`;
    if (marginLinked) {
      onMarginChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onMarginChange({ ...margin, [side]: formatted });
    }
  };

  const handlePaddingChange = (side: keyof SpacingSides, rawVal: string) => {
    const formatted = rawVal.trim() === '' ? '0px' : rawVal.endsWith('px') || rawVal.endsWith('%') || rawVal === 'auto' ? rawVal : `${rawVal}px`;
    if (paddingLinked) {
      onPaddingChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onPaddingChange({ ...padding, [side]: formatted });
    }
  };

  const handleBorderChange = (side: keyof SpacingSides, rawVal: string) => {
    const formatted = rawVal.trim() === '' ? '0px' : rawVal.endsWith('px') || rawVal.endsWith('%') || rawVal === 'auto' ? rawVal : `${rawVal}px`;
    if (borderLinked) {
      onBorderChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onBorderChange({ ...borderWidth, [side]: formatted });
    }
  };

  const handleGapChange = (type: 'column' | 'row', rawVal: string) => {
    if (!onGapChange) return;
    const formatted = rawVal.trim() === '' ? '0px' : rawVal.endsWith('px') || rawVal.endsWith('%') ? rawVal : `${rawVal}px`;
    if (gapLinked) {
      onGapChange({ columnGap: formatted, rowGap: formatted, gap: formatted });
    } else {
      if (type === 'column') {
        onGapChange({ columnGap: formatted, gap: formatted === (rowGap || gap) ? formatted : `${rowGap || gap || '0px'} ${formatted}` });
      } else {
        onGapChange({ rowGap: formatted, gap: formatted === (columnGap || gap) ? formatted : `${formatted} ${columnGap || gap || '0px'}` });
      }
    }
  };

  const effectiveGapX = columnGap || gap || '0px';
  const effectiveGapY = rowGap || gap || '0px';

  return (
    <div className="space-y-2.5 select-none text-xs">
      {/* Tab Switcher: Edit vs Inspect */}
      <div className="flex items-center justify-between border-b border-[#2d2d35] pb-1.5">
        <div className="flex items-center gap-1 bg-[#1a1a1e] p-0.5 rounded border border-[#2e2e38]">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Spacing</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              activeTab === 'inspect'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Computed (Readonly)</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-zinc-500">
          {Math.round(contentWidth)}×{Math.round(contentHeight)}px
        </span>
      </div>

      {activeTab === 'edit' ? (
        /* ======================================================== */
        /* EDIT CONTROLS (Gap, Margin, Padding, Border)              */
        /* ======================================================== */
        <div className="space-y-3">
          {/* Gap Editor (First-Class Spacing in Modern & Tether UI) */}
          {onGapChange && (
            <div className="bg-[#1a1a1e] p-2 rounded border border-[#3b3226] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Move className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Gap (Child Spacing)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onGapChange({ columnGap: '0px', rowGap: '0px', gap: '0px' })}
                    className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                  >
                    0px
                  </button>
                  <button
                    onClick={() => setGapLinked(!gapLinked)}
                    className={`p-1 rounded text-[10px] ${
                      gapLinked ? 'text-amber-400 bg-amber-950/40' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={gapLinked ? 'Linked (X & Y equal)' : 'Individual X & Y'}
                  >
                    {gapLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Quick Tether UI presets */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
                {[
                  { label: '[0, 8]', x: '0px', y: '8px' },
                  { label: '[0, 15]', x: '0px', y: '15px' },
                  { label: '[12, 0]', x: '12px', y: '0px' },
                  { label: '[15, 0]', x: '15px', y: '0px' },
                  { label: '[0, 30]', x: '0px', y: '30px' },
                  { label: '8px', x: '8px', y: '8px' },
                  { label: '12px', x: '12px', y: '12px' },
                  { label: '16px', x: '16px', y: '16px' },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => onGapChange({ columnGap: p.x, rowGap: p.y, gap: p.x === p.y ? p.x : `${p.y} ${p.x}` })}
                    className="px-1.5 py-0.5 rounded bg-[#25252e] hover:bg-[#32323c] text-[9px] text-amber-300 font-mono shrink-0 border border-[#3b352b]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-0.5">
                <div>
                  <label className="text-[9px] text-zinc-400 block text-center mb-0.5">
                    Gap X (Column)
                  </label>
                  <input
                    type="text"
                    value={effectiveGapX}
                    onChange={(e) => handleGapChange('column', e.target.value)}
                    className="w-full text-center bg-[#23232a] border border-amber-900/50 hover:border-amber-700/60 focus:border-amber-500 rounded px-1 py-0.5 text-amber-300 outline-none text-xs"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block text-center mb-0.5">
                    Gap Y (Row)
                  </label>
                  <input
                    type="text"
                    value={effectiveGapY}
                    onChange={(e) => handleGapChange('row', e.target.value)}
                    className="w-full text-center bg-[#23232a] border border-amber-900/50 hover:border-amber-700/60 focus:border-amber-500 rounded px-1 py-0.5 text-amber-300 outline-none text-xs"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Margin Editor */}
          <div className="bg-[#1a1a1e] p-2 rounded border border-[#2d2d38] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                Margin
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMarginChange({ top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                  title="Set all margins to auto (centering)"
                >
                  Auto
                </button>
                <button
                  onClick={() => onMarginChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                  title="Reset margins to 0px"
                >
                  0px
                </button>
                <button
                  onClick={() => onMarginChange({ top: '8px', right: '8px', bottom: '8px', left: '8px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  8px
                </button>
                <button
                  onClick={() => onMarginChange({ top: '16px', right: '16px', bottom: '16px', left: '16px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  16px
                </button>
                <button
                  onClick={() => setMarginLinked(!marginLinked)}
                  className={`p-1 rounded text-[10px] ${
                    marginLinked ? 'text-orange-400 bg-orange-950/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={marginLinked ? 'Linked (all match)' : 'Individual sides'}
                >
                  {marginLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <label className="text-[9px] text-zinc-500 uppercase block text-center mb-0.5">
                    {side[0]}
                  </label>
                  <input
                    type="text"
                    value={margin[side]}
                    onChange={(e) => handleMarginChange(side, e.target.value)}
                    className="w-full text-center bg-[#23232a] border border-orange-900/40 hover:border-orange-700/60 focus:border-orange-500 rounded px-1 py-0.5 text-orange-300 outline-none text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Padding Editor */}
          <div className="bg-[#1a1a1e] p-2 rounded border border-[#2d2d38] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Padding
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPaddingChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  0px
                </button>
                <button
                  onClick={() => onPaddingChange({ top: '8px', right: '8px', bottom: '8px', left: '8px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  8px
                </button>
                <button
                  onClick={() => onPaddingChange({ top: '15px', right: '15px', bottom: '15px', left: '15px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  15px
                </button>
                <button
                  onClick={() => onPaddingChange({ top: '40px', right: '40px', bottom: '40px', left: '40px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  40px
                </button>
                <button
                  onClick={() => setPaddingLinked(!paddingLinked)}
                  className={`p-1 rounded text-[10px] ${
                    paddingLinked ? 'text-emerald-400 bg-emerald-950/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={paddingLinked ? 'Linked (all match)' : 'Individual sides'}
                >
                  {paddingLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <label className="text-[9px] text-zinc-500 uppercase block text-center mb-0.5">
                    {side[0]}
                  </label>
                  <input
                    type="text"
                    value={padding[side]}
                    onChange={(e) => handlePaddingChange(side, e.target.value)}
                    className="w-full text-center bg-[#23232a] border border-emerald-900/40 hover:border-emerald-700/60 focus:border-emerald-500 rounded px-1 py-0.5 text-emerald-300 outline-none text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Border Width Editor */}
          <div className="bg-[#1a1a1e] p-2 rounded border border-[#2d2d38] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">
                Border Width
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onBorderChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  0px
                </button>
                <button
                  onClick={() => onBorderChange({ top: '1px', right: '1px', bottom: '1px', left: '1px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  1px
                </button>
                <button
                  onClick={() => onBorderChange({ top: '2px', right: '2px', bottom: '2px', left: '2px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  2px
                </button>
                <button
                  onClick={() => onBorderChange({ top: '5px', right: '5px', bottom: '5px', left: '5px' })}
                  className="px-1.5 py-0.5 rounded bg-[#25252d] hover:bg-[#32323c] text-[9px] text-zinc-300 font-mono"
                >
                  5px
                </button>
                <button
                  onClick={() => setBorderLinked(!borderLinked)}
                  className={`p-1 rounded text-[10px] ${
                    borderLinked ? 'text-yellow-400 bg-yellow-950/40' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={borderLinked ? 'Linked (all match)' : 'Individual sides'}
                >
                  {borderLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <label className="text-[9px] text-zinc-500 uppercase block text-center mb-0.5">
                    {side[0]}
                  </label>
                  <input
                    type="text"
                    value={borderWidth[side]}
                    onChange={(e) => handleBorderChange(side, e.target.value)}
                    className="w-full text-center bg-[#23232a] border border-yellow-900/40 hover:border-yellow-700/60 focus:border-yellow-500 rounded px-1 py-0.5 text-yellow-300 outline-none text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* READONLY COMPUTED DIAGRAM (DevTools Style)                */
        /* ======================================================== */
        <div className="space-y-2">
          <div className="p-2 rounded bg-[#131316] border border-[#2a2a32] flex flex-col items-center justify-center font-mono text-[10px]">
            {/* Margin Outer */}
            <div className="w-full bg-[#2c1d12] border border-orange-600/60 rounded p-1.5 text-center relative text-orange-300">
              <span className="text-[8px] uppercase tracking-wider text-orange-500 font-bold absolute top-1 left-2">
                margin
              </span>
              <div className="text-[10px]">{cleanVal(margin.top)}</div>

              <div className="flex items-center justify-between my-1">
                <span className="w-8">{cleanVal(margin.left)}</span>

                {/* Border */}
                <div className="flex-1 mx-1 bg-[#262410] border border-yellow-600/60 rounded p-1 text-center relative text-yellow-200">
                  <span className="text-[8px] uppercase tracking-wider text-yellow-500 font-bold absolute top-0.5 left-1.5">
                    border
                  </span>
                  <div className="text-[9px]">{cleanVal(borderWidth.top)}</div>

                  <div className="flex items-center justify-between my-0.5">
                    <span className="w-6">{cleanVal(borderWidth.left)}</span>

                    {/* Padding */}
                    <div className="flex-1 mx-1 bg-[#102418] border border-emerald-600/60 rounded p-1 text-center relative text-emerald-300">
                      <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold absolute top-0.5 left-1.5">
                        padding
                      </span>
                      <div className="text-[9px]">{cleanVal(padding.top)}</div>

                      <div className="flex items-center justify-between my-0.5">
                        <span className="w-6">{cleanVal(padding.left)}</span>

                        {/* Content Box */}
                        <div className="flex-1 mx-1 bg-[#0f243c] border border-blue-500/70 rounded py-1 px-1 text-center text-blue-200">
                          <div className="text-[8px] uppercase font-bold text-blue-400">content</div>
                          <div className="font-bold text-[10px] mt-0.5">
                            {Math.round(contentWidth)} × {Math.round(contentHeight)}
                          </div>
                        </div>

                        <span className="w-6">{cleanVal(padding.right)}</span>
                      </div>

                      <div className="text-[9px]">{cleanVal(padding.bottom)}</div>
                    </div>

                    <span className="w-6">{cleanVal(borderWidth.right)}</span>
                  </div>

                  <div className="text-[9px]">{cleanVal(borderWidth.bottom)}</div>
                </div>

                <span className="w-8">{cleanVal(margin.right)}</span>
              </div>

              <div className="text-[10px]">{cleanVal(margin.bottom)}</div>
            </div>
          </div>

          {/* Child Gap Inspector Pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#17171c] rounded border border-[#2d2d38] font-mono text-[10px] text-zinc-300">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[9px]">
              Child Gap Spacing
            </span>
            <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
              X: {effectiveGapX} | Y: {effectiveGapY}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
