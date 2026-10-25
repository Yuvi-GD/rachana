import React from 'react';
import { 
  ArrowRight, 
  ArrowDown, 
  ArrowLeft, 
  ArrowUp,
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
  return (
    <div className="space-y-3 select-none">
      {/* Direction */}
      <div>
        <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
          Flex Direction
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { val: 'row', icon: <ArrowRight className="w-3.5 h-3.5" />, label: 'Row' },
            { val: 'column', icon: <ArrowDown className="w-3.5 h-3.5" />, label: 'Col' },
            { val: 'row-reverse', icon: <ArrowLeft className="w-3.5 h-3.5" />, label: 'Row-R' },
            { val: 'column-reverse', icon: <ArrowUp className="w-3.5 h-3.5" />, label: 'Col-R' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onChange({ flexDirection: item.val as any })}
              title={`flex-direction: ${item.val}`}
              className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded border text-[11px] font-medium transition-colors ${
                style.flexDirection === item.val
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                  : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2b32]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
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

      {/* Flex Item Properties (Grow / Shrink / Basis / AlignSelf / Order) */}
      <div className="pt-2 border-t border-[#2e2e36] space-y-2.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 block">
          Flex Item (Child Layout)
        </span>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Flex Grow</label>
            <input
              type="text"
              value={style.flexGrow}
              onChange={(e) => onChange({ flexGrow: e.target.value })}
              className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Flex Shrink</label>
            <input
              type="text"
              value={style.flexShrink}
              onChange={(e) => onChange({ flexShrink: e.target.value })}
              className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Flex Basis</label>
            <input
              type="text"
              value={style.flexBasis}
              onChange={(e) => onChange({ flexBasis: e.target.value })}
              placeholder="auto"
              className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>
        </div>

        {/* Align Self as Buttons */}
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

        {/* Order */}
        <div>
          <label className="text-[10px] text-zinc-400 block mb-0.5">Order</label>
          <input
            type="text"
            value={style.order}
            onChange={(e) => onChange({ order: e.target.value })}
            placeholder="0"
            className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
};
