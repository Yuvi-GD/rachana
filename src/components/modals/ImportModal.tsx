import React, { useState, useMemo, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  parseTetherYaml, 
  parseJsonLayout, 
  parseHtmlLayout,
  exportLayoutEngineYaml,
  exportLayoutEngineGoldenTest,
  exportToHtmlCss
} from '../../core/layoutSerializer';
import { LayoutNode } from '../../types/layout';
import { 
  X, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  FileText, 
  FileJson, 
  Code2, 
  Layers,
  DownloadCloud,
  Monitor
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToExport?: () => void;
}

const SAMPLE_YAML = `Panel:
  id: "yaml_modal_overlay"
  color: [0, 0, 0, 150]
  interactable: true
  flow: COLUMN
  content_align: CENTER
  anchor_min: 0.0
  anchor_max: 1.0
  children:
    - Panel:
        id: "yaml_modal_popup"
        color: [240, 245, 250, 255]
        padding: 40
        margin: 10
        gap: [0, 24]
        flow: COLUMN
        content_align: CENTER
        children:
          - Text:
              string: "Welcome to Tether UI Layout Engine!"
              font_size: 24.0
              color: [30, 32, 36, 255]
          - Button:
              id: "btn_close_yaml_modal"
              color: [220, 53, 69, 255]
              content:
                - Text:
                    string: "Close Modal"
                    font_size: 16.0
                    color: [255, 255, 255, 255]`;

const SAMPLE_DASHBOARD_YAML = `- Panel:
    id: "DashboardContainer"
    fill_ratio: 0.78
    color: [40, 44, 52, 255]
    flow: COLUMN
    gap: [0, 15]
    padding: 15
    children:
      # ---- ROW 1: Color Boxes ----
      - Panel:
          fill_ratio: 0.25
          color: [50, 56, 68, 255]
          flow: ROW
          gap: [12, 0]
          padding: 12
          children:
            - Panel:
                interactable: true
                fill_ratio: 1.0
                color: [224, 108, 117, 255]
                border_radius: 10.0
            - Panel:
                interactable: true
                fill_ratio: 1.0
                color: [152, 195, 121, 255]
                border_radius: 10.0
            - Panel:
                interactable: true
                fill_ratio: 1.0
                color: [97, 175, 239, 255]
                border_radius: 10.0

      # ---- ROW 2: Stat Cards ----
      - Panel:
          fill_ratio: 0.35
          color: [40, 44, 52, 255]
          flow: ROW
          gap: [12, 0]
          children:
            - Panel:
                fill_ratio: 1.0
                color: [152, 195, 121, 255]
                padding: 15
                flow: COLUMN
                gap: [0, 8]
                children:
                  - Text:
                      string: "Active Users"
                      font_size: 16.0
                      color: [40, 44, 52, 180]
                  - Text:
                      string: "2,847"
                      font_size: 32.0
                      color: [40, 44, 52, 255]`;

const SAMPLE_JSON = `{
  "id": "CustomAppRoot",
  "name": "App Window",
  "type": "container",
  "declaredStyle": {
    "display": "flex",
    "flow": "COLUMN",
    "width": "800px",
    "height": "520px",
    "padding": "24px",
    "gap": "16px",
    "backgroundColor": "rgba(30, 32, 38, 1.0)"
  },
  "children": [
    {
      "id": "header_bar",
      "name": "Header Bar",
      "type": "flex",
      "declaredStyle": {
        "display": "flex",
        "flow": "ROW",
        "gap": "12px",
        "padding": "16px",
        "backgroundColor": "rgba(45, 52, 64, 1.0)"
      },
      "children": [
        {
          "id": "title_text",
          "name": "Title",
          "type": "text",
          "textContent": "JSON Layout Engine Node",
          "declaredStyle": {
            "color": "#61afef",
            "fontSize": "22px"
          }
        }
      ]
    }
  ]
}`;

