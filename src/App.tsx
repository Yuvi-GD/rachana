import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Palette } from './components/palette/Palette';
import { Hierarchy } from './components/hierarchy/Hierarchy';
import { Viewport } from './components/viewport/Viewport';
import { DetailsPanel } from './components/details/DetailsPanel';
import { LiveYamlPanel } from './components/script/LiveYamlPanel';
import { ExportModal } from './components/modals/ExportModal';
import { ImportModal } from './components/modals/ImportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { Splitter } from './components/common/Splitter';
import { useEditorStore } from './store/editorStore';
import { LayoutNode } from './types/layout';
import { Settings, Keyboard } from 'lucide-react';

export const App: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { 
    rootNode,
    selectedNodeId, 
    selectedNode,
    metricsMap,
    zoom,
    screenWidth,
    screenHeight,
    showMetrics, 
    showLeftPanel,
    showBottomPanel,
    showRightPanel,
    isCodeMaximized,
    isSimulating,
    leftPanelWidth, 
    paletteHeight, 
    rightPanelWidth, 
    bottomPanelHeight, 
    preferences,
    actions 
  } = useEditorStore();

  const isBottomVisible = showBottomPanel !== undefined ? showBottomPanel : showMetrics;
  const selectedMetrics = selectedNodeId ? metricsMap[selectedNodeId] : null;

  const countTreeNodes = (node: LayoutNode): number => {
    return 1 + (node.children ? node.children.reduce((acc, c) => acc + countTreeNodes(c), 0) : 0);
  };
  const totalNodes = countTreeNodes(rootNode);

  // Sync theme attribute to <html> element
  useEffect(() => {
    const theme = preferences?.theme || 'unreal-dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [preferences?.theme]);

  // Keyboard Shortcuts (Unreal Engine style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Preferences shortcut (Ctrl+,) can be pressed anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }

      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Keyboard shortcuts cheatsheet (?)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Toggle Simulation: F5
      if (e.key === 'F5') {
        e.preventDefault();
        actions.toggleSimulation();
      }
      // Undo: Ctrl+Z
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        actions.redo();
      }
      // Duplicate: Ctrl+D
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeId) actions.duplicateNode(selectedNodeId);
      }
      // Delete: Delete or Backspace key
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNodeId) actions.deleteNode(selectedNodeId);
      }
      // Escape: Stop simulation if running, or deselect
      else if (e.key === 'Escape') {
        if (isSimulating) {
          actions.setSimulating(false);
        } else {
          actions.selectNode(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, isSimulating, actions]);

  const isHighContrast = preferences?.theme === 'high-contrast';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isHighContrast ? 'bg-[#09090b] text-zinc-100' : 'bg-[#121214] text-zinc-300'}`}>
      {/* 1. Main Studio Toolbar */}
      <Toolbar 
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Workspace Body: Resizable 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ======================================================== */}
        {/* Left Studio Pane (Palette & Hierarchy)                   */}
        {/* ======================================================== */}
        {showLeftPanel && (
          <>
            <div
              style={{ width: `${leftPanelWidth}px` }}
              className="flex-shrink-0 flex flex-col overflow-hidden bg-[#18181b] border-r border-[#27272a]"
            >
              {/* Top: Palette */}
              <div
                style={{ height: `${paletteHeight}px` }}
                className="overflow-hidden flex-shrink-0"
              >
                <Palette />
              </div>

              {/* Palette / Hierarchy Splitter */}
              <Splitter
                direction="vertical"
                currentSize={paletteHeight}
                onUpdateSize={actions.setPaletteHeight}
                min={36}
                max={650}
                onDoubleClick={() => actions.setPaletteHeight(typeof window !== 'undefined' ? Math.max(260, Math.round((window.innerHeight - 60) * 0.5)) : 360)}
              />

              {/* Bottom: Hierarchy Tree */}
              <div className="flex-1 overflow-hidden">
                <Hierarchy />
              </div>
            </div>

            {/* Left Panel <-> Viewport Splitter */}
            <Splitter
              direction="horizontal"
              currentSize={leftPanelWidth}
              onUpdateSize={actions.setLeftPanelWidth}
              min={120}
              max={600}
              onDoubleClick={() => actions.setLeftPanelWidth(240)}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* Center Canvas Pane (Viewport & Resizable Metrics Drawer) */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Viewport Canvas (Hidden when code editor is maximized in center pane) */}
          <div className={`relative overflow-hidden ${isCodeMaximized ? 'hidden' : 'flex-1'}`}>
            <Viewport />
          </div>

          {/* Viewport <-> Bottom Metrics Splitter */}
          {isBottomVisible && !isCodeMaximized && (
            <Splitter
              direction="vertical"
              invert={true}
              currentSize={bottomPanelHeight}
              onUpdateSize={actions.setBottomPanelHeight}
              min={80}
              max={typeof window !== 'undefined' ? Math.max(300, window.innerHeight - 120) : 700}
              onDoubleClick={() => {
                const newHeight = typeof window !== 'undefined'
                  ? Math.max(160, Math.round((window.innerHeight - 48) * 0.38))
                  : 300;
                actions.setBottomPanelHeight(newHeight);
              }}
            />
          )}

          {/* Bottom Live Script Panel */}
          {(isBottomVisible || isCodeMaximized) && (
            <div
              style={isCodeMaximized ? undefined : { height: `${bottomPanelHeight}px` }}
              className={`overflow-hidden ${isCodeMaximized ? 'flex-1 h-full' : 'flex-shrink-0'}`}
            >
              <LiveYamlPanel />
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* Right Studio Pane (Details / Properties Inspector)       */}
        {/* ======================================================== */}
        {showRightPanel && (
          <>
            {/* Viewport <-> Right Details Splitter */}
            <Splitter
              direction="horizontal"
              invert={true}
              currentSize={rightPanelWidth}
              onUpdateSize={actions.setRightPanelWidth}
              min={240}
              max={650}
              onDoubleClick={() => actions.setRightPanelWidth(340)}
            />

            <div
              style={{ width: `${rightPanelWidth}px` }}
              className="flex-shrink-0 overflow-hidden bg-[#18181b] border-l border-[#27272a]"
            >
              <DetailsPanel />
            </div>
          </>
        )}
      </div>

      {/* 3. VS Code-Style Bottom Status Bar */}
      <footer className="h-6 bg-[#141417] border-t border-[#27272a] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none flex-shrink-0 z-20">
        {/* Left: Node info, dimensions, element count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-sans font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Rachana</span>
          </div>

          <div className="h-3 w-[1px] bg-[#22222a]" />

          {/* Selected Node or Root Canvas */}
          <span className="text-zinc-300 truncate max-w-[220px]">
            {selectedNode ? `${selectedNode.type} #${selectedNode.id}` : 'Screen Canvas (Root)'}
          </span>

          {selectedMetrics && (
            <span className="text-blue-400 font-semibold">
              {Math.round(selectedMetrics.boundingRect.width)} × {Math.round(selectedMetrics.boundingRect.height)} px
            </span>
          )}

          <div className="h-3 w-[1px] bg-[#22222a]" />

          <span className="text-zinc-500">
            {totalNodes} {totalNodes === 1 ? 'element' : 'elements'}
          </span>
        </div>

        {/* Right: Resolution, Zoom, Shortcuts, Settings */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            {screenWidth}×{screenHeight} px
          </span>

          <div className="h-3 w-[1px] bg-[#22222a]" />

          <span className="text-zinc-400 font-semibold">
            {Math.round(zoom * 100)}%
          </span>

          <div className="h-3 w-[1px] bg-[#22222a]" />

          <span className="text-zinc-500 hidden sm:inline">Spaces: 2</span>
          <span className="text-zinc-500 hidden sm:inline">UTF-8</span>

          <div className="h-3 w-[1px] bg-[#22222a]" />

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            title="Keyboard Shortcuts Cheatsheet (?)"
          >
            <Keyboard className="w-3 h-3 text-zinc-500" />
            <span>Shortcuts</span>
          </button>

          <div className="h-3 w-[1px] bg-[#22222a]" />

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            title="Open Studio Settings (Ctrl+,)"
          >
            <Settings className="w-3 h-3 text-zinc-500" />
            <span>Settings</span>
          </button>
        </div>
      </footer>

      {/* Dedicated Export Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        onSwitchToImport={() => {
          setIsExportOpen(false);
          setIsImportOpen(true);
        }}
      />

      {/* Dedicated Import Modal with Syntax Coloring & Multi-format parser */}
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onSwitchToExport={() => {
          setIsImportOpen(false);
          setIsExportOpen(true);
        }}
      />

      {/* Dedicated Studio Preferences / Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Dedicated Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
