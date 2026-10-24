import React from 'react';
import { LayoutNodeStyle } from '../../types/layout';

interface GridControlsProps {
  style: LayoutNodeStyle;
  onChange: (updates: Partial<LayoutNodeStyle>) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({ style, onChange }) => {
  const columnPresets = [
    { label: '2 Col (1fr 1fr)', val: '1fr 1fr' },
    { label: '3 Col (1fr 1fr 1fr)', val: 'repeat(3, 1fr)' },
    { label: 'Sidebar + Main', val: '140px 1fr' },
    { label: '4 Col Grid', val: 'repeat(4, 1fr)' },
  ];

  return (
    <div className="space-y-3 select-none">
      {/* Grid Template Columns */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] uppercase font-semibold text-zinc-400">
            Columns (Template)
          </label>
        </div>
        <input
          type="text"
          value={style.gridTemplateColumns}
          onChange={(e) => onChange({ gridTemplateColumns: e.target.value })}
          placeholder="repeat(2, 1fr)"
          className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono mb-1.5"
        />

        {/* Quick Column Presets */}
        <div className="grid grid-cols-2 gap-1">
          {columnPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ gridTemplateColumns: p.val })}
              className={`text-[10px] py-0.5 px-1.5 rounded border truncate text-left transition-colors ${
                style.gridTemplateColumns === p.val
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-semibold'
                  : 'bg-[#242429] border-[#34343d] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Template Rows */}
      <div>
        <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
          Rows (Template)
        </label>
        <input
          type="text"
          value={style.gridTemplateRows}
          onChange={(e) => onChange({ gridTemplateRows: e.target.value })}
          placeholder="auto"
          className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
        />
      </div>

      {/* Gap & Auto-Flow */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
            Gap
          </label>
          <input
            type="text"
            value={style.gap}
            onChange={(e) => onChange({ gap: e.target.value })}
            placeholder="16px"
            className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
            Auto Flow
          </label>
          <select
            value={style.gridAutoFlow}
            onChange={(e) => onChange({ gridAutoFlow: e.target.value as any })}
            className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
          >
            <option value="row">Row</option>
            <option value="column">Column</option>
            <option value="dense">Dense</option>
            <option value="row dense">Row Dense</option>
            <option value="column dense">Column Dense</option>
          </select>
        </div>
      </div>

      {/* Grid Item Properties */}
      <div className="pt-2 border-t border-[#2e2e36] space-y-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-400">
          Grid Item (Cell Placement)
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Grid Column</label>
            <input
              type="text"
              value={style.gridColumn}
              onChange={(e) => onChange({ gridColumn: e.target.value })}
              placeholder="auto or 1 / 3"
              className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Grid Row</label>
            <input
              type="text"
              value={style.gridRow}
              onChange={(e) => onChange({ gridRow: e.target.value })}
              placeholder="auto"
              className="w-full bg-[#242429] border border-[#34343d] rounded px-2 py-0.5 text-xs text-zinc-200 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

