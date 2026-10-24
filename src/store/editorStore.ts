import { useState, useEffect } from 'react';
import { ComputedMetrics, LayoutNode, LayoutNodeStyle, LayoutNodeType } from '../types/layout';
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

interface EditorState {
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
  activeTab: 'details' | 'metrics' | 'export';
  metricsMap: Record<string, ComputedMetrics>;
  history: LayoutNode[];
  historyIndex: number;
  maxHistorySteps: number;
  scrollSensitivity: number;

  // Panel layout sizes (Unreal Engine Docking)
  leftPanelWidth: number;
  paletteHeight: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
}

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
  activeTab: 'details',
  metricsMap: {},
  history: [JSON.parse(JSON.stringify(LAYOUT_PRESETS[0].rootNode))],
  historyIndex: 0,
  maxHistorySteps: 64,
  scrollSensitivity: 1.0,

  leftPanelWidth: 260,
  paletteHeight: typeof window !== 'undefined' ? Math.max(260, Math.round((window.innerHeight - 60) * 0.5)) : 360,
  rightPanelWidth: 340,
  bottomPanelHeight: 180,
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

  setScrollSensitivity: (scrollSensitivity: number) => {
    const clamped = Math.max(0.2, Math.min(scrollSensitivity, 3.0));
    state = { ...state, scrollSensitivity: clamped };
    emitChange();
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
    const clamped = Math.max(80, Math.min(height, 600));
    state = { ...state, bottomPanelHeight: Math.round(clamped) };
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
    state = { ...state, showMetrics: !state.showMetrics };
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
    let added = false;

    // Resolve target: check if parentId exists in tree; fallback to root if not
    const targetId = (parentId && findNodeById(rootCopy, parentId)) ? parentId : rootCopy.id;

    updateNodeInTree(rootCopy, targetId, (parent) => {
      if (typeof index === 'number' && index >= 0 && index <= parent.children.length) {
        parent.children.splice(index, 0, newNode);
      } else {
        parent.children.push(newNode);
      }
      parent.isExpanded = true;
      added = true;
    });

    if (added) {
      state.selectedNodeId = newNode.id;
      pushHistory(rootCopy);
    }
  },

  reparentNode: (draggedId: string, targetParentId: string, targetIndex?: number) => {
    if (!draggedId || !targetParentId || draggedId === targetParentId || draggedId === state.rootNode.id) return;
    const rootCopy = clone(state.rootNode);

    // Prevent cycle: cannot reparent a node into its own descendant
    const draggedNode = findNodeById(rootCopy, draggedId);
    if (!draggedNode) return;
    if (findNodeById(draggedNode, targetParentId)) return;

    // Resolve target: if targetParentId is invalid, reparent to root
    const resolvedTargetId = findNodeById(rootCopy, targetParentId) ? targetParentId : rootCopy.id;

    const removed = removeNode(rootCopy, draggedId);
    if (!removed) return;

    let inserted = false;
    updateNodeInTree(rootCopy, resolvedTargetId, (parent) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= parent.children.length) {
        parent.children.splice(targetIndex, 0, removed);
      } else {
        parent.children.push(removed);
      }
      parent.isExpanded = true;
      inserted = true;
    });

    if (inserted) {
      state.selectedNodeId = removed.id;
      pushHistory(rootCopy);
    }
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

  loadCustomRootNode: (customRoot: LayoutNode) => {
    const newRoot = clone(customRoot);
    const rootW = parseInt(newRoot.style.width, 10) || 840;
    const rootH = parseInt(newRoot.style.height, 10) || 540;
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
      };
      emitChange();
    }
  },

  setMaxHistorySteps: (steps: number) => {
    const clamped = Math.max(16, Math.min(steps, 256));
    const trimmed = state.history.length > clamped ? state.history.slice(state.history.length - clamped) : state.history;
    state = {
      ...state,
      maxHistorySteps: clamped,
      history: trimmed,
      historyIndex: Math.min(state.historyIndex, trimmed.length - 1),
    };
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
