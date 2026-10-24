import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  exportLayoutEngineGoldenTest, 
  exportLayoutEngineYaml, 
  exportToHtmlCss 
} from '../../core/layoutSerializer';
import { X, Copy, Check, Download, FileText, FileJson, Code, DownloadCloud } from 'lucide-react';

interface ExportTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToImport?: () => void;
}

// Preserve exact indentation and render syntax colors
const highlightYaml = (text: string): React.ReactNode => {
  return text.split('\n').map((line, i) => {
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
    return (
      <div key={i} className="whitespace-pre font-mono text-zinc-300 leading-relaxed">
        {line || ' '}
      </div>
    );
  });
};

const highlightJson = (text: string): React.ReactNode => {
  return text.split('\n').map((line, i) => {
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
  });
};

const highlightHtmlCss = (text: string): React.ReactNode => {
  return text.split('\n').map((line, i) => {
    if (line.trim().startsWith('/*') || line.trim().startsWith('<!--')) {
      return (
        <div key={i} className="whitespace-pre font-mono text-zinc-500 italic">
          {line}
        </div>
      );
    }

    const coloredLine = line
      .replace(/(<[/]?[a-zA-Z0-9_-]+)(.*?>)/g, '<span class="text-pink-400 font-semibold">$1</span><span class="text-zinc-400">$2</span>')
      .replace(/class="([^"]+)"/g, '<span class="text-cyan-400 font-medium">class</span>="<span class="text-yellow-300 font-semibold">$1</span>"')
      .replace(/id="([^"]+)"/g, '<span class="text-purple-400 font-medium">id</span>="<span class="text-sky-300 font-mono">$1</span>"')
      .replace(/(\.[a-zA-Z0-9_-]+)\s*\{/g, '<span class="text-yellow-400 font-bold">$1</span> {')
      .replace(/^(\s*)([a-zA-Z0-9_-]+):/g, '$1<span class="text-sky-300 font-medium">$2</span>:')
      .replace(/:\s*([^;]+);/g, ': <span class="text-emerald-300">$1</span>;');

    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: coloredLine }}
        className="whitespace-pre font-mono leading-relaxed"
      />
    );
  });
};

export const ExportTestModal: React.FC<ExportTestModalProps> = ({ isOpen, onClose, onSwitchToImport }) => {
  const { rootNode, metricsMap, screenWidth, screenHeight } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'yaml' | 'json' | 'html'>('yaml');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yamlString = exportLayoutEngineYaml(
    rootNode,
    metricsMap,
    'CustomLayoutEngineTest',
    screenWidth,
    screenHeight
  );

  const goldenTestVector = exportLayoutEngineGoldenTest(
    rootNode,
    metricsMap,
    'CustomLayoutEngineTest',
    screenWidth,
    screenHeight
  );
  const jsonString = JSON.stringify(goldenTestVector, null, 2);

  const { html, css } = exportToHtmlCss(rootNode);
  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Layout Engine Golden Test Case</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

  const getRawContent = () => {
    switch (activeTab) {
      case 'yaml':
        return yamlString;
      case 'json':
        return jsonString;
      case 'html':
        return standaloneHtml;
    }
  };

  const rawContent = getRawContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let filename = 'layout-test-vector.yaml';
    let mime = 'text/yaml';
    if (activeTab === 'json') {
      filename = 'layout-test-vector.json';
      mime = 'application/json';
    } else if (activeTab === 'html') {
      filename = 'layout-test.html';
      mime = 'text/html';
    }

    const blob = new Blob([rawContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const linesCount = rawContent.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#1c1c20] border border-[#33333d] rounded-lg shadow-2xl w-[940px] max-w-[95vw] h-[660px] flex flex-col text-xs text-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#2d2d38] flex items-center justify-between bg-[#161619]">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-sm text-zinc-100">Export Layout Test Case</span>
            <span className="bg-sky-950 text-sky-400 font-mono text-[10px] px-2 py-0.5 rounded border border-sky-800 font-semibold">
              Parent-Child Hierarchical Model
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToImport && (
              <button
                onClick={onSwitchToImport}
                className="text-[11px] text-zinc-400 hover:text-emerald-400 underline"
              >
                Switch to Import
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

        {/* Tab Selector & Actions Bar */}
        <div className="px-4 py-2 border-b border-[#2d2d38] bg-[#19191d] flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#222227] p-1 rounded border border-[#33333a]">
            {/* YAML TAB */}
            <button
              onClick={() => setActiveTab('yaml')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'yaml'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Hierarchical YAML</span>
            </button>

            {/* JSON TAB */}
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-blue-300" />
              <span>JSON Hierarchy</span>
            </button>

            {/* HTML/CSS TAB */}
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'html'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-pink-300" />
              <span>HTML + CSS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-[#282830] hover:bg-[#343440] border border-[#3f3f4e] text-zinc-200 px-3 py-1 rounded font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content with Line Numbers & Preserved Indentations */}
        <div className="flex-1 flex overflow-hidden bg-[#0c0c0e]">
          {/* Line Numbers Gutter */}
          <div className="w-11 bg-[#121216] border-r border-[#222228] py-3 select-none flex flex-col items-end pr-2 text-zinc-600 font-mono text-[11px] leading-relaxed">
            {Array.from({ length: linesCount }).map((_, idx) => (
              <div key={idx} className="h-5">{idx + 1}</div>
            ))}
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div 
            className="flex-1 p-3 overflow-auto font-mono text-[12px] leading-5 select-text custom-scrollbar whitespace-pre"
            style={{ tabSize: 2 }}
          >
            {activeTab === 'yaml' && highlightYaml(yamlString)}
            {activeTab === 'json' && highlightJson(jsonString)}
            {activeTab === 'html' && highlightHtmlCss(standaloneHtml)}
          </div>
        </div>

        {/* Explanatory Footer */}
        <div className="p-2.5 border-t border-[#2d2d38] bg-[#161619] text-[11px] text-zinc-400 flex items-center justify-between">
          <span>
            {activeTab === 'yaml'
              ? 'Tether UI Native Schema (flow: ROW/COLUMN, gap: [x,y], margin, padding, fill_ratio).'
              : activeTab === 'json'
              ? 'Nested JSON hierarchy with parentId links, declared styles, and computed geometry for unit testing.'
              : 'Standalone clean HTML & CSS representation with matching IDs and classes.'}
          </span>
          <span className="font-mono text-zinc-400">
            Root: {screenWidth}×{screenHeight} px
          </span>
        </div>
      </div>
    </div>
  );
};
