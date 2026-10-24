import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { exportLayoutEngineYaml, parseTetherYaml } from '../../core/layoutSerializer';
import { LayoutNode } from '../../types/layout';
import { 
  FileCode2, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronDown
} from 'lucide-react';

// YAML Syntax Highlighter
const renderYamlLines = (yamlText: string) => {
  return yamlText.split('\n').map((line, idx) => {
    let highlighted: React.ReactNode = line;

    // Comments
    if (line.trim().startsWith('#')) {
      highlighted = <span className="text-zinc-500 italic">{line}</span>;
    } else {
      // Key-Value matching: e.g. "  fill_ratio: 1.0" or "- Panel:"
      const kvMatch = line.match(/^(\s*(?:-\s*)?)([a-zA-Z0-9_-]+):(.*)$/);
      if (kvMatch) {
        const indent = kvMatch[1];
        const key = kvMatch[2];
        const rest = kvMatch[3];

        let styledRest: React.ReactNode = rest;
        const trimmedRest = rest.trim();

        if (trimmedRest.startsWith('"') && trimmedRest.endsWith('"')) {
          styledRest = <span className="text-emerald-300">{rest}</span>;
        } else if (trimmedRest.startsWith('[') && trimmedRest.endsWith(']')) {
          styledRest = <span className="text-amber-300 font-bold">{rest}</span>;
        } else if (trimmedRest === 'true' || trimmedRest === 'false') {
          styledRest = <span className="text-purple-400 font-bold">{rest}</span>;
        } else if (!isNaN(parseFloat(trimmedRest))) {
          styledRest = <span className="text-sky-300 font-bold">{rest}</span>;
        } else if (trimmedRest === 'ROW' || trimmedRest === 'COLUMN' || trimmedRest === 'CENTER' || trimmedRest === 'START' || trimmedRest === 'END') {
          styledRest = <span className="text-yellow-400 font-semibold">{rest}</span>;
        }

        const isPanelKey = key === 'Panel' || key === 'Text' || key === 'Button' || key === 'Image';

        highlighted = (
          <>
            <span className="text-zinc-600">{indent}</span>
            <span className={isPanelKey ? 'text-amber-400 font-bold' : 'text-blue-300 font-medium'}>
              {key}:
            </span>
            {styledRest}
          </>
        );
      }
    }

    return (
      <div key={idx} className="leading-5">
        {highlighted || ' '}
      </div>
    );
  });
};

export const LiveYamlPanel: React.FC = () => {
  const { rootNode, metricsMap, showMetrics, actions } = useEditorStore();
  const [code, setCode] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parseStatus, setParseStatus] = useState<{ valid: boolean; nodeCount: number; message: string }>({
    valid: true,
    nodeCount: 0,
    message: 'Synced',
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const userEditingTimer = useRef<number | null>(null);

  // Sync from Store -> Code when user is NOT actively typing
  useEffect(() => {
    if (!isUserEditing) {
      const generated = exportLayoutEngineYaml(rootNode, metricsMap);
      setCode(generated);

      const countNodes = (n: LayoutNode): number => 1 + (n.children ? n.children.reduce((acc, c) => acc + countNodes(c), 0) : 0);
      setParseStatus({
        valid: true,
        nodeCount: countNodes(rootNode),
        message: 'Live Synced',
      });
    }
  }, [rootNode, metricsMap, isUserEditing]);

  // Handle user typing in the YAML editor
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setIsUserEditing(true);

    if (userEditingTimer.current) clearTimeout(userEditingTimer.current);

    // Attempt live parse
    try {
      const parsed = parseTetherYaml(newCode);
      const countNodes = (n: LayoutNode): number => 1 + (n.children ? n.children.reduce((acc, c) => acc + countNodes(c), 0) : 0);
      const total = countNodes(parsed);

      setParseStatus({
        valid: true,
        nodeCount: total,
        message: `Valid (${total} widgets)`,
      });

      // Update store root node in real-time!
      actions.loadCustomRootNode(parsed);
    } catch {
      setParseStatus({
        valid: false,
        nodeCount: 0,
        message: 'Editing (syntax pending)',
      });
    }

    // Reset user editing flag 1.5 seconds after typing stops
    userEditingTimer.current = window.setTimeout(() => {
      setIsUserEditing(false);
    }, 1500);
  };

  // Sync scroll between textarea and pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReSync = () => {
    setIsUserEditing(false);
    const generated = exportLayoutEngineYaml(rootNode, metricsMap);
    setCode(generated);
  };

  if (!showMetrics) return null;

  const linesCount = code.split('\n').length;

  return (
    <div className="h-full bg-[#141417] border-t border-[#27272e] flex flex-col select-none text-xs overflow-hidden">
      {/* Title & Action Bar */}
      <div className="h-7 px-3 bg-[#111114] border-b border-[#242429] flex items-center justify-between text-zinc-300 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-100 flex-shrink-0">
            Live YAML Script Editor
          </span>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 ml-2 font-mono text-[10px]">
            <div className={`w-2 h-2 rounded-full ${parseStatus.valid ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={parseStatus.valid ? 'text-emerald-300' : 'text-amber-300'}>
              {parseStatus.message}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReSync}
            title="Re-generate and format YAML from active canvas"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1c1c22] hover:bg-[#25252e] border border-[#2f2f3a] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Re-Sync</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1c1c22] hover:bg-[#25252e] border border-[#2f2f3a] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className="h-3 w-[1px] bg-[#2a2a34] mx-0.5" />

          <button
            type="button"
            onClick={actions.toggleMetrics}
            className="text-zinc-500 hover:text-zinc-200 p-0.5"
            title="Minimize Script Drawer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body: Dual-Layer Syntax Highlighted Live Textarea */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[11px]">
        {/* Line Numbers Gutter */}
        <div className="w-9 py-2 bg-[#0e0e11] border-r border-[#202026] text-zinc-600 select-none text-right pr-2 overflow-hidden flex-shrink-0 font-mono text-[10px] leading-5">
          {Array.from({ length: Math.max(linesCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Dual Layer Workspace */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Background */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-2 m-0 bg-transparent text-transparent font-mono text-[11px] leading-5 overflow-hidden pointer-events-none whitespace-pre select-none"
          >
            {renderYamlLines(code)}
          </pre>

          {/* Foreground Editable Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 p-2 m-0 bg-transparent text-zinc-200 font-mono text-[11px] leading-5 resize-none outline-none overflow-auto custom-scrollbar whitespace-pre caret-white selection:bg-blue-600/40"
            placeholder="# Layout Engine YAML Editor&#10;Panel:&#10;  id: &quot;root&quot;&#10;  flow: COLUMN"
          />
        </div>
      </div>
    </div>
  );
};
