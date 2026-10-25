import React from 'react';
import { 
  ArrowRight, 
  ArrowDown, 
  RotateCcw,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify
} from 'lucide-react';
import { LayoutNodeStyle } from '../../types/layout';

interface FlexControlsProps {
  style: LayoutNodeStyle;
  onChange: (updates: Partial<LayoutNodeStyle>) => void;
}

export const FlexControls: React.FC<FlexControlsProps> = ({ style, onChange }) => {
  const isCol = style.flexDirection === 'column' || style.flexDirection === 'column-reverse';
  const isReverse = style.flexDirection === 'row-reverse' || style.flexDirection === 'column-reverse';

  const setAxis = (axis: 'row' | 'column') => {
    const newDir = isReverse ? `${axis}-reverse` : axis;
    onChange({ flexDirection: newDir as any, flow: axis === 'column' ? 'COLUMN' : 'ROW' });
  };

  const toggleReverse = () => {
    const baseAxis = isCol ? 'column' : 'row';
    const newDir = isReverse ? baseAxis : `${baseAxis}-reverse`;
    onChange({ flexDirection: newDir as any });
  };

  return (
    <div className="space-y-3 select-none">
      {/* Direction: 3 options (Row, Column, Reverse toggle) */}
      <div>
        <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
          Flex Direction
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setAxis('row')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded border text-[11px] font-medium transition-colors ${
              !isCol
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Row</span>
          </button>

          <button
            type="button"
            onClick={() => setAxis('column')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded border text-[11px] font-medium transition-colors ${
              isCol
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Column</span>
          </button>

          <button
            type="button"
            onClick={toggleReverse}
            title={isReverse ? 'Reverse is enabled (click to disable)' : 'Enable reverse direction'}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded border text-[11px] font-medium transition-colors ${
              isReverse
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reverse</span>
          </button>
        </div>
      </div>

      {/* Justify Content (Main Axis Alignment) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase font-semibold text-zinc-400">
            Justify Content (Main Axis)
          </label>
          <span className="text-[10px] font-mono text-zinc-500">{style.justifyContent}</span>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {[
            { val: 'flex-start', icon: <AlignLeft className="w-3.5 h-3.5" />, title: 'Start' },
            { val: 'center', icon: <AlignCenter className="w-3.5 h-3.5" />, title: 'Center' },
            { val: 'flex-end', icon: <AlignRight className="w-3.5 h-3.5" />, title: 'End' },
            { val: 'space-between', icon: <AlignJustify className="w-3.5 h-3.5" />, title: 'Between' },
            { val: 'space-around', icon: <span className="text-[10px] font-bold">Around</span>, title: 'Around' },
            { val: 'space-evenly', icon: <span className="text-[10px] font-bold">Even</span>, title: 'Evenly' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onChange({ justifyContent: item.val as any })}
              title={`justify-content: ${item.val}`}
              className={`flex items-center justify-center p-1.5 rounded border text-[11px] transition-colors ${
                style.justifyContent === item.val
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Align Items (Cross Axis Alignment) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase font-semibold text-zinc-400">
            Align Items (Cross Axis)
          </label>
          <span className="text-[10px] font-mono text-zinc-500">{style.alignItems}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { val: 'stretch', label: 'Stretch' },
            { val: 'flex-start', label: 'Start' },
            { val: 'center', label: 'Center' },
            { val: 'flex-end', label: 'End' },
            { val: 'baseline', label: 'Base' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onChange({ alignItems: item.val as any })}
              title={`align-items: ${item.val}`}
              className={`py-1 px-1 rounded border text-[10px] font-medium transition-colors text-center ${
                style.alignItems === item.val
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flex Wrap */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase font-semibold text-zinc-400">
            Flex Wrap
          </label>
          <span className="text-[10px] font-mono text-zinc-500">{style.flexWrap || 'nowrap'}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { val: 'nowrap', label: 'No Wrap' },
            { val: 'wrap', label: 'Wrap' },
            { val: 'wrap-reverse', label: 'Reverse' },
          ].map((item) => {
            const isActive = (style.flexWrap || 'nowrap') === item.val;
            return (
              <button
                key={item.val}
                type="button"
                onClick={() => onChange({ flexWrap: item.val as any })}
                className={`py-1 rounded border text-[10px] font-medium transition-colors text-center ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                    : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flex Item Properties (Grow, Shrink, Basis, Order in 2x2 grid, plus AlignSelf) */}
      <div className="pt-2 border-t border-[#2e2e36] space-y-2.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 block">
          Flex Item (Child Layout)
        </span>
        
        {/* 2x2 Grid for the 4 input fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Flex Grow</label>
            <input
              type="text"
              value={style.flexGrow || '0'}
              onChange={(e) => onChange({ flexGrow: e.target.value })}
              placeholder="0"
              className="w-full bg-[#1c1c20] hover:bg-[#23232a] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Flex Shrink</label>
            <input
              type="text"
              value={style.flexShrink || '1'}
              onChange={(e) => onChange({ flexShrink: e.target.value })}
              placeholder="1"
              className="w-full bg-[#1c1c20] hover:bg-[#23232a] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Flex Basis</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={style.flexBasis || 'auto'}
                onChange={(e) => onChange({ flexBasis: e.target.value })}
                placeholder="auto"
                className="flex-1 bg-[#1c1c20] hover:bg-[#23232a] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono min-w-0"
              />
              <button
                type="button"
                onClick={() => onChange({ flexBasis: style.flexBasis === 'auto' || !style.flexBasis ? '100px' : 'auto' })}
                className={`px-1.5 py-1 rounded text-[10px] font-mono font-semibold transition-all flex-shrink-0 border ${
                  style.flexBasis === 'auto' || !style.flexBasis
                    ? 'bg-blue-600/25 border-blue-500/60 text-blue-300 shadow-xs'
                    : 'bg-[#222227] hover:bg-[#2b2b33] border-[#34343d] text-zinc-400 hover:text-zinc-200'
                }`}
                title={style.flexBasis === 'auto' || !style.flexBasis ? 'Switch to value' : 'Set to auto'}
              >
                Auto
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Order</label>
            <input
              type="text"
              value={style.order || '0'}
              onChange={(e) => onChange({ order: e.target.value })}
              placeholder="0"
              className="w-full bg-[#1c1c20] hover:bg-[#23232a] focus:bg-[#1a1a20] border border-[#34343d] focus:border-blue-500 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>
        </div>

        {/* Align Self */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase font-semibold text-zinc-400">
              Align Self
            </label>
            <span className="text-[9px] font-mono text-zinc-500">{style.alignSelf || 'auto'}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[
              { val: 'auto', label: 'Auto' },
              { val: 'flex-start', label: 'Start' },
              { val: 'center', label: 'Center' },
              { val: 'flex-end', label: 'End' },
              { val: 'stretch', label: 'Stretch' },
            ].map((item) => {
              const isActive = (style.alignSelf || 'auto') === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onChange({ alignSelf: item.val as any })}
                  title={`align-self: ${item.val}`}
                  className={`py-1 rounded border text-[10px] font-medium transition-colors text-center ${
                    isActive
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                      : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
