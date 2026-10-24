import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { exportLayoutEngineYaml, parseTetherYaml } from '../../core/layoutSerializer';
import { LayoutNode } from '../../types/layout';
import { 
  FileCode2, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// Enhanced YAML Syntax Highlighter
const renderYamlLines = (yamlText: string) => {
  return yamlText.split('\n').map((line, idx) => {
    let highlighted: React.ReactNode = line;

    const trimmed = line.trim();

    // 1. Comments
    if (trimmed.startsWith('#')) {
      highlighted = <span className="text-zinc-500 italic">{line}</span>;
    } 
    // 2. Dash Item / Object indicator: "- Panel:" or "- Text:"
    else {
      const kvMatch = line.match(/^(\s*)(-\s*)?([a-zA-Z0-9_-]+):(.*)$/);
      if (kvMatch) {
        const indent = kvMatch[1] || '';
        const dash = kvMatch[2] || '';
        const key = kvMatch[3];
        const rest = kvMatch[4] || '';

        const trimmedRest = rest.trim();
        let styledRest: React.ReactNode = rest;

        // Quoted strings
        if (trimmedRest.startsWith('"') && trimmedRest.endsWith('"')) {
          styledRest = <span className="text-emerald-400 font-medium">{rest}</span>;
        } else if (trimmedRest.startsWith("'") && trimmedRest.endsWith("'")) {
          styledRest = <span className="text-emerald-400 font-medium">{rest}</span>;
        }
        // Bracketed array: e.g. [0, 15] or [255, 255, 255, 255]
        else if (trimmedRest.startsWith('[') && trimmedRest.endsWith(']')) {
          styledRest = <span className="text-amber-300 font-bold">{rest}</span>;
        }
        // Booleans
        else if (trimmedRest === 'true' || trimmedRest === 'false') {
          styledRest = <span className="text-purple-400 font-bold">{rest}</span>;
        }
        // Numbers
        else if (!isNaN(parseFloat(trimmedRest)) && !trimmedRest.includes(' ')) {
          styledRest = <span className="text-sky-300 font-bold">{rest}</span>;
        }
        // Flow Enums
        else if (['ROW', 'COLUMN', 'NONE', 'START', 'CENTER', 'END', 'SPACE_BETWEEN'].includes(trimmedRest)) {
          styledRest = <span className="text-yellow-400 font-bold">{rest}</span>;
        }

        const isWidgetType = [
          'Panel', 'Text', 'Button', 'Image', 'Heading', 'Input', 
          'Badge', 'Card', 'Scroll', 'Spacer', 'Divider', 'children', 'content'
        ].includes(key);

        highlighted = (
          <>
            <span className="text-zinc-600">{indent}</span>
            {dash && <span className="text-amber-500 font-bold">{dash}</span>}
            <span className={isWidgetType ? 'text-amber-400 font-bold' : 'text-blue-400 font-medium'}>
              {key}:
            </span>
            {styledRest}
          </>
        );
      }
    }

    return (
      <div key={idx} className="h-5 leading-5 whitespace-pre">
        {highlighted || ' '}
      </div>
    );
  });
};

export const LiveYamlPanel: React.FC = () => {
  const { rootNode, metricsMap, showMetrics, actions } = useEditorStore();
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<{ valid: boolean; nodeCount: number }>({
    valid: true,
    nodeCount: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync from Store -> Code ONLY when editor is NOT focused by user
  useEffect(() => {
    if (!isFocused) {
      const generated = exportLayoutEngineYaml(rootNode, metricsMap);
      setCode(generated);
      setParseError(null);

      const countNodes = (n: LayoutNode): number => 1 + (n.children ? n.children.reduce((acc, c) => acc + countNodes(c), 0) : 0);
      setParseStatus({
        valid: true,
        nodeCount: countNodes(rootNode),
      });
    }
  }, [rootNode, metricsMap, isFocused]);

  const handleParseAndUpdate = (yamlText: string) => {
    try {
      const parsed = parseTetherYaml(yamlText);
      const countNodes = (n: LayoutNode): number => 1 + (n.children ? n.children.reduce((acc, c) => acc + countNodes(c), 0) : 0);
      const total = countNodes(parsed);

      setParseError(null);
      setParseStatus({ valid: true, nodeCount: total });
      actions.loadCustomRootNode(parsed);
    } catch (e: any) {
      setParseError(e.message || 'Invalid YAML format');
      setParseStatus({ valid: false, nodeCount: 0 });
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCode = e.target.value;
    setCode(nextCode);
    handleParseAndUpdate(nextCode);
  };

  // Tab key indentation support (inserts 2 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(nextCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);

      handleParseAndUpdate(nextCode);
    }
  };

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
    const generated = exportLayoutEngineYaml(rootNode, metricsMap);
    setCode(generated);
    setParseError(null);
  };

  if (!showMetrics) return null;

  const linesCount = code.split('\n').length;

  return (
    <div className="h-full bg-[#121215] border-t border-[#27272e] flex flex-col select-none text-xs overflow-hidden">
      {/* Title & Action Bar */}
      <div className="h-7 px-3 bg-[#0f0f12] border-b border-[#242429] flex items-center justify-between text-zinc-300 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-100 flex-shrink-0">
            Live YAML Script Editor
          </span>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 ml-2 font-mono text-[10px]">
            <div className={`w-2 h-2 rounded-full ${parseStatus.valid ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={parseStatus.valid ? 'text-emerald-300 font-semibold' : 'text-amber-300'}>
              {parseStatus.valid ? `Live Synced (${parseStatus.nodeCount} nodes)` : 'Editing...'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReSync}
            title="Re-generate and format YAML from active canvas"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1a1a20] hover:bg-[#25252e] border border-[#2e2e38] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Re-Sync</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1a1a20] hover:bg-[#25252e] border border-[#2e2e38] text-zinc-300 hover:text-white text-[10px] transition-colors"
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

      {/* Optional Syntax Pending Banner */}
      {parseError && (
        <div className="px-3 py-1 bg-amber-950/60 border-b border-amber-900/60 text-amber-300 text-[10px] font-mono flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Editor Body: Pixel-Perfect Dual-Layer Syntax Highlighted Editor */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[11px] bg-[#121215]">
        {/* Line Numbers Gutter */}
        <div className="w-10 py-2.5 bg-[#0d0d10] border-r border-[#1e1e24] text-zinc-600 select-none text-right pr-2 overflow-hidden flex-shrink-0 font-mono text-[11px] leading-5">
          {Array.from({ length: Math.max(linesCount, 1) }).map((_, i) => (
            <div key={i} className="h-5 leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Dual Layer Workspace with Identical Box Model */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Background */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-2.5 m-0 bg-transparent text-transparent font-mono text-[11px] leading-5 overflow-hidden pointer-events-none whitespace-pre select-none"
          >
            {renderYamlLines(code)}
          </pre>

          {/* Foreground Editable Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 p-2.5 m-0 bg-transparent text-zinc-100 font-mono text-[11px] leading-5 resize-none outline-none overflow-auto custom-scrollbar whitespace-pre caret-white selection:bg-blue-600/40"
            placeholder="# Layout Engine YAML Editor&#10;Panel:&#10;  id: &quot;root&quot;&#10;  flow: COLUMN"
          />
        </div>
      </div>
    </div>
  );
};
