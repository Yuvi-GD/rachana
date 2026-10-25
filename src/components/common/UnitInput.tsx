import React from 'react';

export interface UnitInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  units?: string[];
  allowAuto?: boolean;
  allowNone?: boolean;
  allowZero?: boolean;
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
  allowZero = false,
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
    onChange(`${newNum}${activeUnit}`);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    const numToUse = numStr !== '' ? numStr : '0';
    onChange(`${numToUse}${newUnit}`);
  };

  const toggleAuto = () => {
    if (isAuto) {
      onChange(`100${units[0] || 'px'}`);
    } else {
      onChange('auto');
    }
  };

  const toggleNone = () => {
    if (isNone) {
      onChange(`100${units[0] || 'px'}`);
    } else {
      onChange('none');
    }
  };

  const setZero = () => {
    onChange(`0${activeUnit}`);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Input container with number + unit dropdown */}
      <div className="flex-1 flex items-center rounded border border-[#34343d] bg-[#1c1c20] focus-within:border-blue-500 overflow-hidden min-w-0 transition-colors">
        {isAuto ? (
          <div className="flex-1 px-2 py-1 text-xs font-mono text-zinc-200 font-semibold select-none">
            auto
          </div>
        ) : isNone ? (
          <div className="flex-1 px-2 py-1 text-xs font-mono text-zinc-400 font-semibold select-none">
            none
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
            className="w-full bg-transparent px-2 py-1 text-xs text-zinc-100 outline-none font-mono placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
          />
        )}

        {/* Unit Dropdown (px, %, rem, vw, vh) */}
        {!isAuto && !isNone && (
          <div className="flex items-center border-l border-[#2e2e36] bg-[#222228] px-1 flex-shrink-0">
            <select
              value={activeUnit}
              onChange={handleUnitChange}
              className="bg-transparent text-[10px] font-mono text-zinc-300 outline-none cursor-pointer py-1 pr-0.5 hover:text-white"
            >
              {units.map((u) => (
                <option key={u} value={u} className="bg-[#222228] text-zinc-200">
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick Action Pill Buttons for Auto, None, Zero */}
      {allowAuto && (
        <button
          type="button"
          onClick={toggleAuto}
          title={isAuto ? 'Switch to numeric value' : 'Set to auto'}
          className={`px-1.5 py-1 rounded text-[10px] font-mono font-semibold transition-all flex-shrink-0 border ${
            isAuto
              ? 'bg-blue-600/25 border-blue-500/60 text-blue-300 shadow-xs'
              : 'bg-[#222227] hover:bg-[#2b2b33] border-[#34343d] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Auto
        </button>
      )}

      {allowNone && (
        <button
          type="button"
          onClick={toggleNone}
          title={isNone ? 'Switch to numeric value' : 'Set to none'}
          className={`px-1.5 py-1 rounded text-[10px] font-mono font-semibold transition-all flex-shrink-0 border ${
            isNone
              ? 'bg-blue-600/25 border-blue-500/60 text-blue-300 shadow-xs'
              : 'bg-[#222227] hover:bg-[#2b2b33] border-[#34343d] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          None
        </button>
      )}

      {allowZero && (
        <button
          type="button"
          onClick={setZero}
          title="Reset to 0"
          className="px-1.5 py-1 rounded text-[10px] font-mono font-medium bg-[#222227] hover:bg-[#2b2b33] border border-[#34343d] text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
        >
          0
        </button>
      )}
    </div>
  );
};
