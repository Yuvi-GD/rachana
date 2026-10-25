import React, { useState, useEffect } from 'react';

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

  const [isFocused, setIsFocused] = useState(false);
  const [localStr, setLocalStr] = useState<string | null>(null);

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

  // Synchronize local input string when value changes externally
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(null);
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalStr(numStr);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Clean redundant leading zero (e.g. typing 5 after 0 becomes 5 instead of 05)
    let clean = raw.trim();
    if (/^0+[1-9]/.test(clean)) {
      clean = clean.replace(/^0+/, '');
    } else if (/^0+$/.test(clean)) {
      clean = '0';
    }

    setLocalStr(clean);

    if (clean === '') {
      // Keep empty while typing without forcing 0 or auto immediately
      return;
    }

    if (!isNaN(Number(clean))) {
      onChange(`${clean}${activeUnit}`);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localStr === '' || localStr === null) {
      if (allowAuto) {
        onChange('auto');
      } else if (min !== undefined) {
        onChange(`${min}${activeUnit}`);
      } else if (placeholder && !isNaN(Number(placeholder))) {
        onChange(`${placeholder}${activeUnit}`);
      } else {
        onChange(`0${activeUnit}`);
      }
    } else {
      onChange(`${localStr}${activeUnit}`);
    }
    setLocalStr(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setLocalStr(numStr);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    const numToUse = (localStr !== null && localStr !== '') ? localStr : (numStr !== '' ? numStr : '0');
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

  const displayVal = isFocused && localStr !== null ? localStr : numStr;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Input container with number + unit dropdown */}
      <div className="flex-1 flex items-center rounded border border-[#34343d] bg-[#1c1c20] focus-within:border-blue-500 overflow-hidden min-w-0 transition-colors">
        {isAuto ? (
          <div
            onClick={toggleAuto}
            className="flex-1 px-2 py-1 text-xs font-mono text-zinc-200 font-semibold select-none cursor-pointer hover:text-white"
            title="Click to edit numeric value"
          >
            auto
          </div>
        ) : isNone ? (
          <div
            onClick={toggleNone}
            className="flex-1 px-2 py-1 text-xs font-mono text-zinc-400 font-semibold select-none cursor-pointer hover:text-zinc-200"
            title="Click to edit numeric value"
          >
            none
          </div>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            value={displayVal}
            onChange={handleNumberChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-full bg-transparent px-2 py-1 text-xs text-zinc-100 outline-none font-mono placeholder:text-zinc-600 min-w-0"
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
          className={`px-1.5 py-1 rounded text-[10px] font-mono font-medium transition-all flex-shrink-0 border ${
            isAuto
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
              : 'bg-[#1c1c22] hover:bg-[#24242c] border-[#2e2e38] text-zinc-400 hover:text-zinc-200'
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
          className={`px-1.5 py-1 rounded text-[10px] font-mono font-medium transition-all flex-shrink-0 border ${
            isNone
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
              : 'bg-[#1c1c22] hover:bg-[#24242c] border-[#2e2e38] text-zinc-400 hover:text-zinc-200'
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
          className="px-1.5 py-1 rounded text-[10px] font-mono font-medium bg-[#1c1c22] hover:bg-[#24242c] border border-[#2e2e38] text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
        >
          0
        </button>
      )}
    </div>
  );
};
