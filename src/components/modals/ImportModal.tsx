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
  FolderOpen
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToExport?: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSwitchToExport }) => {
  const { rootNode, metricsMap, actions } = useEditorStore();
  const [format, setFormat] = useState<'yaml' | 'json' | 'html'>('yaml');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) setFormat('json');
    else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) setFormat('html');
    else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) setFormat('yaml');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCode(text);
        setError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadCurrentScreen = () => {
    if (format === 'yaml') {
      setCode(exportLayoutEngineYaml(rootNode, metricsMap));
    } else if (format === 'json') {
      setCode(JSON.stringify(exportLayoutEngineGoldenTest(rootNode, metricsMap), null, 2));
    } else {
      setCode(exportToHtmlCss(rootNode).html);
    }
    setError(null);
  };

  const handleExecuteImport = () => {
    setError(null);
    if (!code.trim()) {
      setError('Please paste layout code or select a file to import.');
      return;
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#1c1c20] border border-[#33333d] rounded-lg shadow-2xl w-[900px] max-w-[95vw] h-[640px] flex flex-col text-xs text-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#2d2d38] flex items-center justify-between bg-[#161619]">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">Import Layout Specification</span>
            <span className="bg-emerald-950 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-semibold">
              YAML • JSON • HTML
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToExport && (
              <button
                onClick={onSwitchToExport}
                className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#25252c] rounded border border-[#353540] transition-colors"
              >
                Switch to Export
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#25252a] rounded text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-4 py-2 bg-[#19191d] border-b border-[#292930] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Format Selection Tabs */}
            <div className="flex items-center bg-[#121215] p-0.5 rounded border border-[#2d2d38]">
              <button
                onClick={() => handleSelectFormat('yaml')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  format === 'yaml'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>YAML</span>
              </button>
              <button
                onClick={() => handleSelectFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  format === 'json'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileJson className="w-3.5 h-3.5 text-blue-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => handleSelectFormat('html')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  format === 'html'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTML</span>
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml,.json,.html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Choose File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#25252e] hover:bg-[#32323e] border border-[#3f3f4e] text-zinc-200 text-xs font-medium transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Choose File...</span>
            </button>

            {/* Load from Canvas */}
            <button
              onClick={handleLoadCurrentScreen}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#25252c] rounded border border-transparent hover:border-[#353540] transition-colors"
            >
              Load Active Canvas Text
            </button>
          </div>

          {/* Validation Pill */}
          <div className="flex items-center gap-2">
            {code.trim() && (
              <span
                className={`font-mono text-[11px] px-2.5 py-0.5 rounded font-semibold ${
                  parseResult.valid
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950/80 text-red-300 border border-red-800'
                }`}
              >
                {parseResult.valid ? `✓ Valid (${parseResult.nodeCount} nodes)` : '✗ Syntax Error'}
              </span>
            )}
          </div>
        </div>

        {/* Textarea Code Editor */}
        <div className="flex-1 relative p-3 bg-[#111114] overflow-hidden flex flex-col">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder={`Paste your ${format.toUpperCase()} layout specification here, or click "Choose File..." to upload a file.`}
            className="flex-1 w-full p-3 bg-[#18181c] border border-[#2a2a35] rounded font-mono text-[11px] leading-relaxed text-zinc-100 outline-none resize-none focus:border-blue-500/80 custom-scrollbar selection:bg-[#264f78]"
            spellCheck={false}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-950/80 border-t border-red-900/60 text-red-300 flex items-center gap-2 text-[11px] font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="h-12 px-4 border-t border-[#2d2d38] flex items-center justify-between bg-[#161619]">
          <span className="text-[11px] text-zinc-400 font-mono">
            {code.trim() ? `${code.split('\n').length} lines • ${code.length} chars` : 'Empty editor'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-zinc-300 hover:text-white hover:bg-[#26262e] border border-[#33333e] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={!code.trim() || !parseResult.valid}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              {success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Imported Successfully!</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Import & Apply to Canvas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
