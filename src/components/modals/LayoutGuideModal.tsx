import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Columns, 
  Rows, 
  Grid3X3, 
  Box, 
  Layers, 
  Sliders, 
  Sparkles
} from 'lucide-react';

interface LayoutGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideSection = 'modern-vs-legacy' | 'modern-elements' | 'container-slot-sizing';

interface NavItem {
  id: GuideSection;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'modern-vs-legacy',
    title: 'Modern vs Legacy Code',
    subtitle: 'Why modern UI replaces legacy code',
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'modern-elements',
    title: 'Modern Elements',
    subtitle: 'Containers and primitives in one list',
    icon: <Box className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'container-slot-sizing',
    title: 'Container vs Slot & Sizing',
    subtitle: 'Parent rules, child slots, and sizing',
    icon: <Sliders className="w-4 h-4 text-emerald-400" />,
  },
];

export const LayoutGuideModal: React.FC<LayoutGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<GuideSection>('modern-vs-legacy');

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[88vh] bg-[#151518] border border-[#2b2b36] rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-300 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Clean Header */}
        <div className="h-12 px-5 bg-[#18181d] border-b border-[#24242e] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-100">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Layout Guide</span>
          </div>
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#252530] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Layout: Left Navigation Sidebar + Right Content Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 bg-[#121215] border-r border-[#22222b] p-3 flex flex-col gap-1.5 flex-shrink-0">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Navigation
            </span>
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e1e27] border border-[#353545] text-white shadow-sm'
                      : 'hover:bg-[#18181f] border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className={`p-1 rounded mt-0.5 ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                      {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate leading-tight mt-1">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-auto p-3 rounded-lg bg-[#181820] border border-[#242430] text-[10px] text-zinc-400 space-y-1">
              <span className="font-bold text-emerald-400 block uppercase">Standard</span>
              <p className="leading-normal">
                Modern layouts use Flex, Grid, and Relative Coordinates. Legacy block, inline, and float hacks are not used.
              </p>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 bg-[#16161a] p-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-6">
            {/* 1. MODERN VS LEGACY CODE */}
            {activeSection === 'modern-vs-legacy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Modern vs Legacy Code</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Why modern UI architecture replaces legacy CSS hacks with structured layout models.
                  </p>
                </div>

                {/* Why Behind */}
                <div className="space-y-3">
                  <div className="p-4 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-2">
                    <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wide">
                      The Problems with Legacy CSS
                    </h4>
                    <p className="text-zinc-300 text-xs">
                      Legacy CSS was created for text documents rather than software interfaces. Layouts relied on block, float, inline-block, and clear hacks:
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1.5 bg-[#121216] p-3 rounded border border-[#22222b]">
                      <li>
                        <strong className="text-zinc-200">Margin Collapse:</strong> Vertical margins on block elements unpredictably merged into each other.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Ghost Whitespace:</strong> Using inline-block caused HTML whitespace between tags to render as unwanted 4px gaps on screen.
                      </li>
                      <li>
                        <strong className="text-zinc-200">No Native Spacing:</strong> Spacing required adding margin to children, creating unwanted extra margins on the final child.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Centering Hacks:</strong> Centering required margin: 0 auto or negative translation tricks.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Content-Box Expansion:</strong> Adding 16px padding to a 100px element expanded width to 132px, breaking grid alignments.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-2">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wide">
                      Why Modern Architecture Replaces Them
                    </h4>
                    <p className="text-zinc-300 text-xs">
                      Modern layout systems (Flexbox, CSS Grid, Flutter, Unreal UMG) define explicit axes and parent-managed spacing:
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1.5 bg-[#121216] p-3 rounded border border-[#22222b]">
                      <li>
                        <strong className="text-zinc-200">Universal Border-Box:</strong> Dimensions include padding and borders directly, ensuring total size is completely predictable.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Consistent Gap:</strong> The parent container sets gap between children. No child margins, no margin collapse.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Predictable Sizing:</strong> Items align and stretch along cross axes automatically without baseline jumping.
                      </li>
                      <li>
                        <strong className="text-zinc-200">Zero Wrapper Bloat:</strong> Clean structure without clearfix divs or fake scroll wrappers.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Direct Comparison Table */}
                <div className="border border-[#262634] rounded-lg overflow-hidden">
                  <div className="bg-[#191920] px-4 py-2 border-b border-[#252530] font-bold text-xs text-zinc-200">
                    Legacy CSS vs Modern Architecture Cheatsheet
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#121216] border-b border-[#20202a] text-zinc-400 font-semibold text-[11px]">
                        <th className="p-2.5">Legacy Pattern</th>
                        <th className="p-2.5 text-emerald-400">Modern Replacement</th>
                        <th className="p-2.5">Why It Is Better</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f28] text-[11px]">
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">display: block + margin-bottom</td>
                        <td className="p-2.5 font-mono text-cyan-300">Flex Column + gap: 12px</td>
                        <td className="p-2.5 text-zinc-400">No extra margin on last child; zero margin collapse bugs.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">float: left + clearfix</td>
                        <td className="p-2.5 font-mono text-blue-300">Flex Row + gap: 12px</td>
                        <td className="p-2.5 text-zinc-400">Container encloses children automatically without clearing hacks.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">inline-block + font-size: 0</td>
                        <td className="p-2.5 font-mono text-blue-300">Flex Row + gap: 8px</td>
                        <td className="p-2.5 text-zinc-400">Eliminates ghost 4px HTML whitespace gaps between tags.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">margin: 0 auto</td>
                        <td className="p-2.5 font-mono text-blue-300">justify-content: center</td>
                        <td className="p-2.5 text-zinc-400">Centrally controlled by parent without fixed child width.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">calc(50% - 100px) / translate(-50%, -50%)</td>
                        <td className="p-2.5 font-mono text-blue-300">justify-content: center; align-items: center</td>
                        <td className="p-2.5 text-zinc-400">Pure parent alignment without coordinate math or transform blur.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">vertical-align: middle</td>
                        <td className="p-2.5 font-mono text-blue-300">align-items: center</td>
                        <td className="p-2.5 text-zinc-400">Pixel-perfect centering for mixed icons, text, and inputs.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">margin-top: -10px (negative margin)</td>
                        <td className="p-2.5 font-mono text-amber-300">position: relative (offsets) or Canvas</td>
                        <td className="p-2.5 text-zinc-400">Explicit anchor offsets without collapsing sibling flow coordinates.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">position: static</td>
                        <td className="p-2.5 font-mono text-emerald-300">position: relative (zero offsets)</td>
                        <td className="p-2.5 text-zinc-400">Identical normal flow, but provides coordinate anchor and z-index support.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">box-sizing: content-box</td>
                        <td className="p-2.5 font-mono text-emerald-300">box-sizing: border-box</td>
                        <td className="p-2.5 text-zinc-400">Total footprint matches width and height directly without padding expansion bugs.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">ScrollView wrapper tag</td>
                        <td className="p-2.5 font-mono text-purple-300">overflow-y: auto</td>
                        <td className="p-2.5 text-zinc-400">Any container can scroll. Zero extra DOM nesting.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">display: table / percentage columns</td>
                        <td className="p-2.5 font-mono text-purple-300">display: grid; repeat(auto-fit, minmax(...))</td>
                        <td className="p-2.5 text-zinc-400">Flexible fractional columns with auto-wrapping without media queries.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. MODERN ELEMENTS (CONTAINERS & PRIMITIVES IN ONE LIST) */}
            {activeSection === 'modern-elements' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Modern Elements: Containers & Primitives</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    The complete set of elements used in modern UI layout, categorized into Containers and Leaf Primitives.
                  </p>
                </div>

                {/* Section A: Containers */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                    Part 1: Containers (Orchestrate Layout of Children)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Flex Column */}
                    <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                          <Rows className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-xs">Flex Column (Vertical Stack)</h4>
                          <span className="font-mono text-[10px] text-cyan-400">display: flex; flex-direction: column;</span>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        Stacks child elements vertically. Default choice for forms, cards, sidebars, and panels.
                      </p>
                      <div className="text-[10px] text-zinc-400 font-mono bg-[#121216] p-2 rounded border border-[#22222b]">
                        Key properties: gap, align-items: stretch, justify-content
                      </div>
                    </div>

                    {/* Flex Row */}
                    <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          <Columns className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-xs">Flex Row (Horizontal Flow)</h4>
                          <span className="font-mono text-[10px] text-blue-400">display: flex; flex-direction: row;</span>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        Arranges child elements horizontally. Used for navbars, toolbars, buttons, and tag rows.
                      </p>
                      <div className="text-[10px] text-zinc-400 font-mono bg-[#121216] p-2 rounded border border-[#22222b]">
                        Key properties: gap, align-items: center, flex-wrap
                      </div>
                    </div>

                    {/* CSS Grid */}
                    <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30">
                          <Grid3X3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-xs">CSS Grid (2D Matrix Tracks)</h4>
                          <span className="font-mono text-[10px] text-purple-400">display: grid; grid-template-columns: 1fr 1fr;</span>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        Controls rows and columns simultaneously. Used for dashboards, cards, and image galleries.
                      </p>
                      <div className="text-[10px] text-zinc-400 font-mono bg-[#121216] p-2 rounded border border-[#22222b]">
                        Key properties: grid-template-columns, gap
                      </div>
                    </div>

                    {/* Freeform Canvas */}
                    <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/30">
                          <Box className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-xs">Freeform Canvas (Coordinates)</h4>
                          <span className="font-mono text-[10px] text-amber-400">position: relative;</span>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-[11px]">
                        Bounding container for placing items with coordinates. Used for badges, overlays, and HUDs.
                      </p>
                      <div className="text-[10px] text-zinc-400 font-mono bg-[#121216] p-2 rounded border border-[#22222b]">
                        Key properties: top, left, right, bottom, z-index
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Primitives */}
                <div className="space-y-3 pt-2 border-t border-[#242430]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Part 2: Leaf Primitives (Render Visual Components, No Children)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Text Block</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Renders headings, labels, and paragraphs.</p>
                      <span className="font-mono text-[10px] text-zinc-500">fontSize, fontWeight, color, textAlign</span>
                    </div>

                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Button</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Clickable element with hover feedback.</p>
                      <span className="font-mono text-[10px] text-zinc-500">padding, backgroundColor, cursor</span>
                    </div>

                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Text Input</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Form text field for user input.</p>
                      <span className="font-mono text-[10px] text-zinc-500">placeholder, textContent, border</span>
                    </div>

                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Image Asset</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Media image element with object-fit.</p>
                      <span className="font-mono text-[10px] text-zinc-500">src, objectFit (cover, contain)</span>
                    </div>

                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Divider</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Partition line for dividing sections.</p>
                      <span className="font-mono text-[10px] text-zinc-500">height: 1px, backgroundColor</span>
                    </div>

                    <div className="p-3 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                      <strong className="text-zinc-100 block mb-0.5 text-xs">Spacer</strong>
                      <p className="text-zinc-400 text-[11px] mb-1">Expander with flex-grow: 1 to separate items.</p>
                      <span className="font-mono text-[10px] text-zinc-500">flex-grow: 1, min-width: 16px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONTAINER VS SLOT & SIZING */}
            {activeSection === 'container-slot-sizing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Container Properties, Slot Properties & Sizing</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Understanding the rules that apply to parent containers vs child slots vs size constraints.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Container Properties */}
                  <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                    <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wide mb-1">
                      1. Container Properties (Set on the Parent)
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      Rules defined on the parent that organize, space, and align children as a collection:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">flex-direction</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">justify-content</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">align-items</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">gap (row-gap, col-gap)</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">grid-template-columns</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#242430] text-blue-300">overflow (X / Y)</span>
                    </div>
                  </div>

                  {/* Slot Properties */}
                  <div className="p-3.5 bg-[#1a1a21] border border-amber-600/30 rounded-lg">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide mb-1">
                      2. Slot Properties (Set on Child, Context Dependent)
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      Rules on an individual child that only take effect if the parent container supports that slot type. Outside that container type, they do nothing:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="bg-[#121216] p-2.5 rounded border border-[#22222e]">
                        <strong className="text-cyan-400">Inside a Flex Container (Row or Column):</strong>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-cyan-300">flex-grow (fill ratio)</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-cyan-300">flex-shrink</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-cyan-300">flex-basis</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-cyan-300">align-self</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-cyan-300">order</span>
                        </div>
                      </div>
                      <div className="bg-[#121216] p-2.5 rounded border border-[#22222e]">
                        <strong className="text-purple-400">Inside a Grid Container:</strong>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-purple-300">grid-column (span)</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-purple-300">grid-row</span>
                        </div>
                      </div>
                      <div className="bg-[#121216] p-2.5 rounded border border-[#22222e]">
                        <strong className="text-amber-400">Inside a Freeform Canvas:</strong>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">position: absolute</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">top, left, right, bottom</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">z-index</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sizing & Constraints */}
                  <div className="p-3.5 bg-[#1a1a21] border border-[#2a2a36] rounded-lg">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wide mb-1">
                      3. Sizing Rules & Constraints
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      How elements determine their visual footprint:
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1 bg-[#121216] p-2.5 rounded border border-[#22222e]">
                      <li><strong className="text-zinc-200">Fixed Units (px):</strong> Exact pixel dimensions (e.g. width: 240px).</li>
                      <li><strong className="text-zinc-200">Relative Units (%):</strong> Scales relative to parent container space.</li>
                      <li><strong className="text-zinc-200">Constraints (min / max):</strong> Ensures an element never shrinks below min or expands past max.</li>
                      <li><strong className="text-zinc-200">Fill Ratio (flex-grow):</strong> Dynamically claims remaining empty space along the parent axis.</li>
                    </ul>
                  </div>

                  {/* Scrolling as an Overflow Property */}
                  <div className="p-3.5 bg-[#1a1a21] border border-purple-800/40 rounded-lg space-y-1.5">
                    <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> 4. Scrolling is an Overflow Property
                    </h4>
                    <p className="text-zinc-300 text-xs">
                      Any container (Flex Column, Flex Row, Grid, Canvas) becomes scrollable simply by setting overflow-y: auto or overflow-x: auto in the Details panel. No fake ScrollView container widget is needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
