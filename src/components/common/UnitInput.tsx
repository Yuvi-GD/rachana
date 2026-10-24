import React from 'react';

export interface UnitInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  units?: string[];
  allowAuto?: boolean;
  allowNone?: boolean;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const UnitInput: React.FC<UnitInputProps> = ({
  value = '',
  onChange,
  units = ['px', '%', 'rem'],
  allowAuto = false,
  allowNone = false,
  placeholder = '0',
  className = '',
  min,
  max,
  step = 1,
}) => {
  const isAuto = value === 'auto';
  const isNone = value === 'none';

  // Parse numeric part and unit
  const parseValue = (raw: string) => {
    if (!raw || raw === 'auto' || raw === 'none') {
      return { numStr: '', unit: units[0] || 'px' };
    }
    const match = raw.trim().match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-zA-Z%]*)$/);
    if (match) {
      const numStr = match[1];
      const parsedUnit = match[2] || units[0] || 'px';
      return { numStr, unit: parsedUnit };
    }
    return { numStr: raw, unit: units[0] || 'px' };
  };

  const { numStr, unit } = parseValue(value);
  const activeUnit = units.includes(unit) ? unit : units[0] || 'px';

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = e.target.value.trim();
    if (newNum === '') {
      if (allowAuto) {
        onChange('auto');
      } else {
        onChange(`0${activeUnit}`);
      }
      return;
    }
    // If user typed a number
    onChange(`${newNum}${activeUnit}`);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    if (newUnit === 'auto') {
      onChange('auto');
    } else if (newUnit === 'none') {
      onChange('none');
    } else {
      const numToUse = numStr !== '' ? numStr : '0';
      onChange(`${numToUse}${newUnit}`);
    }
  };


  return (
    <div className={`flex items-center rounded border border-[#34343d] bg-[#1c1c20] focus-within:border-blue-500 overflow-hidden ${className}`}>
      {/* Number Input or Auto/None badge */}
      {isAuto ? (
        <div className="flex-1 px-2 py-1 text-xs font-mono text-cyan-400 font-semibold select-none flex items-center justify-between">
          <span>auto</span>
          <button
            type="button"
            onClick={() => onChange(`100${units[0] || 'px'}`)}
            className="text-[9px] text-zinc-500 hover:text-zinc-200 underline"
            title="Switch to numeric value"
          >
            edit
          </button>
        </div>
      ) : isNone ? (
        <div className="flex-1 px-2 py-1 text-xs font-mono text-zinc-500 font-semibold select-none flex items-center justify-between">
          <span>none</span>
          <button
            type="button"
            onClick={() => onChange(`100${units[0] || 'px'}`)}
            className="text-[9px] text-zinc-500 hover:text-zinc-200 underline"
            title="Switch to numeric value"
          >
            edit
          </button>
        </div>
      ) : (
        <input
          type="number"
          value={numStr}
          onChange={handleNumberChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full bg-transparent px-2 py-1 text-xs text-zinc-100 outline-none font-mono placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      )}

      {/* Unit Dropdown / Selector */}
      <div className="flex items-center border-l border-[#2e2e36] bg-[#222228] px-1">
        <select
          value={isAuto ? 'auto' : isNone ? 'none' : activeUnit}
          onChange={handleUnitChange}
          className="bg-transparent text-[10px] font-mono text-zinc-300 outline-none cursor-pointer py-1 pr-0.5 hover:text-white"
        >
          {units.map((u) => (
            <option key={u} value={u} className="bg-[#222228] text-zinc-200">
              {u}
            </option>
          ))}
          {allowAuto && (
            <option value="auto" className="bg-[#222228] text-cyan-300">
              auto
            </option>
          )}
          {allowNone && (
            <option value="none" className="bg-[#222228] text-zinc-400">
              none
            </option>
          )}
        </select>
      </div>
    </div>
  );
};
