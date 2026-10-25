import React, { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  X, 
  Settings, 
  RotateCcw,
  Sliders,
  Type,
  Palette,
  RotateCw,
  History
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { preferences, scrollSensitivity, maxHistorySteps, actions } = useEditorStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = preferences?.theme || 'unreal-dark';
  const currentFontSize = preferences?.codeFontSize || 12;
  const currentAutoSync = preferences?.autoSyncScript ?? true;

  const resetAllDefaults = () => {
    actions.setPreferences({
      theme: 'unreal-dark',
      codeFontSize: 12,
      autoSyncScript: true,
    });
    actions.setScrollSensitivity(1.0);
    actions.setMaxHistorySteps(64);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 select-none">
      <div 
        className="w-full max-w-lg bg-[#16161a] border border-[#2c2c36] rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-300 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 bg-[#1b1b22] border-b border-[#292934] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Studio Settings</h2>
              <p className="text-[10px] text-zinc-500">Configure theme, font sizes, sensitivity, and history limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#282834] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body - 5 Working Sensible Controls */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 max-h-[75vh]">
          {/* 1. Interface Theme */}
          <div className="p-3 bg-[#1a1a20] border border-[#2b2b36] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Studio Theme</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => actions.setPreferences({ theme: 'unreal-dark' })}
                className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  currentTheme === 'unreal-dark'
                    ? 'border-blue-500 bg-blue-600/15 text-white shadow-sm'
                    : 'border-[#2d2d38] bg-[#141418] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-semibold text-zinc-100">Unreal Slate Dark</div>
                <div className="text-[10px] text-zinc-500">Standard studio dark tone</div>
              </button>
              <button
                type="button"
                onClick={() => actions.setPreferences({ theme: 'high-contrast' })}
                className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  currentTheme === 'high-contrast'
                    ? 'border-blue-500 bg-blue-600/15 text-white shadow-sm'
                    : 'border-[#2d2d38] bg-[#141418] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-semibold text-zinc-100">Midnight High Contrast</div>
                <div className="text-[10px] text-zinc-500">Deep black & bright borders</div>
              </button>
            </div>
          </div>

          {/* 2. Code Editor Font Size */}
          <div className="p-3 bg-[#1a1a20] border border-[#2b2b36] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Type className="w-4 h-4 text-cyan-400" />
                <span>Script Font Size</span>
              </div>
              <span className="font-mono text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-[#121216] border border-[#2c2c38]">
                {currentFontSize}px
              </span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="10"
                max="18"
                step="1"
                value={currentFontSize}
                onChange={(e) => actions.setPreferences({ codeFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 h-1.5 bg-[#262630] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1 select-none">
                <span>10px (Compact)</span>
                <span>12px (Default)</span>
                <span>14px</span>
                <span>18px (Large)</span>
              </div>
            </div>
          </div>

          {/* 3. Mouse Wheel Zoom Sensitivity */}
          <div className="p-3 bg-[#1a1a20] border border-[#2b2b36] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Zoom Sensitivity</span>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-semibold">{scrollSensitivity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.05"
              value={scrollSensitivity}
              onChange={(e) => actions.setScrollSensitivity(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#252530] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.2x (Slow & Precise)</span>
              <span>1.0x (Default)</span>
              <span>3.0x (Fast)</span>
            </div>
          </div>

          {/* 4. Script Auto-Sync */}
          <div className="p-3 bg-[#1a1a20] border border-[#2b2b36] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-amber-600/20 text-amber-400">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">Script Auto-Sync</div>
                <div className="text-[10px] text-zinc-500">Automatically syncs code changes to canvas while typing</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentAutoSync}
                onChange={(e) => actions.setPreferences({ autoSyncScript: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#282834] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* 5. Undo / Redo History Capacity */}
          <div className="p-3 bg-[#1a1a20] border border-[#2b2b36] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <History className="w-4 h-4 text-blue-400" />
                <span>Undo / Redo Steps Limit</span>
              </div>
              <span className="font-mono text-xs text-blue-400 font-semibold">{maxHistorySteps} Steps</span>
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {[16, 32, 64, 128, 256, 512].map((steps) => (
                <button
                  key={steps}
                  type="button"
                  onClick={() => actions.setMaxHistorySteps(steps)}
                  className={`py-1.5 rounded border text-[11px] font-mono font-semibold transition-all cursor-pointer text-center ${
                    maxHistorySteps === steps
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-[#141418] border-[#2d2d38] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {steps}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-zinc-500">
              Min 16 steps, default 64 steps, up to 512 steps in memory.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-4 bg-[#141418] border-t border-[#262630] flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={resetAllDefaults}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-[#202028] hover:bg-[#282832] border border-[#2e2e38] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