const SAMPLE_HTML = `<div style="display: flex; flex-direction: column; width: 780px; height: 500px; padding: 24px; gap: 16px; background-color: #1e1e24; border-radius: 12px; border: 1px solid #32323a;">
  <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 16px; background-color: #282832; border-radius: 8px;">
    <h2 style="color: #61afef; font-size: 22px; margin: 0; font-weight: 700;">HTML Layout Importer</h2>
    <button style="padding: 8px 18px; background-color: #98c379; color: #1e1e24; border-radius: 6px; font-weight: bold; border: none; cursor: pointer;">
      Action Button
    </button>
  </div>

  <div style="display: flex; flex-direction: row; gap: 16px; flex-grow: 1;">
    <div style="flex-grow: 1; padding: 18px; background-color: #24242e; border-radius: 8px; border: 1px solid #353542;">
      <h3 style="color: #e5c07b; font-size: 16px; margin: 0 0 8px 0;">Primary Column</h3>
      <p style="color: #abb2bf; font-size: 14px; line-height: 1.5; margin: 0;">
        Standard HTML DOM parsed via browser DOMParser and translated directly into the UI Engine's layout tree.
      </p>
    </div>
    <div style="flex-grow: 1; padding: 18px; background-color: #24242e; border-radius: 8px; border: 1px solid #353542;">
      <h3 style="color: #e06c75; font-size: 16px; margin: 0 0 8px 0;">Secondary Column</h3>
      <p style="color: #abb2bf; font-size: 14px; line-height: 1.5; margin: 0;">
        Inline CSS properties (display, flex, gap, padding, margin, width, background) are mapped to native node properties.
      </p>
    </div>
  </div>
</div>`;

