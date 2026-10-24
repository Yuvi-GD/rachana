# Rachana - Visual Layout Studio and Engine Testbed

Rachana is a high-precision visual layout testbed, geometry inspector, and test case generator designed for authors of custom layout engines (such as Flexbox, CSS Grid, Yoga, Taffy, and game engine UI frameworks like Unreal Engine UMG). It bridges high-level declarative layout schemas with ground-truth browser layout computation, providing sub-pixel verification of layout algorithms.

---

## Technical Overview

Developing a custom layout engine requires reference vectors against which algorithmic output can be tested. Rachana provides an interactive visual environment to author complex UI trees, visually inspect computed box model layers, and export standardized test vectors containing the exact bounding rects, content offsets, and intrinsic dimensions computed by the layout engine.

---

## Tether UI Library Compatibility

Rachana is built in tandem with [Tether](https://github.com/Yuvi-GD/Tether), an open-source, lightweight declarative UI layout library with native YAML-based layout tree support. Rachana serves as the primary visual editor, inspector, and ground-truth validation suite for Tether compositions:

- First-Class YAML Support: Native serialization and parsing of Tether layout specifications including `flow` (ROW, COLUMN, NONE), `fill_ratio`, `content_align` (START, CENTER, END, SPACE_BETWEEN), `anchor_min`, and `anchor_max`.
- Bidirectional AST Sync: Real-time roundtrip between Tether YAML files and interactive canvas nodes without layout degradation.
- Engine Test Vectors: Generates automated golden test snapshots combining Tether markup with browser-computed bounding rects for layout regression testing.

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

### 6. Live Preview Simulation (Widget Play Mode)
- Unreal Engine UMG-style live runtime simulation: Toggle between visual design editing and live interactive preview with the `F5` shortcut or the Toolbar Simulate button.
- Live widget responsiveness: Buttons trigger active click states and log interaction events; text input fields support native focus and typing with live state tracking; scroll containers handle native mouse wheel scrolling without canvas zoom interference.
- Distraction-free preview canvas: Automatically hides editing handles, 8-directional gizmos, box model calipers, rulers, and drop indicator lines during simulation.
- Interaction event stream: Real-time event logger capturing button clicks, input updates, and focus events in a collapsible floating HUD inspector.

---

## Development and Build Workflow

### Prerequisites
- Node.js 18.0 or higher
- npm or pnpm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Yuvi-GD/rachana.git
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

## Contributing

Contributions to Rachana are welcome:

1. Fork the repository at [https://github.com/Yuvi-GD/rachana.git](https://github.com/Yuvi-GD/rachana.git).
2. Create a feature branch: `git checkout -b feature/layout-enhancement`.
3. Verify changes with `npm run build` to confirm zero TypeScript compilation errors.
4. Commit changes with clear, descriptive commit messages.
5. Submit a Pull Request describing the improvement, motivation, and verification steps.

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
