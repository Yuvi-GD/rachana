import { useState, useEffect } from 'react';
import { ComputedMetrics, LayoutNode, LayoutNodeStyle, LayoutNodeType, isContainerNodeType } from '../types/layout';
import { LAYOUT_PRESETS } from '../core/presets';
import { createWidgetPreset } from '../core/defaultStyles';

export interface DevicePreset {
  name: string;
  width: number;
  height: number;
  isCustom?: boolean;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { name: 'Fit / Custom', width: 800, height: 520, isCustom: true },
  { name: 'HD 720p (1280×720)', width: 1280, height: 720 },
  { name: 'FHD 1080p (1920×1080)', width: 1920, height: 1080 },
  { name: 'Tablet (820×1180)', width: 820, height: 1180 },
  { name: 'Mobile (390×844)', width: 390, height: 844 },
  { name: 'Small Box (500×400)', width: 500, height: 400 },
];

export interface EditorState {
  rootNode: LayoutNode;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  zoom: number;
  panOffset: { x: number; y: number };
  screenWidth: number;
  screenHeight: number;
  devicePreset: DevicePreset;
  showOverlays: boolean;
  showRulers: boolean;
  showMetrics: boolean;
  showLeftPanel: boolean;
  showBottomPanel: boolean;
  showRightPanel: boolean;
  activeTab: 'details' | 'metrics' | 'export';
  metricsMap: Record<string, ComputedMetrics>;
  history: LayoutNode[];
  historyIndex: number;
  maxHistorySteps: number;
  scrollSensitivity: number;
  scriptError: string | null;

  // Panel layout sizes (Unreal Engine Docking)
  leftPanelWidth: number;
  paletteHeight: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  isCodeMaximized: boolean;
  isSimulating: boolean;
  simulationLogs: Array<{ id: string; time: string; text: string; type: 'click' | 'input' | 'focus' }>;
  preferences: EditorPreferences;
}

export interface EditorPreferences {
  theme: 'grey' | 'amoled-black' | 'white';
  codeFontSize: number; // 10 to 18, default 12
  autoSyncScript: boolean; // default true
}

const DEFAULT_PREFERENCES: EditorPreferences = {
  theme: 'grey',
  codeFontSize: 12,
  autoSyncScript: true,
};

function loadStoredPreferences(): EditorPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem('rachana_preferences');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy theme names if present
      let theme: 'grey' | 'amoled-black' | 'white' = 'grey';
      if (parsed.theme === 'amoled-black' || parsed.theme === 'high-contrast') theme = 'amoled-black';
      else if (parsed.theme === 'white') theme = 'white';
      return { ...DEFAULT_PREFERENCES, ...parsed, theme };
    }
  } catch {}
  return DEFAULT_PREFERENCES;
}

function loadStoredNumber(key: string, defaultVal: number): number {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) return parsed;
    }
  } catch {}
  return defaultVal;
}

const initialPreferences = loadStoredPreferences();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialPreferences.theme || 'grey');
}
const initialMaxHistory = Math.round(loadStoredNumber('rachana_max_history', 64));
const initialScrollSens = loadStoredNumber('rachana_scroll_sens', 1.0);
const initialBottomHeight = typeof window !== 'undefined'
  ? Math.max(160, Math.round((window.innerHeight - 48) * 0.38))
  : 300;