// Script Syntax Coloring Engine
const renderSyntaxLines = (code: string, format: 'yaml' | 'json' | 'html'): React.ReactNode => {
  return code.split('\n').map((line, i) => {
    if (format === 'yaml') {
      if (line.trim().startsWith('#')) {
        return (
          <div key={i} className="whitespace-pre font-mono text-zinc-500 italic">
            {line}
          </div>
        );
      }
      const match = line.match(/^(\s*)(?:(-\s*))?([a-zA-Z0-9_-]+):(.*)$/);
      if (match) {
        const [, indent, dash, key, rest] = match;
        const commentMatch = rest.match(/^(.*?)(#.*)$/);
        const valPart = commentMatch ? commentMatch[1] : rest;
        const commentPart = commentMatch ? commentMatch[2] : '';

        return (
          <div key={i} className="whitespace-pre font-mono leading-relaxed">
            <span>{indent}</span>
            {dash && <span className="text-zinc-500 font-bold">{dash}</span>}
            <span className="text-sky-400 font-semibold">{key}:</span>
            <span className="text-amber-300">{valPart}</span>
            {commentPart && <span className="text-zinc-500 italic"> {commentPart}</span>}
          </div>
        );
      }
    } else if (format === 'json') {
      const coloredLine = line
        .replace(/"([^"]+)":/g, '<span class="text-sky-400 font-semibold">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="text-emerald-300">"$1"</span>')
        .replace(/: (-?[0-9.]+)/g, ': <span class="text-amber-400 font-bold">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="text-purple-400 font-semibold">$1</span>');

      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{ __html: coloredLine }}
          className="whitespace-pre font-mono leading-relaxed"
        />
      );
    } else {
      // HTML
      if (line.trim().startsWith('<!--')) {
        return (
          <div key={i} className="whitespace-pre font-mono text-zinc-500 italic">
            {line}
          </div>
        );
      }
      const coloredLine = line
        .replace(/(<[/]?[a-zA-Z0-9_-]+)(.*?>)/g, '<span class="text-pink-400 font-semibold">$1</span><span class="text-zinc-400">$2</span>')
        .replace(/style="([^"]+)"/g, '<span class="text-cyan-400 font-medium">style</span>="<span class="text-emerald-300">$1</span>"')
        .replace(/id="([^"]+)"/g, '<span class="text-purple-400 font-medium">id</span>="<span class="text-sky-300 font-mono">$1</span>"')
        .replace(/class="([^"]+)"/g, '<span class="text-yellow-400 font-medium">class</span>="<span class="text-yellow-300 font-mono">$1</span>"');

      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{ __html: coloredLine }}
          className="whitespace-pre font-mono leading-relaxed"
        />
      );
    }

    return (
      <div key={i} className="whitespace-pre font-mono text-zinc-300 leading-relaxed">
        {line || ' '}
      </div>
    );
  });
};

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSwitchToExport }) => {
  const { rootNode, metricsMap, actions } = useEditorStore();
  const [format, setFormat] = useState<'yaml' | 'json' | 'html'>('yaml');
  const [code, setCode] = useState(SAMPLE_YAML);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleLoadCurrentScreen = () => {
    if (format === 'yaml') {
      setCode(exportLayoutEngineYaml(rootNode, metricsMap));
    } else if (format === 'json') {
      setCode(JSON.stringify(exportLayoutEngineGoldenTest(rootNode, metricsMap), null, 2));
    } else {
      setCode(exportToHtmlCss(rootNode).html);
    }
  };

  // Sync scrolling between overlay textarea and syntax highlighted pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Live parse validation
  const parseResult = useMemo<{ valid: boolean; nodeCount: number; rootNode?: LayoutNode; err?: string }>(() => {
    if (!code.trim()) return { valid: false, nodeCount: 0 };
    try {
      let root: LayoutNode;
      if (format === 'yaml') {
        root = parseTetherYaml(code);
      } else if (format === 'json') {
        root = parseJsonLayout(code);
      } else {
        root = parseHtmlLayout(code);
      }

      const countNodes = (n: LayoutNode): number => {
        return 1 + (n.children ? n.children.reduce((acc, c) => acc + countNodes(c), 0) : 0);
      };

      const total = countNodes(root);
      return { valid: true, nodeCount: total, rootNode: root };
    } catch (e: any) {
      return { valid: false, nodeCount: 0, err: e.message || 'Syntax parse error' };
    }
  }, [code, format]);

  if (!isOpen) return null;

  const handleSelectFormat = (newFmt: 'yaml' | 'json' | 'html') => {
    setFormat(newFmt);
    setError(null);
    if (newFmt === 'yaml') setCode(SAMPLE_YAML);
    else if (newFmt === 'json') setCode(SAMPLE_JSON);
    else if (newFmt === 'html') setCode(SAMPLE_HTML);
  };

  const handleExecuteImport = () => {
    setError(null);
    if (!parseResult.valid || !parseResult.rootNode) {
      setError(parseResult.err || 'Invalid layout code.');
      return;
    }

    try {
      actions.loadCustomRootNode(parseResult.rootNode);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to import layout tree.');
    }
  };

  const linesCount = code.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#1c1c20] border border-[#33333d] rounded-lg shadow-2xl w-[960px] max-w-[95vw] h-[680px] flex flex-col text-xs text-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#2d2d38] flex items-center justify-between bg-[#161619]">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">Import Layout Specification</span>
            <span className="bg-emerald-950 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-semibold">
              Multi-Format Parser (YAML • JSON • HTML)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToExport && (
              <button
                onClick={onSwitchToExport}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#24242d] hover:bg-[#2e2e38] text-sky-400 hover:text-sky-300 border border-[#393946] font-medium text-[11px] transition-all shadow-xs"
                title="Switch to Export modal"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Switch to Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#282830] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="px-4 py-2 border-b border-[#2d2d38] bg-[#19191d] flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#222227] p-1 rounded border border-[#33333a]">
            {/* YAML TAB */}
            <button
              onClick={() => handleSelectFormat('yaml')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                format === 'yaml'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Hierarchical YAML</span>
            </button>

            {/* JSON TAB */}
            <button
              onClick={() => handleSelectFormat('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                format === 'json'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-blue-300" />
              <span>JSON Tree</span>
            </button>

            {/* HTML TAB */}
            <button
              onClick={() => handleSelectFormat('html')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                format === 'html'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-pink-300" />
              <span>HTML + CSS</span>
            </button>
          </div>

          {/* Quick Preset Snippets + Use Current Screen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLoadCurrentScreen}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px] transition-colors"
              title="Copy the current active screen layout into the editor"
            >
              <Monitor className="w-3 h-3 text-emerald-400" />
              <span>Use Current Screen</span>
            </button>

            <div className="h-4 w-[1px] bg-[#33333e] mx-1" />

            <span className="text-[11px] text-zinc-500 font-medium">Templates:</span>
            {format === 'yaml' && (
              <>
                <button
                  onClick={() => setCode(SAMPLE_YAML)}
                  className="px-2 py-0.5 rounded bg-[#25252e] hover:bg-[#32323e] border border-[#3d3d4b] text-amber-300 font-mono text-[10px]"
                >
                  Modal Dialog
                </button>
                <button
                  onClick={() => setCode(SAMPLE_DASHBOARD_YAML)}
                  className="px-2 py-0.5 rounded bg-[#25252e] hover:bg-[#32323e] border border-[#3d3d4b] text-sky-300 font-mono text-[10px]"
                >
                  Dashboard
                </button>
              </>
            )}
            {format === 'json' && (
              <button
                onClick={() => setCode(SAMPLE_JSON)}
                className="px-2 py-0.5 rounded bg-[#25252e] hover:bg-[#32323e] border border-[#3d3d4b] text-blue-300 font-mono text-[10px]"
              >
                Layout JSON Tree
              </button>
            )}
            {format === 'html' && (
              <button
                onClick={() => setCode(SAMPLE_HTML)}
                className="px-2 py-0.5 rounded bg-[#25252e] hover:bg-[#32323e] border border-[#3d3d4b] text-pink-300 font-mono text-[10px]"
              >
                Flex Grid Card HTML
              </button>
            )}
          </div>
        </div>

        {/* Editor Area with Script Coloring & Line Numbers */}
        <div className="flex-1 flex overflow-hidden bg-[#0c0c0e] relative">
          {/* Left Gutter: Line Numbers */}
          <div className="w-11 bg-[#121216] border-r border-[#222228] py-3 select-none flex flex-col items-end pr-2 text-zinc-600 font-mono text-[11px] leading-relaxed">
            {Array.from({ length: linesCount }).map((_, idx) => (
              <div key={idx} className="h-5">{idx + 1}</div>
            ))}
          </div>

          {/* Dual-Layer Code Editor: Color Highlighted Pre + Interactive Textarea */}
          <div className="flex-1 relative overflow-hidden">
            {/* Syntax Colored Background Layer */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className="absolute inset-0 p-3 m-0 font-mono text-[12px] leading-5 whitespace-pre overflow-hidden pointer-events-none z-0"
              style={{ tabSize: 2 }}
            >
              {renderSyntaxLines(code, format)}
            </pre>

            {/* Transparent Interactive Input Layer with Caret & Selection */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              className="absolute inset-0 p-3 m-0 font-mono text-[12px] leading-5 text-transparent caret-white selection:bg-blue-600/40 bg-transparent outline-none resize-none z-10 custom-scrollbar"
              style={{ tabSize: 2 }}
              placeholder="Paste or write your code here..."
            />
          </div>
        </div>

        {/* Status & Validation Bar */}
        <div className="h-10 px-4 border-t border-[#2d2d38] bg-[#161619] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {parseResult.valid ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valid {format.toUpperCase()}</span>
                <span className="text-zinc-500 font-mono">•</span>
                <span className="font-mono text-zinc-300">
                  {parseResult.nodeCount} elements parsed
                </span>
                {parseResult.rootNode && (
                  <span className="text-zinc-500 font-mono text-[10px]">
                    (Root: #{parseResult.rootNode.id})
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span>{parseResult.err || 'Syntax Error'}</span>
              </span>
            )}
            {error && <span className="text-red-400 ml-2 font-mono">• {error}</span>}
          </div>

          <button
            onClick={handleExecuteImport}
            disabled={!parseResult.valid}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold px-4 py-1.5 rounded transition-all shadow-md"
          >
            {success ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            <span>{success ? 'Loaded to Canvas!' : 'Load Layout to Canvas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
