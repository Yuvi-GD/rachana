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
  HelpCircle,
  Ban
} from 'lucide-react';

interface LayoutGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideSection = 'containers' | 'why-no-block' | 'slot-properties' | 'scrolling' | 'primitives';

interface NavItem {
  id: GuideSection;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'containers',
    title: 'Container Archetypes',
    subtitle: 'The 4 modern layout models',
    icon: <Box className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'why-no-block',
    title: 'Why No Block or Inline?',
    subtitle: 'Why legacy CSS is obsolete',
    icon: <Ban className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'slot-properties',
    title: 'Slot vs Intrinsic Rules',
    subtitle: 'Parent rules vs child rules',
    icon: <Sliders className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'scrolling',
    title: 'Scrolling & Overflow',
    subtitle: 'Scrolling is a property, not a container',
    icon: <Layers className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'primitives',
    title: 'Leaf Primitives',
    subtitle: 'Text, Button, Input, Image, Spacer',
    icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
  },
];

export const LayoutGuideModal: React.FC<LayoutGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<GuideSection>('containers');

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
        {/* Header */}
        <div className="h-14 px-5 bg-[#1a1a20] border-b border-[#262632] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Modern UI Layout Standard
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Standard Guide
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">Clear definitions of modern container layout models and properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close Guide (Esc)"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#262633] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Layout: Left Navigation Sidebar + Right Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 bg-[#121215] border-r border-[#24242e] p-3 flex flex-col gap-1 flex-shrink-0">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Guide Topics
            </span>
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e1e27] border border-[#373748] text-white shadow-sm'
                      : 'hover:bg-[#18181f] border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className={`p-1 rounded mt-0.5 ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-auto p-3 rounded-lg bg-[#181820] border border-[#262633] space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Core Principle</span>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Modern UI layout relies solely on <strong>Flex</strong>, <strong>Grid</strong>, and <strong>Relative Coordinates</strong>. Legacy block and float hacks are removed.
              </p>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 bg-[#16161a] p-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-6">
            {/* 1. CONTAINER ARCHETYPES */}
            {activeSection === 'containers' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">The 4 Modern Container Archetypes</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Every visual layout in modern user interfaces (Unreal UMG, Flutter, React, Figma) boils down to exactly 4 container models:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Flex Column */}
                  <div className="p-4 bg-[#1a1a21] border border-[#2b2b38] rounded-lg space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                        <Rows className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">1. Flex Column (Vertical Stack)</h4>
                        <span className="font-mono text-[10px] text-cyan-400">display: flex; flex-direction: column;</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-xs">
                      The default container for building UIs. Stacks child elements top-to-bottom.
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1 bg-[#131317] p-2.5 rounded border border-[#22222c]">
                      <li><strong>Use for:</strong> Forms, card bodies, setting panels, sidebars, page stacks.</li>
                      <li><strong>Key benefits:</strong> Simple <code className="text-cyan-300">gap</code> between items, no margin collapse bugs, automatic child stretching.</li>
                    </ul>
                  </div>

                  {/* Flex Row */}
                  <div className="p-4 bg-[#1a1a21] border border-[#2b2b38] rounded-lg space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Columns className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">2. Flex Row (Horizontal Flow)</h4>
                        <span className="font-mono text-[10px] text-blue-400">display: flex; flex-direction: row;</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-xs">
                      Places child elements side-by-side in a horizontal row.
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1 bg-[#131317] p-2.5 rounded border border-[#22222c]">
                      <li><strong>Use for:</strong> Navbars, toolbars, button bars, icon+label tags, breadcrumbs.</li>
                      <li><strong>Key benefits:</strong> Easy vertical alignment (<code className="text-blue-300">align-items: center</code>) and clean multi-line wrap support.</li>
                    </ul>
                  </div>

                  {/* CSS Grid */}
                  <div className="p-4 bg-[#1a1a21] border border-[#2b2b38] rounded-lg space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30">
                        <Grid3X3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">3. CSS Grid (2D Matrix Tracks)</h4>
                        <span className="font-mono text-[10px] text-purple-400">display: grid; grid-template-columns: 1fr 1fr;</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-xs">
                      Controls columns and rows at the same time in a clean 2D matrix.
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1 bg-[#131317] p-2.5 rounded border border-[#22222c]">
                      <li><strong>Use for:</strong> Product cards, dashboard widgets, photo galleries, spreadsheets.</li>
                      <li><strong>Key benefits:</strong> Flexible fractional sizing (<code className="text-purple-300">1fr 1fr</code>) and multi-column child spanning.</li>
                    </ul>
                  </div>

                  {/* Freeform Canvas */}
                  <div className="p-4 bg-[#1a1a21] border border-[#2b2b38] rounded-lg space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-amber-600/20 text-amber-400 border border-amber-500/30">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">4. Freeform Canvas (Coordinates)</h4>
                        <span className="font-mono text-[10px] text-amber-400">position: relative;</span>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-xs">
                      A coordinate space where children can be positioned with exact X/Y coordinates.
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1 bg-[#131317] p-2.5 rounded border border-[#22222c]">
                      <li><strong>Use for:</strong> Notification badges over avatars, floating action buttons (FAB), HUD overlays, drag-and-drop boards.</li>
                      <li><strong>Key benefits:</strong> Children use <code className="text-amber-300">top</code>, <code className="text-amber-300">left</code>, and <code className="text-amber-300">z-index</code> to layer freely.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2. WHY NO BLOCK OR INLINE */}
            {activeSection === 'why-no-block' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Why Legacy &apos;Block&apos; and &apos;Inline&apos; Are Removed</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    In old HTML/CSS tutorials, people used <code className="text-amber-300 bg-[#22222c] px-1 py-0.5 rounded">display: block</code>, <code className="text-amber-300 bg-[#22222c] px-1 py-0.5 rounded">display: inline-block</code>, and <code className="text-amber-300 bg-[#22222c] px-1 py-0.5 rounded">float: left</code>. Here is why modern UI architectures replace them completely:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-[#1b1b22] border border-[#2c2c3a] rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">1. &apos;display: block&apos; is just an inferior Flex Column</h4>
                    <p className="text-zinc-300 text-xs">
                      A &quot;block&quot; merely stacks elements vertically, but has severe limitations:
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside mt-1.5 space-y-1">
                      <li><strong>No gap property:</strong> To space items, you had to add <code className="text-zinc-300">margin-bottom</code> to every child, which resulted in unwanted extra spacing on the last item.</li>
                      <li><strong>Margin collapse bugs:</strong> Vertical margins between blocks unpredictably merge into one another.</li>
                      <li><strong>No alignment controls:</strong> Centering or stretching children required complex CSS tricks.</li>
                      <li><strong>Modern replacement:</strong> <strong className="text-cyan-400">Flex Column</strong> natively provides clean <code className="text-cyan-300">gap</code>, perfect vertical distribution, and automatic child stretching.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#1b1b22] border border-[#2c2c3a] rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">2. &apos;inline-block&apos; causes phantom spacing and alignment glitches</h4>
                    <p className="text-zinc-300 text-xs">
                      Inline-block treated UI elements like text characters:
                    </p>
                    <ul className="text-zinc-400 text-[11px] list-disc list-inside mt-1.5 space-y-1">
                      <li><strong>Ghost whitespace:</strong> HTML linebreaks between tags created unremovable 4px gaps on the screen.</li>
                      <li><strong>Baseline jumping:</strong> An item containing text shifted the vertical baseline of other elements next to it.</li>
                      <li><strong>Modern replacement:</strong> <strong className="text-blue-400">Flex Row</strong> gives exact pixel control, clean spacing with <code className="text-blue-300">gap</code>, and automatic vertical centering with <code className="text-blue-300">align-items: center</code>.</li>
                    </ul>
                  </div>
                </div>

                {/* Direct Migration Cheatsheet */}
                <div className="border border-[#282836] rounded-lg overflow-hidden">
                  <div className="bg-[#1a1a22] px-3.5 py-2 border-b border-[#292938] font-bold text-xs text-zinc-200">
                    Quick Modern Replacement Cheatsheet
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#141418] border-b border-[#22222e] text-zinc-400 font-semibold">
                        <th className="p-2.5">Old CSS Hack</th>
                        <th className="p-2.5 text-emerald-400">Modern Standard</th>
                        <th className="p-2.5">Why It&apos;s Better</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#22222e] text-[11px]">
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">display: block + margin-bottom</td>
                        <td className="p-2.5 font-mono text-cyan-300">Flex Column + gap: 12px</td>
                        <td className="p-2.5 text-zinc-400">No extra margin on the last item; zero margin collapse.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">float: left + clearfix</td>
                        <td className="p-2.5 font-mono text-blue-300">Flex Row + gap: 12px</td>
                        <td className="p-2.5 text-zinc-400">Container automatically wraps and encloses children.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">margin: 0 auto</td>
                        <td className="p-2.5 font-mono text-blue-300">justify-content: center</td>
                        <td className="p-2.5 text-zinc-400">Parent centrally controls alignment without fixed child widths.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">vertical-align: middle</td>
                        <td className="p-2.5 font-mono text-blue-300">align-items: center</td>
                        <td className="p-2.5 text-zinc-400">Pixel-perfect centering for icons and text labels.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-rose-400">&lt;ScrollView&gt; wrapper tag</td>
                        <td className="p-2.5 font-mono text-purple-300">overflow-y: auto</td>
                        <td className="p-2.5 text-zinc-400">Any container can scroll. Zero extra DOM nesting.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. SLOT PROPERTIES VS INTRINSIC */}
            {activeSection === 'slot-properties' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Slot Properties vs Intrinsic Properties</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Understanding the difference between properties defined by the parent vs properties intrinsic to the element itself:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Container Properties */}
                  <div className="p-3.5 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wide mb-1">
                      1. Container Properties (Set on the Parent)
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      Rules that decide how the parent arranges its children.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">flex-direction</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">justify-content</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">align-items</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">gap (spacing)</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">grid-template-columns</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-blue-300">overflow-x / overflow-y</span>
                    </div>
                  </div>

                  {/* Slot Properties */}
                  <div className="p-3.5 bg-[#1a1a21] border border-amber-600/30 rounded-lg">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide mb-1">
                      2. Slot Properties (Set on Child — Context Dependent!)
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      Rules on a child element that <strong>only work if the parent container supports them</strong>. Outside that container type, they do nothing!
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="bg-[#121216] p-2.5 rounded border border-[#242432]">
                        <strong className="text-emerald-400">Inside a Flex Container (Row or Column):</strong>
                        <div className="font-mono text-[11px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-emerald-300">flex-grow (fill ratio)</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-emerald-300">flex-shrink</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-emerald-300">flex-basis</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-emerald-300">align-self</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-emerald-300">order</span>
                        </div>
                      </div>
                      <div className="bg-[#121216] p-2.5 rounded border border-[#242432]">
                        <strong className="text-purple-400">Inside a Grid Container:</strong>
                        <div className="font-mono text-[11px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-purple-300">grid-column (e.g. 1 / 3)</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-purple-300">grid-row (e.g. span 2)</span>
                        </div>
                      </div>
                      <div className="bg-[#121216] p-2.5 rounded border border-[#242432]">
                        <strong className="text-amber-400">Inside a Freeform Canvas:</strong>
                        <div className="font-mono text-[11px] text-zinc-300 mt-1 flex flex-wrap gap-1.5">
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">position: absolute</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">top, left, right, bottom</span>
                          <span className="bg-[#1b1b24] px-2 py-0.5 rounded border border-[#343444] text-amber-300">z-index</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Intrinsic Properties */}
                  <div className="p-3.5 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wide mb-1">
                      3. Intrinsic Properties (Universal to Elements)
                    </h4>
                    <p className="text-zinc-300 text-xs mb-2">
                      Visual properties that belong strictly to the element regardless of container.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">width / height</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">min/max width/height</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">padding / margin</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">background-color</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">border & radius</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">color & fontSize</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">opacity</span>
                      <span className="p-1.5 bg-[#121216] rounded border border-[#262633] text-zinc-300">cursor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SCROLLING & OVERFLOW */}
            {activeSection === 'scrolling' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Scrolling is an Overflow Property, Not a Container</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Why Rachana Editor does not have a fake &quot;ScrollView&quot; container widget:
                  </p>
                </div>

                <div className="p-4 bg-[#1a1a21] border border-[#2b2b38] rounded-lg space-y-3">
                  <h4 className="font-bold text-purple-400 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Any container can scroll!
                  </h4>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    In HTML/CSS, scrolling is an orthogonal behavior controlled by <code className="text-purple-300">overflow-y: auto</code> or <code className="text-purple-300">overflow-x: auto</code>.
                  </p>
                  <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-1.5 bg-[#131317] p-3 rounded border border-[#22222c]">
                    <li><strong>Want a vertically scrolling feed?</strong> Create a <strong>Flex Column</strong> and set <code className="text-purple-300">Overflow Y: auto</code> (or click &quot;Scroll Y&quot; preset).</li>
                    <li><strong>Want a horizontal photo reel?</strong> Create a <strong>Flex Row</strong> and set <code className="text-purple-300">Overflow X: auto</code> (or click &quot;Scroll X&quot; preset).</li>
                    <li><strong>Want a 2D pannable map?</strong> Create a <strong>Grid</strong> or <strong>Canvas</strong> and set <code className="text-purple-300">Both</code>.</li>
                  </ul>
                  <p className="text-zinc-400 text-xs">
                    This keeps your layout tree clean, eliminates useless wrapper divs, and makes responsive scrolling intuitive.
                  </p>
                </div>
              </div>
            )}

            {/* 5. PRIMITIVES REFERENCE */}
            {activeSection === 'primitives' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Intrinsic Leaf Primitives</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Leaf elements that render concrete UI components and do not manage container layouts:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-emerald-400 block mb-1 text-sm">Text Block</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Typography element for headings, paragraphs, and labels.</p>
                    <span className="font-mono text-[10px] text-zinc-500">fontSize, fontWeight, color, textAlign, lineHeight</span>
                  </div>

                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-sky-400 block mb-1 text-sm">Button</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Interactive clickable widget with hover and focus states.</p>
                    <span className="font-mono text-[10px] text-zinc-500">padding, backgroundColor, borderColor, cursor: pointer</span>
                  </div>

                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-indigo-400 block mb-1 text-sm">Text Input</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Editable form text box with placeholder and initial value.</p>
                    <span className="font-mono text-[10px] text-zinc-500">placeholder, textContent, padding, borderStyle</span>
                  </div>

                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-orange-400 block mb-1 text-sm">Image Asset</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Media image element with source URL and aspect-ratio fit.</p>
                    <span className="font-mono text-[10px] text-zinc-500">src, objectFit (cover, contain, fill), aspectRatio</span>
                  </div>

                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-zinc-300 block mb-1 text-sm">Divider</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Visual partition line for separating layout sections.</p>
                    <span className="font-mono text-[10px] text-zinc-500">height: 1px, width: 100%, backgroundColor</span>
                  </div>

                  <div className="p-3 bg-[#1a1a21] border border-[#2b2b38] rounded-lg">
                    <strong className="text-pink-400 block mb-1 text-sm">Spacer</strong>
                    <p className="text-zinc-400 text-[11px] mb-1.5">Flexible expander configured with flex-grow: 1 to push siblings apart.</p>
                    <span className="font-mono text-[10px] text-zinc-500">flex-grow: 1, min-width: 16px</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-11 px-5 bg-[#141418] border-t border-[#24242e] flex items-center justify-between text-[11px] text-zinc-500 flex-shrink-0">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#22222f] text-zinc-300 font-mono text-[10px] border border-[#333344]">Esc</kbd> or click outside to dismiss</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded bg-[#22222b] hover:bg-[#2b2b38] text-zinc-200 font-semibold border border-[#353545] transition-colors cursor-pointer text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