// Initial state
let state: EditorState = {
  rootNode: JSON.parse(JSON.stringify(LAYOUT_PRESETS[0].rootNode)),
  selectedNodeId: LAYOUT_PRESETS[0].rootNode.id,
  hoveredNodeId: null,
  zoom: 1,
  panOffset: { x: 50, y: 50 },
  screenWidth: 800,
  screenHeight: 520,
  devicePreset: DEVICE_PRESETS[0],
  showOverlays: true,
  showRulers: true,
  showMetrics: true,
  showLeftPanel: true,
  showBottomPanel: true,
  showRightPanel: true,
  activeTab: 'details',
  metricsMap: {},
  history: [JSON.parse(JSON.stringify(LAYOUT_PRESETS[0].rootNode))],
  historyIndex: 0,
  maxHistorySteps: initialMaxHistory,
  scrollSensitivity: initialScrollSens,
  scriptError: null,

  leftPanelWidth: 260,
  paletteHeight: typeof window !== 'undefined' ? Math.max(260, Math.round((window.innerHeight - 60) * 0.5)) : 360,
  rightPanelWidth: 340,
  bottomPanelHeight: initialBottomHeight,
  isCodeMaximized: false,
  isSimulating: false,
  simulationLogs: [],
  preferences: initialPreferences,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function pushHistory(newRoot: LayoutNode) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newRoot)));
  const limit = state.maxHistorySteps || 64;
  while (newHistory.length > limit) {
    newHistory.shift();
  }
  state = {
    ...state,
    rootNode: newRoot,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
  emitChange();
}

// Deep clone helper
const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Recursive tree find & update
function updateNodeInTree(node: LayoutNode, id: string, fn: (n: LayoutNode) => void): boolean {
  if (node.id === id) {
    fn(node);
    return true;
  }
  for (const child of node.children) {
    if (updateNodeInTree(child, id, fn)) return true;
  }
  return false;
}

function findNodeById(node: LayoutNode, id: string | null): LayoutNode | null {
  if (!id) return null;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function deleteNodeFromTree(parent: LayoutNode, targetId: string): boolean {
  const idx = parent.children.findIndex(c => c.id === targetId);
  if (idx !== -1) {
    parent.children.splice(idx, 1);
    return true;
  }
  for (const child of parent.children) {
    if (deleteNodeFromTree(child, targetId)) return true;
  }
  return false;
}

function removeNode(parent: LayoutNode, id: string): LayoutNode | null {
  const idx = parent.children.findIndex(c => c.id === id);
  if (idx !== -1) {
    return parent.children.splice(idx, 1)[0];
  }
  for (const child of parent.children) {
    const res = removeNode(child, id);
    if (res) return res;
  }
  return null;
}

function findParentOfNode(root: LayoutNode, targetId: string): { parent: LayoutNode; index: number } | null {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === targetId) {
      return { parent: root, index: i };
    }
    const found = findParentOfNode(root.children[i], targetId);
    if (found) return found;
  }
  return null;
}

