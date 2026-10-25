import React, { useState } from 'react';
import { SpacingSides } from '../../types/layout';
import { Link2, Unlink2, Move } from 'lucide-react';
import { UnitInput } from '../common/UnitInput';

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
  mode?: 'edit' | 'inspect';
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
  mode,
  onMarginChange,
  onPaddingChange,
  onBorderChange,
  onGapChange,
}) => {
  const [internalTab] = useState<'edit' | 'inspect'>('edit');
  const activeTab = mode || internalTab;
  const [marginLinked, setMarginLinked] = useState(false);
  const [paddingLinked, setPaddingLinked] = useState(false);
  const [borderLinked, setBorderLinked] = useState(false);
  const [gapLinked, setGapLinked] = useState(false);

  const cleanVal = (val: string) => (val || '0px').replace(/px$/, '');

  const handleMarginChange = (side: keyof SpacingSides, formatted: string) => {
    if (marginLinked) {
      onMarginChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onMarginChange({ ...margin, [side]: formatted });
    }
  };

  const handlePaddingChange = (side: keyof SpacingSides, formatted: string) => {
    if (paddingLinked) {
      onPaddingChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onPaddingChange({ ...padding, [side]: formatted });
    }
  };

  const handleBorderChange = (side: keyof SpacingSides, formatted: string) => {
    if (borderLinked) {
      onBorderChange({ top: formatted, right: formatted, bottom: formatted, left: formatted });
    } else {
      onBorderChange({ ...borderWidth, [side]: formatted });
    }
  };

  const handleGapChange = (type: 'column' | 'row', formatted: string) => {
    if (!onGapChange) return;
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
      {activeTab === 'edit' ? (
        /* ======================================================== */
        /* EDIT CONTROLS (Gap, Margin, Padding, Border)              */
        /* ======================================================== */
        <div className="space-y-3">
          {/* Gap Editor (Unified Single Source for Gap Spacing) */}
          {onGapChange && (
            <div className="space-y-1.5 pb-2.5 border-b border-[#292934]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Move className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Gap (Child Spacing)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onGapChange({ columnGap: '0px', rowGap: '0px', gap: '0px' })}
                    className="px-1.5 py-0.5 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[9px] text-zinc-300 font-mono"
                  >
                    0px
                  </button>
                  <button
                    type="button"
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

              {gapLinked ? (
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">
                    Gap (X & Y Linked)
                  </label>
                  <UnitInput
                    value={effectiveGapX}
                    onChange={(val) => {
                      onGapChange({ columnGap: val, rowGap: val, gap: val });
                    }}
                    units={['px', '%', 'rem']}
                    placeholder="0"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">
                      Gap X (Column)
                    </label>
                    <UnitInput
                      value={effectiveGapX}
                      onChange={(val) => handleGapChange('column', val)}
                      units={['px', '%', 'rem']}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-0.5">
                      Gap Y (Row)
                    </label>
                    <UnitInput
                      value={effectiveGapY}
                      onChange={(val) => handleGapChange('row', val)}
                      units={['px', '%', 'rem']}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Margin Editor */}
          <div className="space-y-1.5 pb-2.5 border-b border-[#292934]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                Margin
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMarginChange({ top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' })}
                  className="px-1.5 py-0.5 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[9px] text-zinc-300 font-mono"
                  title="Set all margins to auto (centering)"
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => onMarginChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[9px] text-zinc-300 font-mono"
                  title="Reset margins to 0px"
                >
                  0px
                </button>
                <button
                  type="button"
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

            {marginLinked ? (
              <div>
                <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">All Sides</label>
                <UnitInput
                  value={margin.top}
                  onChange={(val) => onMarginChange({ top: val, right: val, bottom: val, left: val })}
                  units={['px', '%', 'rem']}
                  allowAuto={true}
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">
                      {side}
                    </label>
                    <UnitInput
                      value={margin[side]}
                      onChange={(val) => handleMarginChange(side, val)}
                      units={['px', '%', 'rem']}
                      allowAuto={true}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Padding Editor */}
          <div className="space-y-1.5 pb-2.5 border-b border-[#292934]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Padding
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onPaddingChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[9px] text-zinc-300 font-mono"
                >
                  0px
                </button>
                <button
                  type="button"
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

            {paddingLinked ? (
              <div>
                <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">All Sides</label>
                <UnitInput
                  value={padding.top}
                  onChange={(val) => onPaddingChange({ top: val, right: val, bottom: val, left: val })}
                  units={['px', '%', 'rem']}
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">
                      {side}
                    </label>
                    <UnitInput
                      value={padding[side]}
                      onChange={(val) => handlePaddingChange(side, val)}
                      units={['px', '%', 'rem']}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Border Width Editor */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">
                Border Width
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onBorderChange({ top: '0px', right: '0px', bottom: '0px', left: '0px' })}
                  className="px-1.5 py-0.5 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[9px] text-zinc-300 font-mono"
                >
                  0px
                </button>
                <button
                  type="button"
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

            {borderLinked ? (
              <div>
                <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">All Sides</label>
                <UnitInput
                  value={borderWidth.top}
                  onChange={(val) => onBorderChange({ top: val, right: val, bottom: val, left: val })}
                  units={['px']}
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                  <div key={side}>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-0.5">
                      {side}
                    </label>
                    <UnitInput
                      value={borderWidth[side]}
                      onChange={(val) => handleBorderChange(side, val)}
                      units={['px']}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
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
                            {Math.round(contentWidth)} x {Math.round(contentHeight)}
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
