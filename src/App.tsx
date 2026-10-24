import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { Palette } from './components/palette/Palette';
import { Hierarchy } from './components/hierarchy/Hierarchy';
import { Viewport } from './components/viewport/Viewport';
import { DetailsPanel } from './components/details/DetailsPanel';
import { LiveYamlPanel } from './components/script/LiveYamlPanel';
import { ExportTestModal } from './components/modals/ExportTestModal';
import { ImportModal } from './components/modals/ImportModal';
import { Splitter } from './components/common/Splitter';
import { useEditorStore } from './store/editorStore';

export const App: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { 
    selectedNodeId, 
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
    actions 
  } = useEditorStore();

  const isBottomVisible = showBottomPanel !== undefined ? showBottomPanel : showMetrics;

  // Keyboard Shortcuts (Unreal Engine style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121214] text-zinc-300">
      {/* 1. Main Studio Toolbar */}
      <Toolbar />

      {/* 2. Workspace Body: Resizable 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ======================================================== */}
        {/* Left Studio Pane (Palette & Hierarchy)                   */}
        {/* ======================================================== */}
        {showLeftPanel && (
          <>
            <div
              style={{ width: `${leftPanelWidth}px` }}
              className="flex-shrink-0 flex flex-col overflow-hidden bg-[#1e1e22]"
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
              max={500}
              onDoubleClick={() => actions.setBottomPanelHeight(180)}
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
              className="flex-shrink-0 overflow-hidden bg-[#1e1e22]"
            >
              <DetailsPanel />
            </div>
          </>
        )}
      </div>

      {/* Dedicated Export Modal */}
      <ExportTestModal 
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
    </div>
  );
};

export default App;
