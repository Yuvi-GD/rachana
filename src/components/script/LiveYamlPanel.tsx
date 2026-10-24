import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  exportLayoutEngineYaml, 
  parseTetherYaml, 
  exportLayoutEngineGoldenTest, 
  parseJsonLayout, 
  exportToHtmlCss, 
  parseHtmlLayout 
} from '../../core/layoutSerializer';
import { LayoutNode } from '../../types/layout';
import { 
  FileCode2, 
  Copy, 
  Check, 
  RotateCw, 
  Download, 
  Upload, 
  AlertCircle, 
  FileJson, 
  Code,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2
} from 'lucide-react';

export type ScriptFormat = 'yaml' | 'json' | 'html';

// -------------------------------------------------------------
// VS Code Dark+ Token Highlighting for YAML
// -------------------------------------------------------------
const renderYamlLine = (line: string): React.ReactNode => {
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) {
    return <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{line}</span>;
  }

  const kvMatch = line.match(/^(\s*)(-\s*)?([a-zA-Z0-9_-]+):(.*)$/);
  if (!kvMatch) {
    if (trimmed.startsWith('- ')) {
      return (
        <>
          <span style={{ color: '#6a9955' }}>{line.slice(0, line.indexOf('-'))}</span>
          <span style={{ color: '#d4d4d4', fontWeight: 'bold' }}>- </span>
          <span style={{ color: '#ce9178' }}>{line.slice(line.indexOf('-') + 2)}</span>
        </>
      );
    }
    return <span style={{ color: '#d4d4d4' }}>{line}</span>;
  }

  const indent = kvMatch[1] || '';
  const dash = kvMatch[2] || '';
  const key = kvMatch[3];
  const rest = kvMatch[4] || '';
  const trimmedRest = rest.trim();

  let styledRest: React.ReactNode = <span style={{ color: '#d4d4d4' }}>{rest}</span>;

  if ((trimmedRest.startsWith('"') && trimmedRest.endsWith('"')) ||
      (trimmedRest.startsWith("'") && trimmedRest.endsWith("'"))) {
    styledRest = <span style={{ color: '#ce9178' }}>{rest}</span>;
  } else if (trimmedRest.startsWith('[') && trimmedRest.endsWith(']')) {
    styledRest = <span style={{ color: '#ffd700' }}>{rest}</span>;
  } else if (trimmedRest === 'true' || trimmedRest === 'false' || trimmedRest === 'null') {
    styledRest = <span style={{ color: '#569cd6', fontWeight: 600 }}>{rest}</span>;
  } else if (!isNaN(parseFloat(trimmedRest)) && !trimmedRest.includes(' ')) {
    styledRest = <span style={{ color: '#b5cea8' }}>{rest}</span>;
  } else if (['ROW', 'COLUMN', 'NONE', 'START', 'CENTER', 'END', 'SPACE_BETWEEN'].includes(trimmedRest)) {
    styledRest = <span style={{ color: '#4fc1ff', fontWeight: 600 }}>{rest}</span>;
  }

  const isWidgetType = [
    'Panel', 'Text', 'Button', 'Image', 'Heading', 'Input', 
    'Badge', 'Card', 'Scroll', 'Spacer', 'Divider', 'children', 'content'
  ].includes(key);

  return (
    <>
      <span>{indent}</span>
      {dash && <span style={{ color: '#d4d4d4', fontWeight: 'bold' }}>{dash}</span>}
      <span style={{ color: isWidgetType ? '#4ec9b0' : '#9cdcfe', fontWeight: isWidgetType ? 600 : 400 }}>
        {key}:
      </span>
      {styledRest}
    </>
  );
};

