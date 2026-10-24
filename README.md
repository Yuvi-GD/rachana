# Rachana (रचना) — Visual Layout Studio & Engine Testbed

> **रचना (Rachana)** — *Sanskrit for Creation, Layout, Design, and Architectural Composition.*

**Rachana** is a professional visual layout testbed, inspector, and blueprint editor inspired by **Unreal Engine's UMG Widget Designer** and browser **DevTools box-model inspectors**. 

Designed specifically for layout engine authors, UI system architects, and design-to-code engineers, Rachana provides real-time ground-truth verification of flexbox, grid, box-model geometry, sizing constraints, and hierarchy trees.

---

## 🌟 Key Capabilities

### 1. Unreal Engine & Slate-Inspired Docking Workspace
- **Palette**: Catalog of containers (`Flex Row`, `Flex Column`, `CSS Grid`, `Card Box`, `Scroll Area`, `Block Container`) and primitives (`Heading`, `Text`, `Button`, `Input`, `Badge`, `Image`, `Divider`, `Spacer`).
- **Hierarchy Tree**: Hierarchical tree with drag-and-drop reparenting, instant sibling insertion indicators (`before`, `after`, `inside`), and HTML spec protection.
- **Sandboxed Viewport**: High-performance canvas with infinite 2D coordinate rulers, cursor-centered zoom, smooth panning, and device resolution presets.
- **Details Inspector**: Context-sensitive property controls tailored strictly to the selected element type, with all sections expanded for rapid editing.
- **VS Code Layout Toggles**: Top-right toggle buttons to hide or expand the Primary Sidebar (Palette/Hierarchy), Bottom Panel (Script Editor), and Secondary Sidebar (Details Inspector).

### 2. DevTools-Grade Box Model & 8-Direction Resizing
- **Multi-Layer Visualization**:
  - **Margin Area**: Translucent dashed orange boundary.
  - **Border Area**: High-contrast blue outline.
  - **Padding Area**: Translucent dotted emerald boundary.
  - **Content Area**: Translucent blue content bounding box.
- **8-Directional Interactive Handles**: Resize any container or primitive from all 4 sides (`N`, `S`, `E`, `W`) and all 4 corners (`NW`, `NE`, `SW`, `SE`).
- **Click-Deselect Protection**: Seamless mouse release handling that prevents accidental canvas deselection after resizing.
- **Computed Geometry Sampling**: Real-time measurement of bounding client rects, client/scroll dimensions, and computed CSS values.

### 3. Unified Multi-Format Live Script Editor
- **Multi-Format Tabs**: Instant switching between **YAML**, **JSON**, and **HTML/CSS**.
- **VS Code Dark+ Syntax Highlighting**: Dual-layer code editor with color tokens for tags, keys, strings, numbers, enums, brackets, and comments.
- **Synchronized Line Gutter**: Sticky line numbers that scroll synchronously with vertical code movement.
- **Single-Click Sync**: Apply live code changes directly to the interactive viewport with syntax validation.
- **Direct Import & Export**: One-click file upload (`.yaml`, `.json`, `.html`) and download (`layout.yaml`, `layout.json`, `layout.html`) without preset clutter.
- **<kbd>Tab</kbd> Indentation**: Pressing <kbd>Tab</kbd> inserts 2 spaces with proper caret preservation.

### 4. Right-Click Context Menu & Canvas Control
- **Add Child Widget**: Context-sensitive container and primitive creation.
- **Replace With...**: Dynamically convert any widget or root canvas to another type without losing child nodes.
- **Wrap in Container**: Wrap any element or tree branch in a Flex Row, Flex Column, Grid, or Card.
- **Reset Canvas**: Clear canvas to an empty container with a single click.
- **Copy YAML**: Copy the element's subtree as clean YAML to clipboard.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo layout changes |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo layout changes |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | Duplicate selected element |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete selected widget (or clear canvas if root) |
| <kbd>Escape</kbd> | Deselect active widget |
| <kbd>Tab</kbd> | Insert 2-space indentation in Script Editor |
| <kbd>Middle Click Drag</kbd> / <kbd>Right Click Drag</kbd> | Pan canvas viewport |
| <kbd>Mouse Wheel</kbd> | Zoom in/out centered at mouse cursor |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/rachana.git
cd rachana

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🏗️ Architecture & Project Structure

```
rachana/
├── src/
│   ├── types/                  # Layout node models, spacing, and computed metrics
│   │   └── layout.ts
│   ├── core/                   # Serializers, presets, and default styles
│   │   ├── defaultStyles.ts    # Node presets & default styling models
│   │   ├── layoutPresets.ts    # Golden layout test cases
│   │   └── layoutSerializer.ts # Multi-format parsers (YAML, JSON, HTML) & exporters
│   ├── store/                  # Centralized Zustand-style reactive editor store
│   │   └── editorStore.ts
│   ├── components/
│   │   ├── toolbar/            # Top Studio Header with device presets, zoom & panel toggles
│   │   │   └── Toolbar.tsx
│   │   ├── palette/            # Drag & drop widget catalog
│   │   │   └── Palette.tsx
│   │   ├── hierarchy/          # Tree hierarchy with reordering & drop indicators
│   │   │   └── Hierarchy.tsx
│   │   ├── viewport/           # Infinite canvas, 8-directional handles & rulers
│   │   │   ├── Viewport.tsx
│   │   │   ├── BoxModelOverlay.tsx
│   │   │   └── InfiniteRuler.tsx
│   │   ├── details/            # Context-sensitive property inspector & box model
│   │   │   ├── DetailsPanel.tsx
│   │   │   ├── BoxModelInput.tsx
│   │   │   ├── FlexControls.tsx
│   │   │   └── GridControls.tsx
│   │   ├── script/             # Unified YAML, JSON & HTML Live Editor
│   │   │   └── LiveYamlPanel.tsx
│   │   ├── common/             # Context menus, unit pickers & splitters
│   │   │   ├── ContextMenu.tsx
│   │   │   ├── UnitInput.tsx
│   │   │   └── Splitter.tsx
│   │   └── modals/             # Standalone import & golden test export dialogs
│   │       ├── ImportModal.tsx
│   │       └── ExportTestModal.tsx
│   ├── App.tsx                 # Main resizable 3-pane layout shell
│   ├── index.css               # Global dark styling & sleek custom scrollbars
│   └── main.tsx                # Application entrypoint
├── package.json
└── vite.config.ts
```

---

## 📜 License

MIT License. Designed and crafted with precision for layout engine developers.
