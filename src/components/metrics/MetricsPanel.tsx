import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  ChevronDown, 
  Terminal, 
  Ruler, 
  BoxSelect, 
  Layers 
} from 'lucide-react';

export const MetricsPanel: React.FC = () => {
  const { rootNode, selectedNodeId, showMetrics, metricsMap, actions } = useEditorStore();

  if (!showMetrics) return null;

  // Use selectedNodeId or fallback to root
  const activeId = selectedNodeId || rootNode.id;
  const currentMetric = metricsMap[activeId] || (Object.keys(metricsMap).length > 0 ? Object.values(metricsMap)[0] : null);

  // Collect all nodes in tree for quick inspection pill list
  const nodePills: { id: string; name: string }[] = [];
  const collectNodes = (n: typeof rootNode) => {
    nodePills.push({ id: n.id, name: n.name });
    n.children.forEach(collectNodes);
  };
  collectNodes(rootNode);

  return (
    <div className="h-full bg-[#161619] border-t border-[#27272e] flex flex-col select-none text-xs overflow-hidden">
      {/* Title Bar */}
      <div className="h-7 px-3 bg-[#131316] border-b border-[#242429] flex items-center justify-between text-zinc-300 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar mr-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-200 flex-shrink-0">
            Layout Engine Computed Geometry
          </span>

          {/* Quick Node Selector Pills */}
          <div className="flex items-center gap-1 ml-2">
            {nodePills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => actions.selectNode(pill.id)}
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono whitespace-nowrap border transition-colors ${
                  activeId === pill.id
                    ? 'bg-blue-600/40 border-blue-500 text-blue-300 font-bold'
                    : 'bg-[#1f1f24] border-[#2e2e36] text-zinc-400 hover:text-white'
                }`}
              >
                #{pill.id}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={actions.toggleMetrics}
          className="text-zinc-500 hover:text-zinc-200 p-0.5 flex-shrink-0"
          title="Minimize Metrics Panel"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Row: 3 clean columns without awkward scrollbars */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden grid grid-cols-12 divide-x divide-[#242429] p-2 custom-scrollbar">
        {/* Column 1: Bounding Client Rect */}
        <div className="col-span-3 px-2 flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
            <BoxSelect className="w-3.5 h-3.5 text-blue-400" />
            <span>Screen Bounding Rect</span>
          </div>

          {currentMetric ? (
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 text-[9px] block">X</span>
                <span className="text-blue-300 font-bold">
                  {Math.round(currentMetric.boundingRect.x * 10) / 10} px
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 text-[9px] block">Y</span>
                <span className="text-blue-300 font-bold">
                  {Math.round(currentMetric.boundingRect.y * 10) / 10} px
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 text-[9px] block">Width</span>
                <span className="text-emerald-300 font-bold">
                  {Math.round(currentMetric.boundingRect.width * 10) / 10} px
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 text-[9px] block">Height</span>
                <span className="text-emerald-300 font-bold">
                  {Math.round(currentMetric.boundingRect.height * 10) / 10} px
                </span>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-[11px] italic">Measuring elements...</div>
          )}
        </div>

        {/* Column 2: Box Model Layer Breakdown */}
        <div className="col-span-5 px-3 flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Box-Model Computed Dimensions</span>
          </div>

          {currentMetric ? (
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              {/* Margin */}
              <div className="bg-[#241a12] p-1.5 rounded border border-[#d97706]/40 text-amber-300">
                <div className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold">
                  Margin (px)
                </div>
                <div className="text-[10px] mt-0.5 space-y-0.5">
                  <div>T: {currentMetric.margin.top} | R: {currentMetric.margin.right}</div>
                  <div>B: {currentMetric.margin.bottom} | L: {currentMetric.margin.left}</div>
                </div>
              </div>

              {/* Padding */}
              <div className="bg-[#112117] p-1.5 rounded border border-[#16a34a]/40 text-emerald-300">
                <div className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Padding (px)
                </div>
                <div className="text-[10px] mt-0.5 space-y-0.5">
                  <div>T: {currentMetric.padding.top} | R: {currentMetric.padding.right}</div>
                  <div>B: {currentMetric.padding.bottom} | L: {currentMetric.padding.left}</div>
                </div>
              </div>

              {/* Content Box */}
              <div className="bg-[#101e2e] p-1.5 rounded border border-[#2563eb]/40 text-blue-300">
                <div className="text-[9px] uppercase tracking-wider text-blue-400 font-semibold">
                  Content Box
                </div>
                <div className="text-[10px] mt-0.5 space-y-0.5">
                  <div>W: {Math.round(currentMetric.contentBox.width)} px</div>
                  <div>H: {Math.round(currentMetric.contentBox.height)} px</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-[11px] italic">Measuring elements...</div>
          )}
        </div>

        {/* Column 3: Intrinsic & Scroll Geometry */}
        <div className="col-span-4 px-3 flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
            <Ruler className="w-3.5 h-3.5 text-purple-400" />
            <span>Intrinsic & Overflow Sizes</span>
          </div>

          {currentMetric ? (
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 block">scrollWidth/Height</span>
                <span className="text-purple-300 font-semibold">
                  {currentMetric.scroll.scrollWidth} × {currentMetric.scroll.scrollHeight}
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 block">clientWidth/Height</span>
                <span className="text-purple-300 font-semibold">
                  {currentMetric.scroll.clientWidth} × {currentMetric.scroll.clientHeight}
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 block">offsetWidth/Height</span>
                <span className="text-zinc-300">
                  {currentMetric.scroll.offsetWidth} × {currentMetric.scroll.offsetHeight}
                </span>
              </div>
              <div className="bg-[#1f1f24] px-2 py-1 rounded border border-[#2b2b32]">
                <span className="text-zinc-500 block">boxSizing</span>
                <span className="text-cyan-300">
                  {currentMetric.computedStyle.boxSizing}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-[11px] italic">Measuring elements...</div>
          )}
        </div>
      </div>
    </div>
  );
};