// -------------------------------------------------------------
// VS Code Dark+ Token Highlighting for JSON
// -------------------------------------------------------------
const renderJsonLine = (line: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  // Tokenize regex for JSON: strings, numbers, booleans, null, symbols
  const tokenRegex = /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|(true|false|null)|([{}[\],:])|([^"\d{}\[\],:\s]+)/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} style={{ color: '#d4d4d4' }}>{line.substring(lastIndex, match.index)}</span>);
    }
    const [raw, str, num, boolNull, punct] = match;
    const key = match.index;

    if (str) {
      const isKey = line.substring(match.index + raw.length).trim().startsWith(':');
      parts.push(
        <span key={key} style={{ color: isKey ? '#9cdcfe' : '#ce9178' }}>
          {raw}
        </span>
      );
    } else if (num) {
      parts.push(<span key={key} style={{ color: '#b5cea8' }}>{raw}</span>);
    } else if (boolNull) {
      parts.push(<span key={key} style={{ color: '#569cd6', fontWeight: 600 }}>{raw}</span>);
    } else if (punct) {
      parts.push(<span key={key} style={{ color: punct === ':' ? '#d4d4d4' : '#ffd700' }}>{raw}</span>);
    } else {
      parts.push(<span key={key} style={{ color: '#d4d4d4' }}>{raw}</span>);
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex} style={{ color: '#d4d4d4' }}>{line.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : ' ';
};

// -------------------------------------------------------------
// VS Code Dark+ Token Highlighting for HTML/CSS
// -------------------------------------------------------------
const renderHtmlLine = (line: string): React.ReactNode => {
  const trimmed = line.trim();
  if (trimmed.startsWith('<!--') || trimmed.endsWith('-->')) {
    return <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{line}</span>;
  }

  // Tokenize HTML tags and attributes
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(<\/?[a-zA-Z0-9_-]+)|(\/?>)|([a-zA-Z0-9_-]+(?==))|(".*?")|([^<>"=]+)/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} style={{ color: '#d4d4d4' }}>{line.substring(lastIndex, match.index)}</span>);
    }
    const [raw, tag, closeTag, attr, attrVal] = match;
    const key = match.index;

    if (tag) {
      parts.push(<span key={key} style={{ color: '#569cd6' }}>{raw}</span>);
    } else if (closeTag) {
      parts.push(<span key={key} style={{ color: '#569cd6' }}>{raw}</span>);
    } else if (attr) {
      parts.push(<span key={key} style={{ color: '#9cdcfe' }}>{raw}</span>);
    } else if (attrVal) {
      parts.push(<span key={key} style={{ color: '#ce9178' }}>{raw}</span>);
    } else {
      parts.push(<span key={key} style={{ color: '#d4d4d4' }}>{raw}</span>);
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex} style={{ color: '#d4d4d4' }}>{line.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : ' ';
};

export const LiveYamlPanel: React.FC = () => {
  const { rootNode, metricsMap, showBottomPanel, showMetrics, isCodeMaximized, actions } = useEditorStore();
  const [format, setFormat] = useState<ScriptFormat>('yaml');
  const [code, setCode] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Synced');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVisible = showBottomPanel !== undefined ? showBottomPanel : showMetrics;

  // Generate code based on active format
  const generateCodeForFormat = (fmt: ScriptFormat, node: LayoutNode): string => {
    switch (fmt) {
      case 'yaml':
        return exportLayoutEngineYaml(node, metricsMap);
      case 'json':
        return JSON.stringify(exportLayoutEngineGoldenTest(node, metricsMap), null, 2);
      case 'html': {
        const { html, css } = exportToHtmlCss(node);
        return `<style>\n${css}\n</style>\n\n${html}`;
      }
    }
  };

  // Sync from Store -> Code when editor is NOT actively focused
  useEffect(() => {
    if (!isFocused) {
      const generated = generateCodeForFormat(format, rootNode);
      setCode(generated);
      setParseError(null);
      actions.setScriptError(null);
      setStatusMessage('Synced');
    }
  }, [rootNode, metricsMap, isFocused, format]);

  // Handle switching tabs
  const handleFormatChange = (newFormat: ScriptFormat) => {
    setFormat(newFormat);
    const generated = generateCodeForFormat(newFormat, rootNode);
    setCode(generated);
    setParseError(null);
    actions.setScriptError(null);
    setStatusMessage('Synced');
  };

  // Parse and sync to canvas
  const handleParseAndUpdate = (text: string, fmt: ScriptFormat = format) => {
    try {
      let parsed: LayoutNode;
      if (fmt === 'yaml') {
        parsed = parseTetherYaml(text);
      } else if (fmt === 'json') {
        parsed = parseJsonLayout(text);
      } else {
        parsed = parseHtmlLayout(text);
      }

      setParseError(null);
      actions.setScriptError(null);
      setStatusMessage('Synced');
      actions.loadCustomRootNode(parsed);
    } catch (e: any) {
      const msg = e.message || `Invalid ${fmt.toUpperCase()} syntax`;
      setParseError(msg);
      actions.setScriptError(msg);
      setStatusMessage('Syntax Pending');
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, u.length - 1));
    setRedoStack((r) => [...r, code]);
    setCode(prev);
    handleParseAndUpdate(prev, format);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, r.length - 1));
    setUndoStack((u) => [...u, code]);
    setCode(next);
    handleParseAndUpdate(next, format);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCode = e.target.value;
    setUndoStack((prev) => [...prev.slice(-49), code]);
    setRedoStack([]);
    setCode(nextCode);
    if (autoSync) {
      handleParseAndUpdate(nextCode, format);
    } else {
      setStatusMessage('Draft Modified');
    }
  };

  // Tab key indentation support (inserts 2 spaces) and Ctrl+S to sync
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleParseAndUpdate(code, format);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    if (
      ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setUndoStack((prev) => [...prev.slice(-49), code]);
      setRedoStack([]);
      setCode(nextCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);

      handleParseAndUpdate(nextCode, format);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Single-click Sync button
  const handleSync = () => {
    handleParseAndUpdate(code, format);
  };

  // Export current file download
  const handleExportFile = () => {
    const ext = format === 'yaml' ? 'yaml' : format === 'json' ? 'json' : 'html';
    const mime = format === 'yaml' ? 'text/yaml' : format === 'json' ? 'application/json' : 'text/html';
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout_export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from local file without preset clutter
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    let detectedFormat: ScriptFormat = 'yaml';
    if (fileName.endsWith('.json')) detectedFormat = 'json';
    else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) detectedFormat = 'html';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFormat(detectedFormat);
        setCode(content);
        handleParseAndUpdate(content, detectedFormat);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (!isVisible) return null;

  const lines = code.split('\n');

  return (
    <div className="h-full bg-[#121215] border-t border-[#27272e] flex flex-col select-none text-xs overflow-hidden">
      {/* Title & Action Bar */}
      <div className="h-8 px-2.5 bg-[#0e0e11] border-b border-[#242429] flex items-center justify-between text-zinc-300 flex-shrink-0">
        {/* Left: Language Tabs & Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#18181d] rounded p-0.5 border border-[#2b2b34]">
            <button
              onClick={() => handleFormatChange('yaml')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                format === 'yaml'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode2 className="w-3 h-3 text-amber-400" />
              <span>YAML</span>
            </button>

            <button
              onClick={() => handleFormatChange('json')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                format === 'json'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileJson className="w-3 h-3 text-blue-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={() => handleFormatChange('html')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                format === 'html'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3 h-3 text-emerald-400" />
              <span>HTML</span>
            </button>
          </div>

          {/* Auto-Sync Toggle Button */}
          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            title={autoSync ? "Auto-sync is ON: Canvas updates automatically on edit" : "Auto-sync is OFF: Click Sync or press Ctrl+S to apply"}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
              autoSync
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                : 'bg-[#18181d] text-zinc-400 border-[#2b2b34] hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSync ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            <span>Auto-sync</span>
          </button>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <div className={`w-2 h-2 rounded-full ${parseError ? 'bg-amber-500' : 'bg-emerald-400'}`} />
            <span className={parseError ? 'text-amber-400 font-semibold' : 'text-zinc-300'}>
              {statusMessage}
            </span>
          </div>
        </div>

        {/* Right: Actions (Sync, Import, Export, Copy) */}
        <div className="flex items-center gap-1.5">
          {/* Direct File Picker Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml,.json,.html,.htm"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSync}
            title="Parse editor code and synchronize to canvas"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/60 text-blue-300 font-semibold text-[10px] transition-colors"
          >
            <RotateCw className="w-3 h-3 text-blue-400" />
            <span>Sync</span>
          </button>

          {/* Script Undo / Redo controls */}
          <div className="flex items-center bg-[#18181d] rounded p-0.5 border border-[#2b2b34]">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo Script Edit (Ctrl+Z)"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#25252e] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo Script Edit (Ctrl+Y)"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#25252e] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo2 className="w-3 h-3" />
            </button>
          </div>

          {/* Focus Code / Fullscreen Toggle */}
          <button
            type="button"
            onClick={actions.toggleCodeMaximized}
            title={isCodeMaximized ? "Restore Split View" : "Full-Height Code View (Hide Viewport)"}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-semibold transition-colors ${
              isCodeMaximized
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                : 'bg-[#1a1a20] hover:bg-[#25252e] border-[#2e2e38] text-zinc-300 hover:text-white'
            }`}
          >
            {isCodeMaximized ? <Minimize2 className="w-3 h-3 text-purple-400" /> : <Maximize2 className="w-3 h-3 text-purple-400" />}
            <span>{isCodeMaximized ? 'Restore View' : 'Focus Code'}</span>
          </button>

          {/* Import File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import layout from file (.yaml, .json, .html)"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a20] hover:bg-[#25252e] border border-[#2e2e38] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>Import</span>
          </button>

          {/* Export File Button */}
          <button
            type="button"
            onClick={handleExportFile}
            title={`Download as layout.${format === 'yaml' ? 'yaml' : format === 'json' ? 'json' : 'html'}`}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a20] hover:bg-[#25252e] border border-[#2e2e38] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            <Download className="w-3 h-3 text-teal-400" />
            <span>Export</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a20] hover:bg-[#25252e] border border-[#2e2e38] text-zinc-300 hover:text-white text-[10px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Syntax Error Notification Banner */}
      {parseError && (
        <div className="px-3 py-1 bg-amber-950/60 border-b border-amber-900/60 text-amber-300 text-[10px] font-mono flex items-center gap-1.5 flex-shrink-0">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">{parseError}</span>
        </div>
      )}

      {/* Editor Body: VS Code Dark+ Styled Highlighted Workspace */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[11px] bg-[#121215]">
        {/* Line Numbers Gutter (Synced Scroll) */}
        <div 
          ref={lineGutterRef}
          className="w-10 py-2 bg-[#0c0c0e] border-r border-[#1e1e24] text-zinc-600 select-none text-right pr-2 overflow-hidden flex-shrink-0 font-mono text-[11px] leading-5"
        >
          {Array.from({ length: Math.max(lines.length, 1) }).map((_, i) => (
            <div key={i} className="h-5 leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Dual Layer Workspace: Syntax Highlighted Layer Behind + Transparent Textarea in Front */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Background (<pre>) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-2 m-0 bg-transparent font-mono text-[11px] leading-5 overflow-hidden pointer-events-none whitespace-pre select-none"
            style={{ tabSize: 2 }}
          >
            {lines.map((line, idx) => (
              <div key={idx} className="h-5 leading-5 whitespace-pre">
                {format === 'yaml'
                  ? renderYamlLine(line)
                  : format === 'json'
                  ? renderJsonLine(line)
                  : renderHtmlLine(line)}
              </div>
            ))}
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
            className="absolute inset-0 p-2 m-0 bg-transparent font-mono text-[11px] leading-5 resize-none outline-none overflow-auto custom-scrollbar whitespace-pre selection:bg-[#264f78]"
            style={{
              color: 'transparent',
              caretColor: '#ffffff',
              tabSize: 2,
            }}
            placeholder={`Paste or type ${format.toUpperCase()} layout script here...`}
          />
        </div>
      </div>
    </div>
  );
};
