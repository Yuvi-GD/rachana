import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  title: string;
  items: Array<{
    keys: string[];
    description: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutCategory[] = [
  {
    title: 'General & Navigation',
    items: [
      { keys: ['F1'], description: 'Open Layout & Architecture Guide' },
      { keys: ['?'], description: 'Open Keyboard Shortcuts cheatsheet' },
      { keys: ['Ctrl', ','], description: 'Open Studio Settings' },
      { keys: ['Esc'], description: 'Stop Simulation / Close Modal / Deselect' },
      { keys: ['Mouse Wheel'], description: 'Zoom canvas in / out' },
      { keys: ['Middle Drag'], description: 'Pan canvas workspace' },
      { keys: ['Ctrl', '0'], description: 'Reset canvas zoom to 100%' },
    ],
  },
  {
    title: 'Simulation & Runtime Preview',
    items: [
      { keys: ['F5'], description: 'Toggle live preview simulation mode' },
      { keys: ['Esc'], description: 'Exit simulation back to editor' },
    ],
  },
  {
    title: 'Editing & Hierarchy',
    items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo canvas layout change' },
      { keys: ['Ctrl', 'Y'], description: 'Redo canvas layout change' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo alternative' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected element(s) with _0, _1 naming' },
      { keys: ['Del'], description: 'Delete selected element(s)' },
      { keys: ['Backspace'], description: 'Delete selected element(s)' },
      { keys: ['Ctrl / ⌘', 'Click'], description: 'Toggle multi-selection in tree list' },
      { keys: ['Shift', 'Click'], description: 'Select range of items in tree list' },
      { keys: ['Single Click Canvas'], description: 'Deselect current element' },
    ],
  },
  {
    title: 'Script & Synchronization',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Sync code editor to canvas' },
      { keys: ['Tab'], description: 'Indent 2 spaces in script editor' },
    ],
  },
  {
    title: 'Property Copy & Paste Pipeline',
    items: [
      { keys: ['Shift', 'Right Click'], description: 'Copy element style properties' },
      { keys: ['Shift', 'Left Click'], description: 'Paste copied properties to element' },
    ],
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#16161a] border border-[#2c2c36] rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-300 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 bg-[#1b1b22] border-b border-[#292934] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-zinc-500">Quick reference cheatsheet for Rachana Layout Editor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close Shortcuts (Esc)"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#282834] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 max-h-[75vh]">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="bg-[#1a1a20] border border-[#2b2b36] rounded-lg p-3">
              <h3 className="text-xs font-semibold text-zinc-200 mb-2.5 pb-1 border-b border-[#2b2b36]">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#24242e] border border-[#383848] rounded text-zinc-200 shadow-xs">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && <span className="text-zinc-600 text-[10px]">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-10 px-4 bg-[#141418] border-t border-[#252530] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-[#202028] border border-[#30303c] rounded text-zinc-400 font-mono">?</kbd> or <kbd className="px-1.5 py-0.5 bg-[#202028] border border-[#30303c] rounded text-zinc-400 font-mono">Esc</kbd> anytime to toggle</span>
          <span className="text-[10px] text-zinc-500 font-mono">Click outside to dismiss</span>
        </div>
      </div>
    </div>
  );
};

