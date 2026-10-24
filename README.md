# Rachana - Visual Layout Studio and Engine Testbed

Rachana is a high-precision visual layout testbed, geometry inspector, and test case generator designed for authors of custom layout engines (such as Flexbox, CSS Grid, Yoga, Taffy, and game engine UI frameworks like Unreal Engine UMG). It bridges high-level declarative layout schemas with ground-truth browser layout computation, providing sub-pixel verification of layout algorithms.

---

## Technical Overview

Developing a custom layout engine requires reference vectors against which algorithmic output can be tested. Rachana provides an interactive visual environment to author complex UI trees, visually inspect computed box model layers, and export standardized test vectors containing the exact bounding rects, content offsets, and intrinsic dimensions computed by the layout engine.

---

## Core Systems

### 1. Ground-Truth Layout Verification
- Sub-pixel bounding box sampling: Captures exact `x`, `y`, `width`, and `height` coordinates for every node in the layout tree.
- Box model metrics extraction: Real-time calculation of computed margins, border widths, padding boxes, and content boxes.
- Intrinsic and scroll sizing: Measures `clientWidth`, `clientHeight`, `scrollWidth`, `scrollHeight`, and overflow clipping bounds.
- Golden test export: Generates structured JSON test snapshots containing both the structural input tree and the reference computed rects for automated engine testing suites.

### 2. Lossless AST and Multi-Format Serialization
- Bidirectional AST roundtrip: Ensures 100% fidelity when converting layout state across YAML, JSON, and HTML/CSS.
- Typed node mapping: Explicit serialization of containers (Block, Flex, Grid) and primitives (Text, Button, Input, Image, Divider, Spacer) with preserved dimensions, alignment flags, and typography parameters.
- Multi-format code panel: Dual-layer code editor featuring token-level syntax coloring, synchronized line gutter scrolling, undo/redo history stack, and real-time AST synchronizer.

### 3. Interactive Viewport and Geometry Gizmos
- 8-directional resize gizmo: Manipulate container and primitive boundaries from all cardinal directions (North, South, East, West) and diagonal corners.
- Canvas-relative coordinate tracking: Positional metrics (`Pos X`, `Pos Y`) reflect offsets relative to the root Screen Canvas rather than global browser window coordinates.
- Infinite 2D coordinate rulers: Zoom-aware adaptive ruler ticks calibrated to the viewport transform matrix.
- Pan and zoom engine: Cursor-anchored matrix zooming with smooth panning and configurable scroll sensitivity.

### 4. Details Property Inspector
- Structured property categorization: Logical groupings for Flow Direction, Sizing, Constraints, Flexbox parameters, Grid tracks, Appearance, Typography, and Coordinates.
- Unified spacing controls: Direct numerical inputs for Margin, Padding, Border Width, and Gap with independent side linking.
- Anchored color palette: Floating popover anchored to clicked swatches without viewport blur or occlusion, featuring interactive RGB gradient sliders, HSV controls, and alpha channel configuration.
- Direct hexadecimal inputs: Dedicated outside inputs for hex code entry without requiring popover activation.
- Property copy and paste pipeline: Shift + click shortcut support and contextual menus to duplicate or apply property values across different layout nodes.
- Docked box model drawer: Collapsible bottom inspector rendering concentric DevTools-grade box model diagrams.

### 5. Studio Workspace Layout
- Resizable docking panes: Unreal Engine Slate-inspired three-column workspace layout with Primary Sidebar, Center Canvas, and Secondary Sidebar.
- Focus code mode: Full-height code editor toggle that expands the script workspace across the center column while preserving left and right tooling panels.
- Panel visibility controls: Independent toggles for Primary Sidebar, Bottom Drawer, and Secondary Sidebar.

---

## Development and Build Workflow

### Prerequisites
- Node.js 18.0 or higher
- npm or pnpm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/rachana.git
cd rachana

# Install dependencies
npm install

# Start development server
npm run dev
```

The application runs locally at `http://localhost:5173` (or the next available port).

### Production Build

```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Architecture and Design Principles

- Strict Type Safety: Written entirely in TypeScript with strong typings for layout nodes, computed metrics, and CSS property subsets.
- Modular Component Hierarchy: Separation between state management (central store with history stack), AST serialization routines, and rendering subsystems.
- Isolated Measurement: Layout nodes render in a dedicated viewport shell monitored by ResizeObserver and requestAnimationFrame measurement passes to prevent UI interference.
