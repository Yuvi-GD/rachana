import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  exportLayoutEngineYaml, 
  parseTetherYaml, 
  exportLayoutEngineGoldenTest, 
  parseJsonLayout, 
  exportToHtmlCss, 
  parseHtmlLayout,
  exportToXml,
  parseXmlLayout
} from '../../core/layoutSerializer';
import { LayoutNode } from '../../types/layout';
import { 
  FileCode2, 
  FileCode,
  Copy, 
  Check, 
  Download, 
  Upload, 
  AlertCircle, 
  FileJson, 
  Code,
  Maximize2,
  Minimize2,
  MoreVertical,
  CheckSquare,
  RotateCcw,
  ChevronDown,
  RotateCw
} from 'lucide-react';

export type ScriptFormat = 'yaml' | 'html' | 'xml' | 'json';

const SCRIPT_FORMATS: Array<{ 
  id: ScriptFormat; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
}> = [
  { id: 'yaml', label: 'YAML', icon: FileCode2, color: 'text-amber-400' },
  { id: 'html', label: 'HTML', icon: Code, color: 'text-emerald-400' },
  { id: 'xml', label: 'XML', icon: FileCode, color: 'text-cyan-400' },
  { id: 'json', label: 'JSON', icon: FileJson, color: 'text-blue-400' },
];

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
// VS Code Dark+ Token Highlighting for HTML & CSS
// -------------------------------------------------------------
// VS Code Dark+ Token Highlighting for HTML & CSS
// -------------------------------------------------------------
const renderCssTokens = (val: string): React.ReactNode => {
  const valTokens = val.split(/(\s+|#[a-fA-F0-9]+|\d+(?:\.\d+)?(?:px|%|rem|em|vh|vw|fr)?|"[^"]*"|'[^']*'|[a-zA-Z-]+(?=\()|[(),])/g).filter(Boolean);
  return valTokens.map((tok, i) => {
    if (!tok.trim()) return <span key={i}>{tok}</span>;
    if (tok.startsWith('#')) return <span key={i} style={{ color: '#ce9178', fontWeight: 600 }}>{tok}</span>;
    if (/^\d+(?:\.\d+)?(?:px|%|rem|em|vh|vw|fr)?$/.test(tok)) return <span key={i} style={{ color: '#b5cea8' }}>{tok}</span>;
    if (tok.startsWith('"') || tok.startsWith("'")) return <span key={i} style={{ color: '#ce9178' }}>{tok}</span>;
    if (['rgba', 'rgb', 'hsl', 'calc', 'var', 'repeat', 'minmax'].includes(tok)) {
      return <span key={i} style={{ color: '#dcdcaa' }}>{tok}</span>;
    }
    if (['flex', 'grid', 'column', 'row', 'block', 'none', 'auto', 'solid', 'dashed', 'transparent', 'center', 'relative', 'absolute', 'overflow', 'border-box', 'inherit', 'initial', 'nowrap', 'wrap', 'space-between', 'stretch'].includes(tok)) {
      return <span key={i} style={{ color: '#569cd6', fontWeight: 600 }}>{tok}</span>;
    }
    if (tok === '(' || tok === ')' || tok === ',') {
      return <span key={i} style={{ color: '#ffd700' }}>{tok}</span>;
    }
    return <span key={i} style={{ color: '#4fc1ff' }}>{tok}</span>;
  });
};

const renderCssSelector = (selectorPart: string): React.ReactNode => {
  const selTokens = selectorPart.split(/([.#]?[a-zA-Z0-9_-]+|::?[a-zA-Z0-9_-]+|\*|,|\s+)/g).filter(Boolean);
  return selTokens.map((tok, i) => {
    if (!tok.trim()) return <span key={i}>{tok}</span>;
    if (tok.startsWith('.')) return <span key={i} style={{ color: '#d7ba7d', fontWeight: 600 }}>{tok}</span>;
    if (tok.startsWith('#')) return <span key={i} style={{ color: '#4fc1ff', fontWeight: 600 }}>{tok}</span>;
    if (tok.startsWith(':')) return <span key={i} style={{ color: '#dcdcaa' }}>{tok}</span>;
    if (tok === ',') return <span key={i} style={{ color: '#d4d4d4' }}>{tok}</span>;
    if (tok === '*') return <span key={i} style={{ color: '#569cd6', fontWeight: 600 }}>{tok}</span>;
    return <span key={i} style={{ color: '#569cd6' }}>{tok}</span>;
  });
};

const renderCssDeclarations = (declText: string): React.ReactNode => {
  const declList = declText.split(';').map(d => d.trim()).filter(Boolean);
  return (
    <>
      {' '}
      {declList.map((decl, idx) => {
        const colonIdx = decl.indexOf(':');
        if (colonIdx === -1) return <span key={idx}>{decl}; </span>;
        const prop = decl.substring(0, colonIdx).trim();
        const val = decl.substring(colonIdx + 1).trim();
        return (
          <React.Fragment key={idx}>
            <span style={{ color: '#9cdcfe' }}>{prop}</span>
            <span style={{ color: '#d4d4d4' }}>: </span>
            {renderCssTokens(val)}
            <span style={{ color: '#d4d4d4' }}>; </span>
          </React.Fragment>
        );
      })}
    </>
  );
};

const renderHtmlLine = (line: string): React.ReactNode => {
  const trimmed = line.trim();
  if (trimmed.startsWith('<!--') || trimmed.endsWith('-->') || trimmed.startsWith('/*') || trimmed.endsWith('*/')) {
    return <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{line}</span>;
  }

  // Single-line CSS rule (e.g. "*, *::before, *::after { box-sizing: border-box; }" or "body { margin: 0; ... }")
  if (trimmed.includes('{') && trimmed.includes('}') && !trimmed.startsWith('<')) {
    const firstBrace = line.indexOf('{');
    const lastBrace = line.lastIndexOf('}');
    const selectorPart = line.substring(0, firstBrace);
    const bodyPart = line.substring(firstBrace + 1, lastBrace);
    const afterPart = line.substring(lastBrace + 1);

    return (
      <>
        {renderCssSelector(selectorPart)}
        <span style={{ color: '#ffd700' }}>{'{'}</span>
        {renderCssDeclarations(bodyPart)}
        <span style={{ color: '#ffd700' }}>{'}'}</span>
        {afterPart && <span>{afterPart}</span>}
      </>
    );
  }

  // CSS Selector opening line (e.g. ".node_1 {", "body {", "*, *::before, *::after {")
  if (trimmed.endsWith('{') && !trimmed.startsWith('<')) {
    const braceIdx = line.lastIndexOf('{');
    const selectorPart = line.substring(0, braceIdx);
    const bracePart = line.substring(braceIdx);

    return (
      <>
        {renderCssSelector(selectorPart)}
        <span style={{ color: '#ffd700' }}>{bracePart}</span>
      </>
    );
  }

  if (trimmed === '}' || trimmed === '{') {
    return <span style={{ color: '#ffd700' }}>{line}</span>;
  }

  // CSS Property declaration (e.g. "  display: flex;" or "  background-color: #18181b;")
  const cssPropMatch = line.match(/^(\s*)([a-zA-Z-]+)\s*:\s*([^;]+)(;?.*)$/);
  if (cssPropMatch && !trimmed.startsWith('<')) {
    const [, indent, prop, val, semi] = cssPropMatch;
    return (
      <>
        <span>{indent}</span>
        <span style={{ color: '#9cdcfe' }}>{prop}</span>
        <span style={{ color: '#d4d4d4' }}>: </span>
        {renderCssTokens(val)}
        <span style={{ color: '#d4d4d4' }}>{semi}</span>
      </>
    );
  }

  // HTML tag and attributes tokenizer
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(<\/?[a-zA-Z0-9_-]+)|(\/?>)|([a-zA-Z0-9_-]+(?==))|(".*?")|([^<>"=]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} style={{ color: '#d4d4d4' }}>{line.substring(lastIndex, match.index)}</span>);
    }
    const [raw, tag, closeTag, attr, attrVal, text] = match;
    const key = match.index;

    if (tag) {
      parts.push(
        <span key={key}>
          <span style={{ color: '#808080' }}>{raw.startsWith('</') ? '</' : '<'}</span>
          <span style={{ color: '#569cd6', fontWeight: 600 }}>{raw.replace(/^<\/?/, '')}</span>
        </span>
      );
    } else if (closeTag) {
      parts.push(<span key={key} style={{ color: '#808080' }}>{raw}</span>);
    } else if (attr) {
      parts.push(<span key={key} style={{ color: '#9cdcfe' }}>{raw}</span>);
    } else if (attrVal) {
      parts.push(<span key={key} style={{ color: '#ce9178' }}>{raw}</span>);
    } else if (text) {
      parts.push(<span key={key} style={{ color: '#e2e8f0' }}>{raw}</span>);
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
// VS Code Dark+ Token Highlighting for XML
// -------------------------------------------------------------
const renderXmlLine = (line: string): React.ReactNode => {
  const trimmed = line.trim();
  if (trimmed.startsWith('<!--') || trimmed.endsWith('-->')) {
    return <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{line}</span>;
  }
  if (trimmed.startsWith('<?xml') && trimmed.endsWith('?>')) {
    return <span style={{ color: '#808080', fontStyle: 'italic' }}>{line}</span>;
  }

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
      parts.push(<span key={key} style={{ color: '#4ec9b0', fontWeight: 600 }}>{raw}</span>);
    } else if (closeTag) {
      parts.push(<span key={key} style={{ color: '#4ec9b0', fontWeight: 600 }}>{raw}</span>);
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

// -------------------------------------------------------------
// VS Code Dark+ Token Highlighting for JSON
// -------------------------------------------------------------
const renderJsonLine = (line: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
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

export const LiveYamlPanel: React.FC = () => {
  const { 
    rootNode, 
    selectedNodeId,
    metricsMap, 
    showBottomPanel, 
    showMetrics, 
    isCodeMaximized, 
    preferences,
    actions 
  } = useEditorStore();

  const [format, setFormat] = useState<ScriptFormat>('yaml');
  const [code, setCode] = useState('');
  const [highlightedLineIndex, setHighlightedLineIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Synced');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const formatDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  const isVisible = showBottomPanel !== undefined ? showBottomPanel : showMetrics;
  const autoSync = preferences?.autoSyncScript ?? true;
  const currentFormatObj = SCRIPT_FORMATS.find(f => f.id === format) || SCRIPT_FORMATS[0];
  const FormatIcon = currentFormatObj.icon;

  // Auto-scroll to selected element line and highlight line number
  const codeFontSize = preferences?.codeFontSize || 12;
  const lineHeightPx = Math.round(codeFontSize * 1.6);

  useEffect(() => {
    if (!selectedNodeId) {
      setHighlightedLineIndex(null);
      return;
    }

    const lines = code.split('\n');
    let targetIdx = -1;

    // Search for line matching selectedNodeId or node class
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes(`id: "${selectedNodeId}"`) ||
        line.includes(`id="${selectedNodeId}"`) ||
        line.includes(`"id": "${selectedNodeId}"`) ||
        line.includes(`node-${selectedNodeId.replace(/[^a-zA-Z0-9_-]/g, '_')}`) ||
        line.includes(selectedNodeId)
      ) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx !== -1) {
      setHighlightedLineIndex(targetIdx);
      if (textareaRef.current) {
        const targetScrollTop = Math.max(0, targetIdx * lineHeightPx - 80);
        textareaRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    } else {
      setHighlightedLineIndex(null);
    }
  }, [selectedNodeId, code, lineHeightPx]);

  // Click outside to close menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(e.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    };
    if (isMenuOpen || isFormatDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen, isFormatDropdownOpen]);

  // Generate code based on active format (HTML shows markup first, then <style>)
  const generateCodeForFormat = (fmt: ScriptFormat, node: LayoutNode): string => {
    switch (fmt) {
      case 'yaml':
        return exportLayoutEngineYaml(node, metricsMap);
      case 'html': {
        const { html, css } = exportToHtmlCss(node);
        return `${html}\n\n<style>\n${css}\n</style>`;
      }
      case 'xml':
        return exportToXml(node);
      case 'json':
        return JSON.stringify(exportLayoutEngineGoldenTest(node, metricsMap), null, 2);
    }
  };

  // Sync from Store -> Code when rootNode changes (e.g. from canvas or global undo/redo)
  useEffect(() => {
    if (!isFocused) {
      const generated = generateCodeForFormat(format, rootNode);
      setCode(generated);
      setParseError(null);
      actions.setScriptError(null);
      setStatusMessage('Synced');
    }
  }, [rootNode, metricsMap, isFocused, format]);

  // Handle switching format
  const handleFormatChange = (newFormat: ScriptFormat) => {
    setFormat(newFormat);
    const generated = generateCodeForFormat(newFormat, rootNode);
    setCode(generated);
    setParseError(null);
    actions.setScriptError(null);
    setStatusMessage('Synced');
  };

  // Parse and sync to canvas
  const handleParseAndUpdate = (text: string, fmt: ScriptFormat = format, isNewDocument: boolean = false) => {
    try {
      let parsed: LayoutNode;
      if (fmt === 'yaml') {
        parsed = parseTetherYaml(text);
      } else if (fmt === 'html') {
        parsed = parseHtmlLayout(text);
      } else if (fmt === 'xml') {
        parsed = parseXmlLayout(text);
      } else {
        parsed = parseJsonLayout(text);
      }

      setParseError(null);
      actions.setScriptError(null);
      setStatusMessage('Synced');
      actions.loadCustomRootNode(parsed, isNewDocument);
    } catch (e: any) {
      const msg = e.message || `Invalid ${fmt.toUpperCase()} syntax`;
      setParseError(msg);
      actions.setScriptError(msg);
      setStatusMessage('Syntax Pending');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCode = e.target.value;
    setCode(nextCode);
    if (autoSync) {
      setStatusMessage('Draft Modified');
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        handleParseAndUpdate(nextCode, format, false);
      }, 350);
    } else {
      setStatusMessage('Draft Modified');
    }
  };

  // Keyboard shortcuts: Ctrl+S to sync, Tab for 2-space indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      handleParseAndUpdate(code, format, false);
      return;
    }

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

      if (autoSync) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          handleParseAndUpdate(nextCode, format, false);
        }, 350);
      }
    }
  };

  // Reverse sync: click anywhere in script editor -> select corresponding element in GUI
  const handleEditorCursorChange = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = code.slice(0, cursorPos);
    const lineIndex = textBefore.split('\n').length - 1;
    const allLines = code.split('\n');

    let foundId: string | null = null;

    // First scan from current line upwards
    for (let i = lineIndex; i >= 0; i--) {
      const line = allLines[i];
      const idMatch = line.match(/(?:id[:=]\s*["']([^"']+)["']|"id":\s*["']([^"']+)["']|class="[^"]*node-([a-zA-Z0-9_-]+))/);
      if (idMatch) {
        foundId = idMatch[1] || idMatch[2] || idMatch[3];
        break;
      }
      if (lineIndex - i > 35) break;
    }

    // If not found upwards, scan a few lines downwards (e.g. cursor on "- Button:" before "id: '...'")
    if (!foundId) {
      for (let i = lineIndex; i < Math.min(allLines.length, lineIndex + 12); i++) {
        const line = allLines[i];
        const idMatch = line.match(/(?:id[:=]\s*["']([^"']+)["']|"id":\s*["']([^"']+)["']|class="[^"]*node-([a-zA-Z0-9_-]+))/);
        if (idMatch) {
          foundId = idMatch[1] || idMatch[2] || idMatch[3];
          break;
        }
      }
    }

    if (foundId && foundId !== selectedNodeId) {
      actions.selectNode(foundId);
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

  // Export current file download
  const handleExportFile = () => {
    const ext = format === 'yaml' ? 'yaml' : format === 'html' ? 'html' : format === 'xml' ? 'xml' : 'json';
    const mime = format === 'yaml' ? 'text/yaml' : format === 'html' ? 'text/html' : format === 'xml' ? 'application/xml' : 'application/json';
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout_export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from local file
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    let detectedFormat: ScriptFormat = 'yaml';
    if (fileName.endsWith('.json')) detectedFormat = 'json';
    else if (fileName.endsWith('.xml')) detectedFormat = 'xml';
    else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) detectedFormat = 'html';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFormat(detectedFormat);
        setCode(content);
        handleParseAndUpdate(content, detectedFormat, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isVisible) return null;

  const lines = code.split('\n');

  return (
    <div className="h-full bg-[#18181b] border-t border-[#27272a] flex flex-col select-none text-xs overflow-hidden">
      {/* Title & Action Bar */}
      <div className="h-8 px-2.5 bg-[#141417] border-b border-[#27272a] flex items-center justify-between text-zinc-300 flex-shrink-0 relative z-30">
        {/* Left: Format Dropdown Selector (YAML / HTML / XML / JSON) & Status */}
        <div className="flex items-center gap-2">
          {/* Format Dropdown Button */}
          <div className="relative" ref={formatDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181d] hover:bg-[#23232a] border border-[#2e2e38] rounded text-[11px] font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              <FormatIcon className={`w-3.5 h-3.5 ${currentFormatObj.color}`} />
              <span>{currentFormatObj.label}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
            </button>

            {isFormatDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-[#18181d] border border-[#2e2e38] rounded-lg shadow-2xl py-1 z-50 text-xs">
                {SCRIPT_FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        handleFormatChange(fmt.id);
                        setIsFormatDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-300 font-semibold'
                          : 'text-zinc-300 hover:bg-[#252530] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${fmt.color}`} />
                        <span>{fmt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <div className={`w-2 h-2 rounded-full ${parseError ? 'bg-amber-500' : 'bg-emerald-400'}`} />
            <span className={parseError ? 'text-amber-400 font-semibold' : 'text-zinc-300'}>
              {statusMessage}
            </span>
          </div>
        </div>

        {/* Right: Manual Sync (if autoSync off), Focus Code, 3-Dot More Actions Menu */}
        <div className="flex items-center gap-1.5">
          {/* Direct File Picker Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml,.xml,.json,.html,.htm"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Manual Sync Button when Auto-Sync is Disabled */}
          {!autoSync && (
            <button
              type="button"
              onClick={() => handleParseAndUpdate(code, format, false)}
              title="Sync Script to Canvas (Ctrl+S)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-semibold bg-blue-600/30 hover:bg-blue-600/50 border-blue-500/60 text-blue-200 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3 h-3 text-blue-400" />
              <span>Sync (Ctrl+S)</span>
            </button>
          )}

          {/* Focus Code / Fullscreen Toggle */}
          <button
            type="button"
            onClick={actions.toggleCodeMaximized}
            title={isCodeMaximized ? "Restore Split View" : "Full-Height Code View (Hide Viewport)"}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-semibold transition-colors cursor-pointer ${
              isCodeMaximized
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                : 'bg-[#1a1a20] hover:bg-[#25252e] border-[#2e2e38] text-zinc-300 hover:text-white'
            }`}
          >
            {isCodeMaximized ? <Minimize2 className="w-3 h-3 text-purple-400" /> : <Maximize2 className="w-3 h-3 text-purple-400" />}
            <span>{isCodeMaximized ? 'Restore View' : 'Focus Code'}</span>
          </button>

          {/* 3-Dot More Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              title="More script options"
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                  : 'bg-[#1a1a20] hover:bg-[#25252e] border-[#2e2e38] text-zinc-300 hover:text-white'
              }`}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#18181d] border border-[#2e2e38] rounded-lg shadow-2xl py-1 z-50 text-xs">
                {/* Manual Sync */}
                <button
                  type="button"
                  onClick={() => {
                    handleParseAndUpdate(code, format, false);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sync to Canvas (Ctrl+S)</span>
                </button>

                <div className="my-1 border-t border-[#2a2a34]" />

                {/* Copy Code */}
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
                </button>

                {/* Import File */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Import File...</span>
                </button>

                {/* Export File */}
                <button
                  type="button"
                  onClick={() => {
                    handleExportFile();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export File</span>
                </button>

                <div className="my-1 border-t border-[#2a2a34]" />

                {/* Select All */}
                <button
                  type="button"
                  onClick={() => {
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                      textareaRef.current.select();
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select All</span>
                </button>

                {/* Reset to Canvas */}
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateCodeForFormat(format, rootNode);
                    setCode(generated);
                    setParseError(null);
                    actions.setScriptError(null);
                    setStatusMessage('Synced');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-zinc-300 hover:bg-[#252530] hover:text-white text-left transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reset to Canvas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syntax Error Notification Banner */}
      {parseError && (
        <div className="px-3 py-1 bg-amber-950/60 border-b border-amber-900/60 text-amber-300 text-[10px] font-mono flex items-center gap-1.5 flex-shrink-0">
          <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">{parseError}</span>
        </div>
      )}

      {/* Editor Body: VS Code Dark+ Styled Workspace */}
      <div 
        className="flex-1 relative flex overflow-hidden font-mono code-editor-workspace bg-[#111114]"
        style={{ fontSize: `${codeFontSize}px` }}
      >
        {/* Line Numbers Gutter */}
        <div 
          ref={lineGutterRef}
          className="w-11 py-2 code-editor-gutter bg-[#0d0d10] border-r border-[#222228] select-none text-right pr-2 overflow-hidden flex-shrink-0 font-mono transition-colors"
          style={{ fontSize: `${codeFontSize}px`, lineHeight: `${lineHeightPx}px` }}
        >
          {Array.from({ length: Math.max(lines.length, 1) }).map((_, i) => {
            const isHighlighted = highlightedLineIndex === i;
            return (
              <div 
                key={i} 
                style={{ height: `${lineHeightPx}px`, lineHeight: `${lineHeightPx}px` }}
                className={`transition-all select-none ${
                  isHighlighted 
                    ? 'text-cyan-300 font-bold bg-cyan-950/80 border-r-2 border-cyan-400 pr-1' 
                    : 'text-zinc-600'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Dual Layer Workspace: Highlighted Pre + Foreground Textarea */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Background (<pre>) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-2 m-0 bg-transparent font-mono overflow-hidden pointer-events-none whitespace-pre select-none code-editor-pre"
            style={{ 
              fontSize: `${codeFontSize}px`, 
              lineHeight: `${lineHeightPx}px`, 
              tabSize: 2 
            }}
          >
            {lines.map((line, idx) => (
              <div key={idx} style={{ height: `${lineHeightPx}px`, lineHeight: `${lineHeightPx}px` }} className="whitespace-pre">
                {format === 'yaml'
                  ? renderYamlLine(line)
                  : format === 'html'
                  ? renderHtmlLine(line)
                  : format === 'xml'
                  ? renderXmlLine(line)
                  : renderJsonLine(line)}
              </div>
            ))}
          </pre>

          {/* Foreground Editable Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onClick={handleEditorCursorChange}
            onKeyUp={(e) => {
              if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                handleEditorCursorChange();
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 p-2 m-0 bg-transparent font-mono resize-none outline-none overflow-auto code-scrollbar whitespace-pre selection:bg-[#264f78] code-editor-textarea"
            style={{
              fontSize: `${codeFontSize}px`,
              lineHeight: `${lineHeightPx}px`,
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