export const editorStore = {
  getState: () => state,

  selectNode: (id: string | null) => {
    if (state.selectedNodeId !== id) {
      state = { ...state, selectedNodeId: id };
      emitChange();
    }
  },

  setHoveredNode: (id: string | null) => {
    if (state.hoveredNodeId !== id) {
      state = { ...state, hoveredNodeId: id };
      emitChange();
    }
  },

  setZoom: (zoom: number) => {
    const clamped = Math.min(Math.max(zoom, 0.2), 3.5);
    state = { ...state, zoom: clamped };
    emitChange();
  },

  setPanOffset: (panOffset: { x: number; y: number }) => {
    state = { ...state, panOffset };
    emitChange();
  },

  setViewportTransform: (zoom: number, panOffset: { x: number; y: number }) => {
    const clamped = Math.min(Math.max(zoom, 0.15), 5.0);
    state = { ...state, zoom: clamped, panOffset };
    emitChange();
  },

  setScrollSensitivity: (scrollSensitivity: number) => {
    const clamped = Math.max(0.1, Math.min(scrollSensitivity, 3.0));
    state = { ...state, scrollSensitivity: clamped };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rachana_scroll_sens', String(clamped));
      } catch {}
    }
    emitChange();
  },

  setScriptError: (scriptError: string | null) => {
    if (state.scriptError !== scriptError) {
      state = { ...state, scriptError };
      emitChange();
    }
  },

  setScreenSize: (width: number, height: number) => {
    const clampedW = Math.max(200, Math.min(width, 3840));
    const clampedH = Math.max(150, Math.min(height, 2160));
    
    // Also sync rootNode width and height so the root IS the screen canvas
    const rootCopy = clone(state.rootNode);
    rootCopy.name = 'Screen Canvas (Root)';
    rootCopy.style.width = `${Math.round(clampedW)}px`;
    rootCopy.style.height = `${Math.round(clampedH)}px`;

    state = {
      ...state,
      rootNode: rootCopy,
      screenWidth: Math.round(clampedW),
      screenHeight: Math.round(clampedH),
      devicePreset: {
        name: `Custom (${Math.round(clampedW)}×${Math.round(clampedH)})`,
        width: Math.round(clampedW),
        height: Math.round(clampedH),
        isCustom: true,
      },
    };
    emitChange();
  },

  setDevicePreset: (preset: DevicePreset) => {
    const rootCopy = clone(state.rootNode);
    rootCopy.name = 'Screen Canvas (Root)';
    rootCopy.style.width = `${preset.width}px`;
    rootCopy.style.height = `${preset.height}px`;

    state = {
      ...state,
      rootNode: rootCopy,
      devicePreset: preset,
      screenWidth: preset.width,
      screenHeight: preset.height,
    };
    emitChange();
  },

  // Panel dock sizes
  setLeftPanelWidth: (width: number) => {
    const clamped = Math.max(160, Math.min(width, 600));
    state = { ...state, leftPanelWidth: Math.round(clamped) };
    emitChange();
  },

  setPaletteHeight: (height: number) => {
    const clamped = Math.max(100, Math.min(height, 500));
    state = { ...state, paletteHeight: Math.round(clamped) };
    emitChange();
  },

  setRightPanelWidth: (width: number) => {
    const clamped = Math.max(200, Math.min(width, 700));
    state = { ...state, rightPanelWidth: Math.round(clamped) };
    emitChange();
  },

  setBottomPanelHeight: (height: number) => {
    const maxHeight = typeof window !== 'undefined' ? Math.max(300, window.innerHeight - 120) : 800;
    const clamped = Math.max(80, Math.min(height, maxHeight));
    state = { ...state, bottomPanelHeight: Math.round(clamped) };
    emitChange();
  },

  setPreferences: (partial: Partial<EditorPreferences>) => {
    const updated = { ...state.preferences, ...partial };
    state = { ...state, preferences: updated };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rachana_preferences', JSON.stringify(updated));
        if (updated.theme) {
          document.documentElement.setAttribute('data-theme', updated.theme);
        }
      } catch {}
    }
    emitChange();
  },

  toggleOverlays: () => {
    state = { ...state, showOverlays: !state.showOverlays };
    emitChange();
  },

  toggleRulers: () => {
    state = { ...state, showRulers: !state.showRulers };
    emitChange();
  },

  toggleMetrics: () => {
    state = { ...state, showMetrics: !state.showMetrics, showBottomPanel: !state.showMetrics };
    emitChange();
  },

  toggleLeftPanel: () => {
    state = { ...state, showLeftPanel: !state.showLeftPanel };
    emitChange();
  },

  toggleBottomPanel: () => {
    state = { ...state, showBottomPanel: !state.showBottomPanel, showMetrics: !state.showBottomPanel };
    emitChange();
  },

  toggleRightPanel: () => {
    state = { ...state, showRightPanel: !state.showRightPanel };
    emitChange();
  },

  toggleCodeMaximized: () => {
    state = { ...state, isCodeMaximized: !state.isCodeMaximized };
    emitChange();
  },

  setCodeMaximized: (val: boolean) => {
    state = { ...state, isCodeMaximized: val };
    emitChange();
  },

  toggleSimulation: () => {
    state = { ...state, isSimulating: !state.isSimulating };
    emitChange();
  },

  setSimulating: (val: boolean) => {
    state = { ...state, isSimulating: val };
    emitChange();
  },

  addSimulationLog: (text: string, type: 'click' | 'input' | 'focus' = 'click') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = { id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, time, text, type };
    state = { ...state, simulationLogs: [newLog, ...state.simulationLogs.slice(0, 49)] };
    emitChange();
  },

  clearSimulationLogs: () => {
    state = { ...state, simulationLogs: [] };
    emitChange();
  },

  setActiveTab: (tab: 'details' | 'metrics' | 'export') => {
    state = { ...state, activeTab: tab };
    emitChange();
  },

  updateNodeStyle: (id: string, styleUpdates: Partial<LayoutNodeStyle>) => {
    const rootCopy = clone(state.rootNode);
    let changed = false;
    updateNodeInTree(rootCopy, id, (node) => {
      node.style = { ...node.style, ...styleUpdates };
      changed = true;
    });
    if (changed) {
      pushHistory(rootCopy);
    }
  },

  updateNodeProps: (id: string, updates: Partial<LayoutNode>) => {
    const rootCopy = clone(state.rootNode);
    let changed = false;
    updateNodeInTree(rootCopy, id, (node) => {
      Object.assign(node, updates);
      changed = true;
    });
    if (changed) {
      pushHistory(rootCopy);
    }
  },

  addNode: (parentId: string, widgetType: LayoutNodeType, customName?: string, index?: number) => {
    const rootCopy = clone(state.rootNode);
    const newNode = createWidgetPreset(widgetType, customName);

    // Resolve target: check if parentId exists in tree; fallback to root if not
    let targetNode = (parentId && findNodeById(rootCopy, parentId)) ? findNodeById(rootCopy, parentId)! : rootCopy;
    let targetIndex = index;

    // If targetNode is NOT a container, insert as sibling into target's parent container
    if (!isContainerNodeType(targetNode.type) && targetNode.id !== rootCopy.id) {
      const parentInfo = findParentOfNode(rootCopy, targetNode.id);
      if (parentInfo) {
        targetNode = parentInfo.parent;
        targetIndex = typeof index === 'number' ? index : parentInfo.index + 1;
      } else {
        targetNode = rootCopy;
      }
    }

    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= targetNode.children.length) {
      targetNode.children.splice(targetIndex, 0, newNode);
    } else {
      targetNode.children.push(newNode);
    }
    targetNode.isExpanded = true;

    state.selectedNodeId = newNode.id;
    pushHistory(rootCopy);
  },

  reparentNode: (draggedId: string, targetParentId: string, targetIndex?: number) => {
    if (!draggedId || !targetParentId || draggedId === targetParentId || draggedId === state.rootNode.id) return;
    const rootCopy = clone(state.rootNode);

    // Prevent cycle: cannot reparent a node into its own descendant
    const draggedNode = findNodeById(rootCopy, draggedId);
    if (!draggedNode) return;
    if (findNodeById(draggedNode, targetParentId)) return;

    let targetNode = findNodeById(rootCopy, targetParentId) || rootCopy;
    let actualIndex = targetIndex;

    // If targetNode is NOT a container, insert as sibling in its parent container
    if (!isContainerNodeType(targetNode.type) && targetNode.id !== rootCopy.id) {
      const parentInfo = findParentOfNode(rootCopy, targetNode.id);
      if (parentInfo) {
        targetNode = parentInfo.parent;
        actualIndex = typeof targetIndex === 'number' ? targetIndex : parentInfo.index + 1;
      } else {
        targetNode = rootCopy;
      }
    }

    const removed = removeNode(rootCopy, draggedId);
    if (!removed) return;

    if (typeof actualIndex === 'number' && actualIndex >= 0 && actualIndex <= targetNode.children.length) {
      targetNode.children.splice(actualIndex, 0, removed);
    } else {
      targetNode.children.push(removed);
    }
    targetNode.isExpanded = true;

    state.selectedNodeId = removed.id;
    pushHistory(rootCopy);
  },

  addNodeAround: (referenceNodeId: string, widgetType: LayoutNodeType, customName?: string, position: 'before' | 'after' = 'after') => {
    const rootCopy = clone(state.rootNode);
    const newNode = createWidgetPreset(widgetType, customName);

    const parentInfo = findParentOfNode(rootCopy, referenceNodeId);
    if (parentInfo) {
      const insertIndex = position === 'before' ? parentInfo.index : parentInfo.index + 1;
      parentInfo.parent.children.splice(insertIndex, 0, newNode);
      parentInfo.parent.isExpanded = true;
    } else {
      rootCopy.children.push(newNode);
    }

    state.selectedNodeId = newNode.id;
    pushHistory(rootCopy);
  },

  reparentNodeAround: (draggedId: string, referenceNodeId: string, position: 'before' | 'after' = 'after') => {
    if (!draggedId || !referenceNodeId || draggedId === referenceNodeId || draggedId === state.rootNode.id) return;
    const rootCopy = clone(state.rootNode);

    const draggedNode = findNodeById(rootCopy, draggedId);
    if (!draggedNode) return;
    if (findNodeById(draggedNode, referenceNodeId)) return;

    const removed = removeNode(rootCopy, draggedId);
    if (!removed) return;

    const parentInfo = findParentOfNode(rootCopy, referenceNodeId);
    if (parentInfo) {
      const insertIndex = position === 'before' ? parentInfo.index : parentInfo.index + 1;
      parentInfo.parent.children.splice(insertIndex, 0, removed);
      parentInfo.parent.isExpanded = true;
    } else {
      rootCopy.children.push(removed);
    }

    state.selectedNodeId = removed.id;
    pushHistory(rootCopy);
  },

  deleteNode: (id: string) => {
    if (!id) return;
    const rootCopy = clone(state.rootNode);
    if (id === rootCopy.id) {
      // Clear root children (Reset / Clear canvas)
      rootCopy.children = [];
      state.selectedNodeId = rootCopy.id;
      pushHistory(rootCopy);
      return;
    }
    if (deleteNodeFromTree(rootCopy, id)) {
      state.selectedNodeId = rootCopy.id;
      pushHistory(rootCopy);
    }
  },

  replaceNodeType: (id: string, newType: LayoutNodeType) => {
    const rootCopy = clone(state.rootNode);
    let updated = false;

    updateNodeInTree(rootCopy, id, (node) => {
      node.type = newType;
      if (newType === 'flex') {
        node.style.display = 'flex';
        if (!node.style.flexDirection) node.style.flexDirection = 'row';
        node.style.flow = node.style.flexDirection === 'column' ? 'COLUMN' : 'ROW';
      } else if (newType === 'grid') {
        node.style.display = 'grid';
        if (!node.style.gridTemplateColumns) node.style.gridTemplateColumns = '1fr 1fr';
      } else if (newType === 'container') {
        node.style.display = 'block';
        node.style.flow = 'NONE';
      } else if (newType === 'card') {
        node.style.display = 'block';
        node.style.backgroundColor = '#1f1f26';
        node.style.borderColor = '#2e2e38';
        node.style.borderRadius = '8px';
      } else if (newType === 'scroll') {
        node.style.display = 'block';
        node.style.overflowY = 'auto';
      } else if (newType === 'button') {
        node.style.display = 'inline-block';
        node.style.cursor = 'pointer';
        if (!node.textContent) node.textContent = 'Button';
      } else if (newType === 'text') {
        node.style.display = 'block';
        if (!node.textContent) node.textContent = 'Text';
      } else if (newType === 'heading') {
        node.style.display = 'block';
        node.style.fontSize = '22px';
        node.style.fontWeight = '700';
        if (!node.textContent) node.textContent = 'Heading';
      }
      updated = true;
    });

    if (updated) {
      pushHistory(rootCopy);
    }
  },

  wrapNode: (id: string, wrapperType: LayoutNodeType) => {
    if (id === state.rootNode.id) {
      const rootCopy = clone(state.rootNode);
      const newRoot = createWidgetPreset(wrapperType, 'Root Canvas (Wrapped)');
      newRoot.style.width = rootCopy.style.width;
      newRoot.style.height = rootCopy.style.height;
      rootCopy.style.width = '100%';
      rootCopy.style.height = '100%';
      newRoot.children = [rootCopy];
      state = {
        ...state,
        rootNode: newRoot,
        selectedNodeId: newRoot.id,
      };
      pushHistory(newRoot);
      return;
    }

    const rootCopy = clone(state.rootNode);
    function findAndWrap(parent: LayoutNode): boolean {
      const idx = parent.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        const target = parent.children[idx];
        const wrapper = createWidgetPreset(wrapperType, `Wrapper (${wrapperType})`);
        wrapper.children = [target];
        parent.children[idx] = wrapper;
        state.selectedNodeId = wrapper.id;
        return true;
      }
      for (const child of parent.children) {
        if (findAndWrap(child)) return true;
      }
      return false;
    }

    if (findAndWrap(rootCopy)) {
      pushHistory(rootCopy);
    }
  },

  resetRootCanvas: (type: LayoutNodeType = 'container') => {
    const rootW = state.screenWidth || 800;
    const rootH = state.screenHeight || 520;
    const newRoot = createWidgetPreset(type, 'Screen Canvas (Root)');
    newRoot.id = 'root_' + Math.random().toString(36).substring(2, 7);
    newRoot.style.width = `${rootW}px`;
    newRoot.style.height = `${rootH}px`;
    newRoot.children = [];
    state = {
      ...state,
      rootNode: newRoot,
      selectedNodeId: newRoot.id,
      history: [newRoot],
      historyIndex: 0,
    };
    emitChange();
  },

  duplicateNode: (id: string) => {
    if (id === state.rootNode.id) return;
    const rootCopy = clone(state.rootNode);

    function findAndDuplicate(parent: LayoutNode): boolean {
      const idx = parent.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        const original = parent.children[idx];
        const dup: LayoutNode = clone(original);
        
        const reassignIds = (n: LayoutNode) => {
          n.id = 'node_' + Math.random().toString(36).substring(2, 9);
          n.name = `${n.name} (Copy)`;
          n.children.forEach(reassignIds);
        };
        reassignIds(dup);
        parent.children.splice(idx + 1, 0, dup);
        state.selectedNodeId = dup.id;
        return true;
      }
      for (const child of parent.children) {
        if (findAndDuplicate(child)) return true;
      }
      return false;
    }

    if (findAndDuplicate(rootCopy)) {
      pushHistory(rootCopy);
    }
  },

  moveNode: (id: string, direction: 'up' | 'down') => {
    if (id === state.rootNode.id) return;
    const rootCopy = clone(state.rootNode);

    function findAndMove(parent: LayoutNode): boolean {
      const idx = parent.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        if (direction === 'up' && idx > 0) {
          const temp = parent.children[idx];
          parent.children[idx] = parent.children[idx - 1];
          parent.children[idx - 1] = temp;
          return true;
        } else if (direction === 'down' && idx < parent.children.length - 1) {
          const temp = parent.children[idx];
          parent.children[idx] = parent.children[idx + 1];
          parent.children[idx + 1] = temp;
          return true;
        }
        return false;
      }
      for (const child of parent.children) {
        if (findAndMove(child)) return true;
      }
      return false;
    }

    if (findAndMove(rootCopy)) {
      pushHistory(rootCopy);
    }
  },

  loadPreset: (presetId: string) => {
    const found = LAYOUT_PRESETS.find(p => p.id === presetId);
    if (found) {
      const newRoot = clone(found.rootNode);
      newRoot.name = 'Screen Canvas (Root)';
      const rootW = parseInt(newRoot.style.width, 10) || 800;
      const rootH = parseInt(newRoot.style.height, 10) || 520;
      state = {
        ...state,
        rootNode: newRoot,
        selectedNodeId: newRoot.id,
        screenWidth: rootW,
        screenHeight: rootH,
        devicePreset: {
          name: `Custom (${rootW}×${rootH})`,
          width: rootW,
          height: rootH,
          isCustom: true,
        },
        metricsMap: {},
        history: [newRoot],
        historyIndex: 0,
      };
      emitChange();
    }
  },

  loadCustomRootNode: (customRoot: LayoutNode, isNewDocument: boolean = false) => {
    const newRoot = clone(customRoot);
    const parsedW = newRoot.style.width && newRoot.style.width.endsWith('px')
      ? parseInt(newRoot.style.width, 10)
      : (newRoot.style.width === '100%' ? state.screenWidth : (parseInt(newRoot.style.width, 10) || state.screenWidth));
    const parsedH = newRoot.style.height && newRoot.style.height.endsWith('px')
      ? parseInt(newRoot.style.height, 10)
      : (parseInt(newRoot.style.height, 10) || state.screenHeight);
    const rootW = Math.max(200, parsedW || state.screenWidth || 840);
    const rootH = Math.max(150, parsedH || state.screenHeight || 540);
    newRoot.style.width = `${rootW}px`;
    newRoot.style.height = `${rootH}px`;
    if (isNewDocument) {
      state = {
        ...state,
        rootNode: newRoot,
        selectedNodeId: newRoot.id,
        screenWidth: rootW,
        screenHeight: rootH,
        devicePreset: {
          name: `Custom (${rootW}×${rootH})`,
          width: rootW,
          height: rootH,
          isCustom: true,
        },
        metricsMap: {},
        history: [newRoot],
        historyIndex: 0,
      };
      emitChange();
    } else {
      state = {
        ...state,
        rootNode: newRoot,
        screenWidth: rootW,
        screenHeight: rootH,
      };
      pushHistory(newRoot);
    }
  },

  registerMetric: (id: string, metric: ComputedMetrics) => {
    state = {
      ...state,
      metricsMap: {
        ...state.metricsMap,
        [id]: metric,
      },
    };
    emitChange();
  },

  registerMetricsBatch: (batch: Record<string, ComputedMetrics>) => {
    state = {
      ...state,
      metricsMap: {
        ...state.metricsMap,
        ...batch,
      },
    };
    emitChange();
  },

  undo: () => {
    if (state.historyIndex > 0) {
      const prevIndex = state.historyIndex - 1;
      const prevRoot = clone(state.history[prevIndex]);
      state = {
        ...state,
        rootNode: prevRoot,
        historyIndex: prevIndex,
        selectedNodeId: findNodeById(prevRoot, state.selectedNodeId) ? state.selectedNodeId : prevRoot.id,
      };
      emitChange();
    }
  },

  redo: () => {
    if (state.historyIndex < state.history.length - 1) {
      const nextIndex = state.historyIndex + 1;
      const nextRoot = clone(state.history[nextIndex]);
      state = {
        ...state,
        rootNode: nextRoot,
        historyIndex: nextIndex,
        selectedNodeId: findNodeById(nextRoot, state.selectedNodeId) ? state.selectedNodeId : nextRoot.id,
      };
      emitChange();
    }
  },

  setMaxHistorySteps: (steps: number) => {
    const clamped = Math.max(16, Math.min(steps, 512));
    const trimmed = state.history.length > clamped ? state.history.slice(state.history.length - clamped) : state.history;
    state = {
      ...state,
      maxHistorySteps: clamped,
      history: trimmed,
      historyIndex: Math.min(state.historyIndex, trimmed.length - 1),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rachana_max_history', String(clamped));
      } catch {}
    }
    emitChange();
  },
};

export function useEditorStore(): EditorState & {
  selectedNode: LayoutNode | null;
  hoveredNode: LayoutNode | null;
  actions: typeof editorStore;
} {
  const [snapshot, setSnapshot] = useState(editorStore.getState());

  useEffect(() => {
    const onStoreChange = () => setSnapshot(editorStore.getState());
    listeners.add(onStoreChange);
    return () => {
      listeners.delete(onStoreChange);
    };
  }, []);

  const selectedNode = findNodeById(snapshot.rootNode, snapshot.selectedNodeId);
  const hoveredNode = findNodeById(snapshot.rootNode, snapshot.hoveredNodeId);

  return {
    ...snapshot,
    selectedNode,
    hoveredNode,
    actions: editorStore,
  };
}
