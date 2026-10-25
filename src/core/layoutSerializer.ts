import React from 'react';
import { ComputedMetrics, LayoutNode, LayoutNodeStyle } from '../types/layout';
import { createCleanNodeStyle, createDefaultStyle, defaultSpacing } from './defaultStyles';

// Helper to convert Tether UI [r, g, b, a] array or rgba(...) string to clean CSS HEX string (#rrggbb or #rrggbbaa)
export const rgbaArrayToHex = (arr: any): string => {
  if (!arr || arr === 'transparent') return 'transparent';
  if (Array.isArray(arr) && arr.length >= 3) {
    const [r, g, b, a = 255] = arr;
    const alpha = typeof a === 'number' ? (a > 1 ? a / 255 : a) : 1;
    if (alpha <= 0.005) {
      return 'transparent';
    }
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    if (alpha >= 0.99) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    const aHex = toHex(Math.round(alpha * 255));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${aHex}`;
  }
  if (typeof arr === 'string') {
    const s = arr.trim();
    if (s === 'transparent' || s === 'none' || s === 'inherit' || s === 'initial') return s;
    if (s === '#00000000' || s === '#0000') return 'transparent';
    if (s.startsWith('#')) {
      if (s.length === 9 && s.toLowerCase().endsWith('ff')) {
        return s.substring(0, 7);
      }
      if (s.length === 9 && s.toLowerCase().endsWith('00')) {
        return 'transparent';
      }
      return s;
    }
    const m = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (m) {
      const r = parseInt(m[1], 10);
      const g = parseInt(m[2], 10);
      const b = parseInt(m[3], 10);
      const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
      if (a <= 0.005) return 'transparent';
      const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
      if (a >= 0.99) {
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
    }
    return s;
  }
  return 'transparent';
};

// Helper to convert CSS color string to Tether UI [r, g, b, a] array
export const cssColorToRgbaArray = (colorStr: string): [number, number, number, number] => {
  if (!colorStr || colorStr === 'transparent') return [0, 0, 0, 0];

  // If already rgba(r, g, b, a)
  const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255;
    return [r, g, b, a];
  }

  // If hex #rrggbb, #rgb, or #rrggbbaa
  if (colorStr.startsWith('#')) {
    let hex = colorStr.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return [r, g, b, 255];
    }
    if (hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      const a = parseInt(hex.substring(6, 8), 16) || 255;
      return [r, g, b, a];
    }
  }

  return [40, 44, 52, 255]; // Default dark slate
};

// Map style to CSS including Tether UI flow & fill_ratio
export const nodeStyleToCss = (style: LayoutNodeStyle): React.CSSProperties => {
  // Translate flow to display/flexDirection if flow is specified
  let display = style.display;
  let flexDirection = style.flexDirection;

  if (style.flow === 'ROW') {
    display = 'flex';
    flexDirection = 'row';
  } else if (style.flow === 'COLUMN') {
    display = 'flex';
    flexDirection = 'column';
  } else if (style.flow === 'NONE') {
    display = 'block';
  }

  // Translate contentAlign
  let justifyContent = style.justifyContent;
  let alignItems = style.alignItems;
  if (style.contentAlign === 'CENTER') {
    justifyContent = 'center';
    alignItems = 'center';
  } else if (style.contentAlign === 'START') {
    justifyContent = 'flex-start';
  } else if (style.contentAlign === 'END') {
    justifyContent = 'flex-end';
  }

  // Translate fill_ratio to flex-grow
  const flexGrow = style.fillRatio ? parseFloat(style.fillRatio) : (parseFloat(style.flexGrow) || 0);

  const css: React.CSSProperties = {
    display,
    position: style.position,
    boxSizing: style.boxSizing,
    overflow: style.overflow,
    overflowX: style.overflowX,
    overflowY: style.overflowY,

    width: style.width,
    height: style.height,
    minWidth: style.minWidth,
    minHeight: style.minHeight,
    maxWidth: style.maxWidth,
    maxHeight: style.maxHeight,
    aspectRatio: style.aspectRatio,

    marginTop: style.margin.top,
    marginRight: style.margin.right,
    marginBottom: style.margin.bottom,
    marginLeft: style.margin.left,

    paddingTop: style.padding.top,
    paddingRight: style.padding.right,
    paddingBottom: style.padding.bottom,
    paddingLeft: style.padding.left,

    flexDirection,
    flexWrap: style.flexWrap,
    justifyContent,
    alignItems,
    alignContent: style.alignContent,
    gap: style.gap,
    rowGap: style.rowGap,
    columnGap: style.columnGap,

    flexGrow,
    flexShrink: parseFloat(style.flexShrink) ?? 1,
    flexBasis: style.flexBasis,
    alignSelf: style.alignSelf,
    order: parseInt(style.order, 10) || 0,

    gridTemplateColumns: style.gridTemplateColumns,
    gridTemplateRows: style.gridTemplateRows,
    gridAutoFlow: style.gridAutoFlow,
    gridAutoRows: style.gridAutoRows,
    gridAutoColumns: style.gridAutoColumns,

    gridColumn: style.gridColumn,
    gridRow: style.gridRow,
    gridArea: style.gridArea,

    top: style.top,
    right: style.right,
    bottom: style.bottom,
    left: style.left,
    zIndex: style.zIndex === 'auto' ? 'auto' : parseInt(style.zIndex, 10) || 'auto',

    backgroundColor: style.backgroundColor,
    borderTopWidth: style.borderWidth.top,
    borderRightWidth: style.borderWidth.right,
    borderBottomWidth: style.borderWidth.bottom,
    borderLeftWidth: style.borderWidth.left,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    opacity: parseFloat(style.opacity) || 1,
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    textTransform: style.textTransform,
    whiteSpace: style.whiteSpace,
    cursor: style.interactable ? 'pointer' : style.cursor,
  };

  return css;
};

export const exportToHtmlCss = (rootNode: LayoutNode): { html: string; css: string } => {
  const rootBg = rootNode.style.backgroundColor && rootNode.style.backgroundColor !== 'transparent'
    ? rootNode.style.backgroundColor
    : '#121214';

  let cssRules: string[] = [
    `/* Rachana Layout Engine CSS Reset */`,
    `*, *::before, *::after { box-sizing: border-box; }`,
    `html, body { width: 100%; min-height: 100vh; margin: 0; padding: 0; background-color: ${rootBg}; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }`,
    `button, input, textarea, select { font-family: inherit; font-size: inherit; color: inherit; background: transparent; border: none; }`,
    `button { cursor: pointer; text-align: center; }`,
    `h1, h2, h3, h4, h5, h6, p { margin: 0; }`,
    `img { max-width: 100%; display: block; object-fit: cover; }`,
  ];

  const serializeNode = (node: LayoutNode, indent: number = 2): string => {
    const spaces = ' '.repeat(indent);
    const className = `node-${node.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    const styleLines: string[] = [];
    const s = node.style;
    styleLines.push(`  display: ${s.display};`);
    if (s.position !== 'static') styleLines.push(`  position: ${s.position};`);
    if (s.boxSizing !== 'border-box') styleLines.push(`  box-sizing: ${s.boxSizing};`);
    if (s.overflow !== 'visible') styleLines.push(`  overflow: ${s.overflow};`);
    if (s.overflowX && s.overflowX !== s.overflow) styleLines.push(`  overflow-x: ${s.overflowX};`);
    if (s.overflowY && s.overflowY !== s.overflow) styleLines.push(`  overflow-y: ${s.overflowY};`);

    if (s.width !== 'auto') styleLines.push(`  width: ${s.width};`);
    if (s.height !== 'auto') styleLines.push(`  height: ${s.height};`);
    if (s.minWidth !== 'auto') styleLines.push(`  min-width: ${s.minWidth};`);
    if (s.minHeight !== 'auto') styleLines.push(`  min-height: ${s.minHeight};`);
    if (s.maxWidth !== 'none') styleLines.push(`  max-width: ${s.maxWidth};`);
    if (s.maxHeight !== 'none') styleLines.push(`  max-height: ${s.maxHeight};`);

    const m = s.margin;
    if (m.top !== '0px' || m.right !== '0px' || m.bottom !== '0px' || m.left !== '0px') {
      styleLines.push(`  margin: ${m.top} ${m.right} ${m.bottom} ${m.left};`);
    }

    const p = s.padding;
    if (p.top !== '0px' || p.right !== '0px' || p.bottom !== '0px' || p.left !== '0px') {
      styleLines.push(`  padding: ${p.top} ${p.right} ${p.bottom} ${p.left};`);
    }

    if (s.gap && s.gap !== '0px') {
      styleLines.push(`  gap: ${s.gap};`);
    }

    if (s.display.includes('flex') || s.flow === 'ROW' || s.flow === 'COLUMN') {
      styleLines.push(`  flex-direction: ${s.flow === 'ROW' ? 'row' : s.flow === 'COLUMN' ? 'column' : s.flexDirection};`);
      if (s.flexWrap !== 'nowrap') styleLines.push(`  flex-wrap: ${s.flexWrap};`);
      if (s.justifyContent !== 'flex-start') styleLines.push(`  justify-content: ${s.justifyContent};`);
      if (s.alignItems !== 'stretch') styleLines.push(`  align-items: ${s.alignItems};`);
    }

    if (s.display.includes('grid')) {
      styleLines.push(`  grid-template-columns: ${s.gridTemplateColumns};`);
      if (s.gridTemplateRows !== 'auto') styleLines.push(`  grid-template-rows: ${s.gridTemplateRows};`);
    }

    if (s.fillRatio) {
      styleLines.push(`  flex-grow: ${s.fillRatio};`);
    } else if (s.flexGrow !== '0') {
      styleLines.push(`  flex-grow: ${s.flexGrow};`);
    }

    if (s.backgroundColor && s.backgroundColor !== 'transparent') styleLines.push(`  background-color: ${s.backgroundColor};`);
    const bw = s.borderWidth;
    if (bw.top !== '0px' || bw.right !== '0px' || bw.bottom !== '0px' || bw.left !== '0px') {
      styleLines.push(`  border-width: ${bw.top} ${bw.right} ${bw.bottom} ${bw.left};`);
      styleLines.push(`  border-style: ${s.borderStyle};`);
      styleLines.push(`  border-color: ${s.borderColor};`);
    }
    if (s.borderRadius && s.borderRadius !== '0px') styleLines.push(`  border-radius: ${s.borderRadius};`);
    if (s.color) styleLines.push(`  color: ${s.color};`);
    if (s.fontSize) styleLines.push(`  font-size: ${s.fontSize};`);
    if (s.fontWeight && s.fontWeight !== '400') styleLines.push(`  font-weight: ${s.fontWeight};`);
    if (s.textAlign && s.textAlign !== 'left') styleLines.push(`  text-align: ${s.textAlign};`);

    cssRules.push(`.${className} {\n${styleLines.join('\n')}\n}`);

    if (node.type === 'button') {
      const content = node.textContent || node.name || 'Button';
      if (node.children.length === 0) {
        return `${spaces}<button class="${className}" id="${node.id}">${content}</button>`;
      }
      const childrenStr = node.children.map(child => serializeNode(child, indent + 2)).join('\n');
      return `${spaces}<button class="${className}" id="${node.id}">\n${childrenStr}\n${spaces}</button>`;
    }

    if (node.type === 'input') {
      const ph = node.placeholder ? ` placeholder="${escapeXmlAttr(node.placeholder)}"` : '';
      const val = node.textContent ? ` value="${escapeXmlAttr(node.textContent)}"` : '';
      return `${spaces}<input type="text" class="${className}" id="${node.id}"${ph}${val} />`;
    }

    if (node.type === 'image') {
      const src = node.src ? ` src="${node.src}"` : ' src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"';
      const alt = node.alt ? ` alt="${escapeXmlAttr(node.alt)}"` : '';
      return `${spaces}<img class="${className}" id="${node.id}"${src}${alt} />`;
    }

    if (node.type === 'divider') {
      return `${spaces}<hr class="${className}" id="${node.id}" />`;
    }

    if (node.type === 'spacer') {
      return `${spaces}<div class="${className}" id="${node.id}" data-type="spacer"></div>`;
    }

    let tag = 'div';
    if (node.type === 'heading') tag = 'h2';
    else if (node.type === 'text') tag = 'p';
    else if (node.type === 'badge') tag = 'span';

    if (node.children.length === 0) {
      const content = node.textContent || '';
      return `${spaces}<${tag} class="${className}" id="${node.id}">${content}</${tag}>`;
    }

    const childrenStr = node.children.map(child => serializeNode(child, indent + 2)).join('\n');
    return `${spaces}<${tag} class="${className}" id="${node.id}">\n${childrenStr}\n${spaces}</${tag}>`;
  };

  const html = serializeNode(rootNode, 0);
  return { html, css: cssRules.join('\n\n') };
};

export interface HierarchicalLayoutNodeSnapshot {
  id: string;
  parentId: string | null;
  name: string;
  type: string;
  textContent?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  declaredStyle: {
    display: string;
    position?: string;
    boxSizing?: string;
    overflow?: string;
    overflowX?: string;
    overflowY?: string;
    flow?: string;
    fillRatio?: string;
    flexDirection?: string;
    flexWrap?: string;
    justifyContent?: string;
    alignItems?: string;
    alignContent?: string;
    flexGrow?: string;
    flexShrink?: string;
    flexBasis?: string;
    alignSelf?: string;
    order?: string;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gridAutoFlow?: string;
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    width: string;
    height: string;
    minWidth?: string;
    minHeight?: string;
    maxWidth?: string;
    maxHeight?: string;
    aspectRatio?: string;
    margin: string;
    padding: string;
    color: string;
    backgroundColor: string;
    borderWidth?: string;
    borderColor?: string;
    borderStyle?: string;
    borderRadius?: string;
    boxShadow?: string;
    opacity?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
    zIndex?: string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  computedLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
    contentWidth: number;
    contentHeight: number;
    margin: { top: number; right: number; bottom: number; left: number };
    padding: { top: number; right: number; bottom: number; left: number };
    border: { top: number; right: number; bottom: number; left: number };
    scroll: { width: number; height: number };
  };
  children: HierarchicalLayoutNodeSnapshot[];
}

export const buildHierarchicalSnapshot = (
  node: LayoutNode,
  metricsMap: Record<string, ComputedMetrics>,
  parentId: string | null = null,
  rootMetrics?: ComputedMetrics
): HierarchicalLayoutNodeSnapshot => {
  const m = metricsMap[node.id];
  const s = node.style;

  let computedLayout: HierarchicalLayoutNodeSnapshot['computedLayout'];
  if (m) {
    const parentM = parentId ? metricsMap[parentId] : null;
    const relX = parentM ? Math.round((m.boundingRect.left - parentM.boundingRect.left) * 10) / 10 : 0;
    const relY = parentM ? Math.round((m.boundingRect.top - parentM.boundingRect.top) * 10) / 10 : 0;

    computedLayout = {
      x: relX,
      y: relY,
      width: Math.round(m.boundingRect.width * 10) / 10,
      height: Math.round(m.boundingRect.height * 10) / 10,
      contentWidth: Math.round(m.contentBox.width * 10) / 10,
      contentHeight: Math.round(m.contentBox.height * 10) / 10,
      margin: m.margin,
      padding: m.padding,
      border: m.border,
      scroll: {
        width: m.scroll.scrollWidth,
        height: m.scroll.scrollHeight,
      },
    };
  }

  const declaredStyle: HierarchicalLayoutNodeSnapshot['declaredStyle'] = {
    display: s.display,
    position: s.position,
    boxSizing: s.boxSizing,
    overflow: s.overflow,
    overflowX: s.overflowX,
    overflowY: s.overflowY,
    flow: s.flow,
    fillRatio: s.fillRatio,
    flexDirection: s.flexDirection,
    flexWrap: s.flexWrap,
    justifyContent: s.justifyContent,
    alignItems: s.alignItems,
    alignContent: s.alignContent,
    flexGrow: s.flexGrow,
    flexShrink: s.flexShrink,
    flexBasis: s.flexBasis,
    alignSelf: s.alignSelf,
    order: s.order,
    gridTemplateColumns: s.gridTemplateColumns,
    gridTemplateRows: s.gridTemplateRows,
    gridAutoFlow: s.gridAutoFlow,
    gap: s.gap,
    rowGap: s.rowGap,
    columnGap: s.columnGap,
    width: s.width,
    height: s.height,
    minWidth: s.minWidth,
    minHeight: s.minHeight,
    maxWidth: s.maxWidth,
    maxHeight: s.maxHeight,
    aspectRatio: s.aspectRatio,
    margin: `${s.margin.top} ${s.margin.right} ${s.margin.bottom} ${s.margin.left}`,
    padding: `${s.padding.top} ${s.padding.right} ${s.padding.bottom} ${s.padding.left}`,
    color: s.color,
    backgroundColor: s.backgroundColor,
    borderWidth: `${s.borderWidth.top} ${s.borderWidth.right} ${s.borderWidth.bottom} ${s.borderWidth.left}`,
    borderColor: s.borderColor,
    borderStyle: s.borderStyle,
    borderRadius: s.borderRadius,
    boxShadow: s.boxShadow,
    opacity: s.opacity,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    textAlign: s.textAlign,
    zIndex: s.zIndex,
    top: s.top,
    right: s.right,
    bottom: s.bottom,
    left: s.left,
  };

  return {
    id: node.id,
    parentId,
    name: node.name,
    type: node.type,
    textContent: node.textContent,
    placeholder: node.placeholder,
    src: node.src,
    alt: node.alt,
    declaredStyle,
    computedLayout,
    children: node.children.map(child => buildHierarchicalSnapshot(child, metricsMap, node.id, rootMetrics || m)),
  };
};

export const exportLayoutEngineGoldenTest = (
  rootNode: LayoutNode,
  metricsMap: Record<string, ComputedMetrics>,
  testCaseName: string = 'LayoutTestCase',
  screenWidth: number = 800,
  screenHeight: number = 520
) => {
  const hierarchicalTree = buildHierarchicalSnapshot(rootNode, metricsMap);

  return {
    schemaVersion: '2.0',
    generator: 'UMG-Layout-Testbed',
    timestamp: new Date().toISOString(),
    testCaseName,
    screen: {
      width: screenWidth,
      height: screenHeight,
    },
    hierarchyTree: hierarchicalTree,
  };
};

// ========================================================
// ========================================================
// Tether UI Native YAML Generator (Lossless Round-Trip)
// ========================================================
export const exportLayoutEngineYaml = (
  rootNode: LayoutNode,
  _metricsMap?: Record<string, ComputedMetrics>,
  _testCaseName: string = 'TetherUIScene',
  _screenWidth: number = 800,
  _screenHeight: number = 520
): string => {
  const lines: string[] = [];

  const parseNum = (v: string): number => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const serializeTetherNode = (node: LayoutNode, indent: number, isArrayItem: boolean = false) => {
    const sp = ' '.repeat(indent);
    const prefix = isArrayItem ? `${sp}- ` : sp;
    const bodyIndent = isArrayItem ? indent + 4 : indent + 2;
    const bsp = ' '.repeat(bodyIndent);

    const s = node.style;
    const rgba = cssColorToRgbaArray(s.backgroundColor);
    const borderRgba = cssColorToRgbaArray(s.borderColor);
    const textRgba = cssColorToRgbaArray(s.color);

    // Optional concise comment for top-level root
    if (node.name && indent === 0 && node.name !== node.id) {
      lines.push(`# ${node.name}`);
    }

    // Determine Tag based on node type
    let tag = 'Panel';
    if (node.type === 'text') tag = 'Text';
    else if (node.type === 'heading') tag = 'Heading';
    else if (node.type === 'button') tag = 'Button';
    else if (node.type === 'input') tag = 'Input';
    else if (node.type === 'badge') tag = 'Badge';
    else if (node.type === 'card') tag = 'Card';
    else if (node.type === 'scroll') tag = 'Scroll';
    else if (node.type === 'image') tag = 'Image';
    else if (node.type === 'divider') tag = 'Divider';
    else if (node.type === 'spacer') tag = 'Spacer';
    else if (node.type === 'grid') tag = 'Grid';
    else if (node.type === 'flex') tag = 'Flex';

    lines.push(`${prefix}${tag}:`);
    if (node.id) lines.push(`${bsp}id: "${node.id}"`);
    if (node.name && node.name !== node.id) lines.push(`${bsp}name: "${node.name}"`);
    lines.push(`${bsp}type: ${node.type}`);

    // Text & String content
    if (node.textContent !== undefined && node.textContent !== '') {
      lines.push(`${bsp}string: "${node.textContent.replace(/"/g, '\\"')}"`);
    }
    if (node.placeholder) {
      lines.push(`${bsp}placeholder: "${node.placeholder.replace(/"/g, '\\"')}"`);
    }
    if (node.src) {
      lines.push(`${bsp}src: "${node.src}"`);
    }
    if (node.alt) {
      lines.push(`${bsp}alt: "${node.alt.replace(/"/g, '\\"')}"`);
    }

    // Colors
    if (s.backgroundColor && s.backgroundColor !== 'transparent') {
      lines.push(`${bsp}color: [${rgba.join(', ')}]`);
      lines.push(`${bsp}background_color: "${s.backgroundColor}"`);
    }
    if (s.color && s.color !== 'transparent') {
      lines.push(`${bsp}text_color: [${textRgba.join(', ')}]`);
      lines.push(`${bsp}font_color: "${s.color}"`);
    }

    // Layout Flow & Display
    const flow = s.flow || (s.flexDirection === 'row' ? 'ROW' : (s.flexDirection === 'column' ? 'COLUMN' : 'NONE'));
    lines.push(`${bsp}flow: ${flow}`);
    lines.push(`${bsp}display: ${s.display}`);
    if (s.display.includes('flex') || flow === 'ROW' || flow === 'COLUMN') {
      lines.push(`${bsp}flex_direction: ${s.flexDirection || (flow === 'ROW' ? 'row' : 'column')}`);
      if (s.justifyContent && s.justifyContent !== 'flex-start') {
        lines.push(`${bsp}justify_content: ${s.justifyContent}`);
      }
      if (s.alignItems && s.alignItems !== 'stretch') {
        lines.push(`${bsp}align_items: ${s.alignItems}`);
      }
      if (s.flexWrap && s.flexWrap !== 'nowrap') {
        lines.push(`${bsp}flex_wrap: ${s.flexWrap}`);
      }
    }

    if (s.display.includes('grid') || node.type === 'grid') {
      if (s.gridTemplateColumns) lines.push(`${bsp}grid_template_columns: "${s.gridTemplateColumns}"`);
      if (s.gridTemplateRows && s.gridTemplateRows !== 'auto') lines.push(`${bsp}grid_template_rows: "${s.gridTemplateRows}"`);
    }

    // Fill ratio / flex grow
    const fr = s.fillRatio || s.flexGrow;
    if (fr && fr !== '0') {
      lines.push(`${bsp}fill_ratio: ${parseFloat(fr)}`);
    }

    // Width & Height (CRITICAL for lossless roundtrip!)
    if (s.width && s.width !== 'auto') lines.push(`${bsp}width: "${s.width}"`);
    if (s.height && s.height !== 'auto') lines.push(`${bsp}height: "${s.height}"`);
    if (s.minWidth && s.minWidth !== 'auto') lines.push(`${bsp}min_width: "${s.minWidth}"`);
    if (s.minHeight && s.minHeight !== 'auto') lines.push(`${bsp}min_height: "${s.minHeight}"`);
    if (s.maxWidth && s.maxWidth !== 'none') lines.push(`${bsp}max_width: "${s.maxWidth}"`);
    if (s.maxHeight && s.maxHeight !== 'none') lines.push(`${bsp}max_height: "${s.maxHeight}"`);

    // Gap [x, y]
    const gapX = parseNum(s.columnGap || s.gap);
    const gapY = parseNum(s.rowGap || s.gap);
    if (gapX > 0 || gapY > 0) {
      if (gapX === gapY) {
        lines.push(`${bsp}gap: ${gapX}`);
      } else {
        lines.push(`${bsp}gap: [${gapX}, ${gapY}]`);
      }
    } else {
      lines.push(`${bsp}gap: 0`);
    }

    // Padding
    const pTop = parseNum(s.padding.top);
    const pRight = parseNum(s.padding.right);
    const pBottom = parseNum(s.padding.bottom);
    const pLeft = parseNum(s.padding.left);
    if (pTop === pRight && pRight === pBottom && pBottom === pLeft) {
      lines.push(`${bsp}padding: ${pTop}`);
    } else {
      lines.push(`${bsp}padding: [${pTop}, ${pRight}, ${pBottom}, ${pLeft}]`);
    }

    // Margin
    const mTop = parseNum(s.margin.top);
    const mRight = parseNum(s.margin.right);
    const mBottom = parseNum(s.margin.bottom);
    const mLeft = parseNum(s.margin.left);
    if (mTop > 0 || mRight > 0 || mBottom > 0 || mLeft > 0) {
      if (mTop === mRight && mRight === mBottom && mBottom === mLeft) {
        lines.push(`${bsp}margin: ${mTop}`);
      } else {
        lines.push(`${bsp}margin: [${mTop}, ${mRight}, ${mBottom}, ${mLeft}]`);
      }
    }

    // Border
    const bTop = parseNum(s.borderWidth.top);
    const bRight = parseNum(s.borderWidth.right);
    const bBottom = parseNum(s.borderWidth.bottom);
    const bLeft = parseNum(s.borderWidth.left);
    if (bTop > 0 || bRight > 0 || bBottom > 0 || bLeft > 0) {
      if (bTop === bRight && bRight === bBottom && bBottom === bLeft) {
        lines.push(`${bsp}border_width: ${bTop}`);
      } else {
        lines.push(`${bsp}border_width: [${bTop}, ${bRight}, ${bBottom}, ${bLeft}]`);
      }
      lines.push(`${bsp}border_color: [${borderRgba.join(', ')}]`);
      if (s.borderColor && s.borderColor !== 'transparent') {
        lines.push(`${bsp}border_color_hex: "${s.borderColor}"`);
      }
      if (s.borderStyle && s.borderStyle !== 'solid') {
        lines.push(`${bsp}border_style: ${s.borderStyle}`);
      }
    } else {
      lines.push(`${bsp}border_width: 0`);
    }
    const bRadius = parseNum(s.borderRadius);
    if (bRadius > 0) {
      lines.push(`${bsp}border_radius: ${bRadius}`);
    } else {
      lines.push(`${bsp}border_radius: 0`);
    }

    // Typography
    if (s.fontSize) {
      lines.push(`${bsp}font_size: "${s.fontSize}"`);
    }
    if (s.fontWeight) {
      lines.push(`${bsp}font_weight: "${s.fontWeight}"`);
    }
    if (s.textAlign && s.textAlign !== 'left') {
      lines.push(`${bsp}text_align: ${s.textAlign}`);
    }

    // Opacity
    if (s.opacity && s.opacity !== '1' && s.opacity !== '1.0') {
      lines.push(`${bsp}opacity: ${parseFloat(s.opacity)}`);
    }

    // Content alignment & Anchors
    if (s.contentAlign && s.contentAlign !== 'START') lines.push(`${bsp}content_align: ${s.contentAlign}`);
    if (s.anchorMin && s.anchorMin !== '0.0') lines.push(`${bsp}anchor_min: ${s.anchorMin}`);
    if (s.anchorMax && s.anchorMax !== '1.0') lines.push(`${bsp}anchor_max: ${s.anchorMax}`);

    // Position & Overflow
    if (s.position && s.position !== 'relative') lines.push(`${bsp}position: ${s.position}`);
    if (s.boxSizing && s.boxSizing !== 'border-box') lines.push(`${bsp}box_sizing: ${s.boxSizing}`);
    if (s.overflow && s.overflow !== 'visible') lines.push(`${bsp}overflow: ${s.overflow}`);
    if (s.overflowX && s.overflowX !== s.overflow) lines.push(`${bsp}overflow_x: ${s.overflowX}`);
    if (s.overflowY && s.overflowY !== s.overflow) lines.push(`${bsp}overflow_y: ${s.overflowY}`);
    if (s.zIndex && s.zIndex !== 'auto') lines.push(`${bsp}z_index: ${s.zIndex}`);

    // Children recursively
    if (node.children && node.children.length > 0) {
      lines.push(`${bsp}children:`);
      node.children.forEach(child => serializeTetherNode(child, bodyIndent + 2, true));
    }
  };

  serializeTetherNode(rootNode, 0, false);
  return lines.join('\n');
};

// ========================================================
// Tether UI Native YAML Importer / Parser (Lossless Round-Trip)
// ========================================================
export const parseTetherYaml = (yamlText: string): LayoutNode => {
  const lines = yamlText.split('\n');

  // Helper to parse scalar values
  const parseScalar = (str: string): any => {
    str = str.trim();
    if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
    if (str.startsWith("'") && str.endsWith("'")) return str.slice(1, -1);
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str.startsWith('[') && str.endsWith(']')) {
      const inner = str.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(s => {
        const item = s.trim();
        const num = parseFloat(item);
        return isNaN(num) ? item : num;
      });
    }
    const num = parseFloat(str);
    return isNaN(num) ? str : num;
  };

  // Convert padding / margin value (scalar or array) to SpacingSides
  const parseSpacingVal = (val: any) => {
    if (typeof val === 'number') {
      return defaultSpacing(`${val}px`);
    }
    if (typeof val === 'string') {
      return defaultSpacing(val);
    }
    if (Array.isArray(val)) {
      if (val.length === 4) {
        return {
          top: `${val[0]}px`,
          right: `${val[1]}px`,
          bottom: `${val[2]}px`,
          left: `${val[3]}px`,
        };
      }
      if (val.length === 2) {
        return {
          top: `${val[1]}px`,
          right: `${val[0]}px`,
          bottom: `${val[1]}px`,
          left: `${val[0]}px`,
        };
      }
    }
    return defaultSpacing('0px');
  };

  interface RawNodeItem {
    indent: number;
    tag: string;
    props: Record<string, any>;
    children: RawNodeItem[];
    parent?: RawNodeItem;
  }

  const rootNodes: RawNodeItem[] = [];
  const stack: RawNodeItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Strip comments
    const commentIdx = rawLine.indexOf('#');
    const lineWithoutComment = commentIdx >= 0 ? rawLine.substring(0, commentIdx) : rawLine;
    if (!lineWithoutComment.trim()) continue;

    const indentMatch = lineWithoutComment.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const trimmed = lineWithoutComment.trim();

    // Check if new node definition: e.g. "- Panel:", "Panel:", "- Text:", "- Button:", "- Card:"
    const nodeMatch = trimmed.match(/^(?:-\s*)?([A-Za-z0-9_-]+):$/);
    const isTag = Boolean(nodeMatch && nodeMatch[1] && nodeMatch[1][0] === nodeMatch[1][0].toUpperCase());

    if (isTag && nodeMatch) {
      const tag = nodeMatch[1];
      const newNode: RawNodeItem = {
        indent,
        tag,
        props: {},
        children: [],
      };

      // Find parent based on indentation
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(newNode);
        newNode.parent = stack[stack.length - 1];
      } else {
        rootNodes.push(newNode);
      }

      stack.push(newNode);
      continue;
    }

    // Children block indicator
    if (trimmed === 'children:' || trimmed === 'content:' || trimmed === 'tree:') {
      continue;
    }

    // Property line: key: value
    const propMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (propMatch && stack.length > 0) {
      const [, key, valStr] = propMatch;
      stack[stack.length - 1].props[key] = parseScalar(valStr);
    }
  }

  // Convert RawNodeItem to LayoutNode
  let idCounter = 1;
  const buildLayoutNode = (raw: RawNodeItem): LayoutNode => {
    const p = raw.props;
    const tag = raw.tag;
    const tagLower = tag.toLowerCase();

    let nodeType: LayoutNode['type'] = 'container';
    if (p.type) {
      nodeType = p.type as LayoutNode['type'];
    } else if (['text', 'heading', 'button', 'input', 'badge', 'card', 'scroll', 'image', 'divider', 'spacer', 'grid', 'flex', 'container'].includes(tagLower)) {
      nodeType = tagLower as LayoutNode['type'];
    } else if (p.flow === 'ROW' || p.flow === 'COLUMN') {
      nodeType = 'flex';
    }

    const style = createCleanNodeStyle();

    // Width & Height
    if (p.width !== undefined) style.width = typeof p.width === 'number' ? `${p.width}px` : String(p.width);
    if (p.height !== undefined) style.height = typeof p.height === 'number' ? `${p.height}px` : String(p.height);
    if (p.min_width !== undefined) style.minWidth = typeof p.min_width === 'number' ? `${p.min_width}px` : String(p.min_width);
    if (p.min_height !== undefined) style.minHeight = typeof p.min_height === 'number' ? `${p.min_height}px` : String(p.min_height);
    if (p.max_width !== undefined) style.maxWidth = typeof p.max_width === 'number' ? `${p.max_width}px` : String(p.max_width);
    if (p.max_height !== undefined) style.maxHeight = typeof p.max_height === 'number' ? `${p.max_height}px` : String(p.max_height);

    // Display & Flow
    if (p.display) {
      style.display = p.display;
    } else if (p.flow === 'ROW' || p.flow === 'COLUMN' || nodeType === 'flex') {
      style.display = 'flex';
    } else if (nodeType === 'grid') {
      style.display = 'grid';
    } else {
      style.display = 'block';
    }

    if (p.flow) {
      style.flow = p.flow;
    } else if (style.display === 'flex') {
      style.flow = p.flex_direction === 'column' ? 'COLUMN' : 'ROW';
    }

    if (p.flex_direction) {
      style.flexDirection = p.flex_direction;
    } else if (style.flow === 'ROW') {
      style.flexDirection = 'row';
    } else if (style.flow === 'COLUMN') {
      style.flexDirection = 'column';
    }

    if (p.justify_content) style.justifyContent = p.justify_content;
    if (p.align_items) style.alignItems = p.align_items;
    if (p.flex_wrap) style.flexWrap = p.flex_wrap;

    if (p.grid_template_columns) style.gridTemplateColumns = String(p.grid_template_columns);
    if (p.grid_template_rows) style.gridTemplateRows = String(p.grid_template_rows);

    // Fill ratio / flex grow
    if (p.fill_ratio !== undefined) {
      style.fillRatio = String(p.fill_ratio);
      style.flexGrow = String(p.fill_ratio);
    } else if (p.flex_grow !== undefined) {
      style.fillRatio = String(p.flex_grow);
      style.flexGrow = String(p.flex_grow);
    }

    // Gap [x, y]
    if (p.gap !== undefined) {
      if (Array.isArray(p.gap) && p.gap.length === 2) {
        style.columnGap = `${p.gap[0]}px`;
        style.rowGap = `${p.gap[1]}px`;
        style.gap = `${p.gap[1]}px ${p.gap[0]}px`;
      } else if (typeof p.gap === 'number') {
        style.gap = `${p.gap}px`;
        style.rowGap = `${p.gap}px`;
        style.columnGap = `${p.gap}px`;
      } else if (typeof p.gap === 'string') {
        style.gap = p.gap;
        style.rowGap = p.gap;
        style.columnGap = p.gap;
      }
    } else {
      style.gap = '0px';
      style.rowGap = '0px';
      style.columnGap = '0px';
    }

    // Padding & Margin
    if (p.padding !== undefined) style.padding = parseSpacingVal(p.padding);
    else style.padding = defaultSpacing('0px');

    if (p.margin !== undefined) style.margin = parseSpacingVal(p.margin);
    else style.margin = defaultSpacing('0px');

    // Colors
    if (p.background_color_hex) {
      style.backgroundColor = rgbaArrayToHex(p.background_color_hex);
    } else if (p.background_color) {
      style.backgroundColor = rgbaArrayToHex(p.background_color);
    } else if (p.color !== undefined) {
      const parsedColor = rgbaArrayToHex(p.color);
      if (nodeType === 'text' || nodeType === 'heading') {
        if (p.text_color || p.font_color) {
          style.backgroundColor = parsedColor;
        } else {
          style.color = parsedColor;
        }
      } else {
        style.backgroundColor = parsedColor;
      }
    }

    if (p.font_color) {
      style.color = rgbaArrayToHex(p.font_color);
    } else if (p.text_color) {
      style.color = rgbaArrayToHex(p.text_color);
    }

    // Border
    if (p.border_width !== undefined) style.borderWidth = parseSpacingVal(p.border_width);
    else style.borderWidth = defaultSpacing('0px');

    if (p.border_color_hex) style.borderColor = rgbaArrayToHex(p.border_color_hex);
    else if (p.border_color) style.borderColor = rgbaArrayToHex(p.border_color);
    else style.borderColor = 'transparent';

    if (p.border_style) style.borderStyle = p.border_style;
    else style.borderStyle = 'solid';

    if (p.border_radius !== undefined) {
      style.borderRadius = typeof p.border_radius === 'number' ? `${p.border_radius}px` : String(p.border_radius);
    } else {
      style.borderRadius = '0px';
    }

    // Typography
    if (p.font_size !== undefined) {
      style.fontSize = typeof p.font_size === 'number' ? `${p.font_size}px` : String(p.font_size);
    }
    if (p.font_weight !== undefined) style.fontWeight = String(p.font_weight);
    if (p.text_align) style.textAlign = p.text_align;

    // Opacity, Position, Overflow, Z-Index
    if (p.opacity !== undefined) style.opacity = String(p.opacity);
    if (p.position) style.position = p.position;
    if (p.box_sizing) style.boxSizing = p.box_sizing;
    if (p.overflow) style.overflow = p.overflow;
    if (p.overflow_x) style.overflowX = p.overflow_x;
    if (p.overflow_y) style.overflowY = p.overflow_y;
    if (p.z_index !== undefined) style.zIndex = String(p.z_index);

    // Content & text
    let textContent = p.string !== undefined ? String(p.string) : (p.text !== undefined ? String(p.text) : (p.textContent !== undefined ? String(p.textContent) : undefined));
    if ((nodeType === 'button' || nodeType === 'text') && !textContent && raw.children.length > 0) {
      const childText = raw.children.find(c => c.tag === 'Text');
      if (childText && childText.props.string) {
        textContent = childText.props.string;
      }
    }

    const placeholder = p.placeholder ? String(p.placeholder) : undefined;
    const src = p.src ? String(p.src) : undefined;
    const alt = p.alt ? String(p.alt) : undefined;

    return {
      id: p.id || `node_${idCounter++}_${nodeType}`,
      name: p.name || p.id || tag,
      type: nodeType,
      style,
      textContent,
      placeholder,
      src,
      alt,
      children: raw.children.map(c => buildLayoutNode(c)),
      isExpanded: true,
    };
  };

  if (rootNodes.length === 0) {
    return {
      id: 'root',
      name: 'Root Container',
      type: 'container',
      style: createDefaultStyle(),
      children: [],
      isExpanded: true,
    };
  }

  // If single root node
  if (rootNodes.length === 1) {
    return buildLayoutNode(rootNodes[0]);
  }

  // If multiple top-level nodes (like UI/index.yaml), wrap in AppRoot
  return {
    id: 'AppRoot',
    name: 'App Root',
    type: 'container',
    style: createDefaultStyle({
      display: 'flex',
      flow: 'COLUMN',
      flexDirection: 'column',
      width: '840px',
      height: '540px',
    }),
    children: rootNodes.map(r => buildLayoutNode(r)),
    isExpanded: true,
  };
};

// ========================================================
// JSON Hierarchy Layout Parser
// ========================================================
export const parseJsonLayout = (jsonText: string): LayoutNode => {
  const parsed = JSON.parse(jsonText);
  const rootObj = parsed.hierarchyTree || parsed;

  let idCounter = 1;

  const buildFromJson = (obj: any): LayoutNode => {
    const style = createCleanNodeStyle();

    if (obj.declaredStyle) {
      const ds = obj.declaredStyle;
      if (ds.display) style.display = ds.display;
      if (ds.position) style.position = ds.position;
      if (ds.boxSizing) style.boxSizing = ds.boxSizing;
      if (ds.overflow) style.overflow = ds.overflow;
      if (ds.overflowX) style.overflowX = ds.overflowX;
      if (ds.overflowY) style.overflowY = ds.overflowY;

      if (ds.flow) style.flow = ds.flow;
      if (ds.flexDirection) style.flexDirection = ds.flexDirection;
      if (ds.flexWrap) style.flexWrap = ds.flexWrap;
      if (ds.justifyContent) style.justifyContent = ds.justifyContent;
      if (ds.alignItems) style.alignItems = ds.alignItems;
      if (ds.alignContent) style.alignContent = ds.alignContent;

      if (ds.fillRatio !== undefined) {
        style.fillRatio = String(ds.fillRatio);
        style.flexGrow = String(ds.fillRatio);
      }
      if (ds.flexGrow !== undefined) style.flexGrow = String(ds.flexGrow);
      if (ds.flexShrink !== undefined) style.flexShrink = String(ds.flexShrink);
      if (ds.flexBasis !== undefined) style.flexBasis = String(ds.flexBasis);
      if (ds.alignSelf) style.alignSelf = ds.alignSelf;
      if (ds.order !== undefined) style.order = String(ds.order);

      if (ds.gridTemplateColumns) style.gridTemplateColumns = ds.gridTemplateColumns;
      if (ds.gridTemplateRows) style.gridTemplateRows = ds.gridTemplateRows;
      if (ds.gridAutoFlow) style.gridAutoFlow = ds.gridAutoFlow;

      if (ds.gap) {
        style.gap = ds.gap;
        style.rowGap = ds.gap;
        style.columnGap = ds.gap;
      }
      if (ds.rowGap) style.rowGap = ds.rowGap;
      if (ds.columnGap) style.columnGap = ds.columnGap;

      if (ds.width) style.width = ds.width;
      if (ds.height) style.height = ds.height;
      if (ds.minWidth) style.minWidth = ds.minWidth;
      if (ds.minHeight) style.minHeight = ds.minHeight;
      if (ds.maxWidth) style.maxWidth = ds.maxWidth;
      if (ds.maxHeight) style.maxHeight = ds.maxHeight;
      if (ds.aspectRatio) style.aspectRatio = ds.aspectRatio;

      if (ds.margin) {
        const parts = ds.margin.trim().split(/\s+/);
        if (parts.length === 4) {
          style.margin = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
        } else if (parts.length === 1) {
          style.margin = defaultSpacing(parts[0]);
        }
      }
      if (ds.padding) {
        const parts = ds.padding.trim().split(/\s+/);
        if (parts.length === 4) {
          style.padding = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
        } else if (parts.length === 1) {
          style.padding = defaultSpacing(parts[0]);
        }
      }

      if (ds.backgroundColor) style.backgroundColor = rgbaArrayToHex(ds.backgroundColor);
      if (ds.color) style.color = rgbaArrayToHex(ds.color);

      if (ds.borderWidth) {
        const parts = ds.borderWidth.trim().split(/\s+/);
        if (parts.length === 4) {
          style.borderWidth = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
        } else if (parts.length === 1) {
          style.borderWidth = defaultSpacing(parts[0]);
        }
      }
      if (ds.borderColor) style.borderColor = rgbaArrayToHex(ds.borderColor);
      if (ds.borderStyle) style.borderStyle = ds.borderStyle;
      if (ds.borderRadius) style.borderRadius = ds.borderRadius;
      if (ds.boxShadow) style.boxShadow = ds.boxShadow;
      if (ds.opacity !== undefined) style.opacity = String(ds.opacity);

      if (ds.fontSize) style.fontSize = ds.fontSize;
      if (ds.fontWeight) style.fontWeight = String(ds.fontWeight);
      if (ds.lineHeight) style.lineHeight = ds.lineHeight;
      if (ds.letterSpacing) style.letterSpacing = ds.letterSpacing;
      if (ds.textAlign) style.textAlign = ds.textAlign;

      if (ds.zIndex) style.zIndex = String(ds.zIndex);
      if (ds.top) style.top = ds.top;
      if (ds.right) style.right = ds.right;
      if (ds.bottom) style.bottom = ds.bottom;
      if (ds.left) style.left = ds.left;
    } else if (obj.style) {
      Object.assign(style, obj.style);
      if (style.backgroundColor) style.backgroundColor = rgbaArrayToHex(style.backgroundColor);
      if (style.color) style.color = rgbaArrayToHex(style.color);
      if (style.borderColor) style.borderColor = rgbaArrayToHex(style.borderColor);
    }

    let nodeType: LayoutNode['type'] = obj.type || 'container';
    if (obj.tagName === 'button' || obj.tagName === 'btn') nodeType = 'button';
    if (obj.tagName === 'p' || obj.tagName === 'span' || obj.tagName === 'h1' || obj.tagName === 'h2') nodeType = 'text';

    return {
      id: obj.id || `node_${idCounter++}_json`,
      name: obj.name || obj.id || 'Node',
      type: nodeType,
      style,
      textContent: obj.textContent !== undefined ? obj.textContent : (nodeType === 'text' || nodeType === 'button' ? obj.name : undefined),
      placeholder: obj.placeholder,
      src: obj.src,
      alt: obj.alt,
      children: Array.isArray(obj.children) ? obj.children.map(buildFromJson) : [],
      isExpanded: true,
    };
  };

  return buildFromJson(rootObj);
};

// ========================================================
// HTML + CSS Layout Parser (Bidirectional & Lossless AST)
// ========================================================
export const parseHtmlLayout = (htmlText: string): LayoutNode => {
  const parser = new DOMParser();
  const trimmed = htmlText.trim();
  const doc = parser.parseFromString(trimmed, 'text/html');

  // 1. Extract and index all CSS rules from <style> blocks
  const cssClassMap: Record<string, Record<string, string>> = {};
  const styleTags = Array.from(doc.querySelectorAll('style'));
  styleTags.forEach(st => {
    const cssText = st.textContent || '';
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = ruleRegex.exec(cssText)) !== null) {
      const selectors = match[1].split(',').map(s => s.trim());
      const declBlock = match[2];
      const declarations: Record<string, string> = {};
      declBlock.split(';').forEach(decl => {
        const colonIdx = decl.indexOf(':');
        if (colonIdx !== -1) {
          const prop = decl.slice(0, colonIdx).trim().toLowerCase();
          const val = decl.slice(colonIdx + 1).trim();
          if (prop && val) declarations[prop] = val;
        }
      });
      selectors.forEach(sel => {
        if (sel) {
          cssClassMap[sel] = { ...(cssClassMap[sel] || {}), ...declarations };
        }
      });
    }
    // Remove the style element from DOM tree so it doesn't get treated as a layout node
    st.remove();
  });

  // Remove script and link tags from DOM
  Array.from(doc.querySelectorAll('script, link, meta, title')).forEach(n => n.remove());

  // Helper to parse CSS spacing (1, 2, 3, or 4 values)
  const parseCssSpacing = (val: string) => {
    if (!val) return defaultSpacing('0px');
    const parts = val.trim().split(/\s+/);
    if (parts.length === 1) return defaultSpacing(parts[0]);
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return defaultSpacing(val);
  };

  let idCounter = 1;

  const traverseElement = (el: HTMLElement): LayoutNode => {
    const tagName = el.tagName.toLowerCase();
    const style = createCleanNodeStyle();

    let nodeType: LayoutNode['type'] = 'container';
    let placeholder: string | undefined;
    let src: string | undefined;
    let alt: string | undefined;

    if (tagName === 'button') {
      nodeType = 'button';
    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      nodeType = 'heading';
    } else if (tagName === 'span') {
      nodeType = 'badge';
    } else if (['p', 'label', 'a', 'strong', 'b', 'em'].includes(tagName)) {
      nodeType = 'text';
    } else if (tagName === 'img') {
      nodeType = 'image';
      src = el.getAttribute('src') || undefined;
      alt = el.getAttribute('alt') || undefined;
    } else if (tagName === 'input') {
      nodeType = 'input';
      placeholder = el.getAttribute('placeholder') || undefined;
    } else if (tagName === 'hr') {
      nodeType = 'divider';
    } else if (el.getAttribute('data-type') === 'spacer' || el.className.includes('spacer')) {
      nodeType = 'spacer';
    }

    // Merge matched CSS rules: Tag, Classes, ID, and then inline style
    const mergedProps: Record<string, string> = {};
    if (cssClassMap[tagName]) Object.assign(mergedProps, cssClassMap[tagName]);
    if (el.id && cssClassMap[`#${el.id}`]) Object.assign(mergedProps, cssClassMap[`#${el.id}`]);
    if (el.className) {
      el.className.split(/\s+/).forEach(cls => {
        if (cls && cssClassMap[`.${cls}`]) {
          Object.assign(mergedProps, cssClassMap[`.${cls}`]);
        }
      });
    }

    // Also overlay inline style declarations if any
    for (let i = 0; i < el.style.length; i++) {
      const prop = el.style[i];
      mergedProps[prop] = el.style.getPropertyValue(prop);
    }

    // Map declarations to style
    if (mergedProps['display']) {
      style.display = mergedProps['display'] as any;
      if (mergedProps['display'].includes('flex')) {
        nodeType = nodeType === 'button' ? 'button' : 'flex';
      } else if (mergedProps['display'].includes('grid')) {
        nodeType = 'grid';
      }
    }
    if (mergedProps['position']) style.position = mergedProps['position'] as any;
    if (mergedProps['box-sizing']) style.boxSizing = mergedProps['box-sizing'] as any;
    if (mergedProps['overflow']) style.overflow = mergedProps['overflow'] as any;

    if (mergedProps['flex-direction']) {
      style.flexDirection = mergedProps['flex-direction'] as any;
      style.flow = mergedProps['flex-direction'] === 'row' ? 'ROW' : 'COLUMN';
    }
    if (mergedProps['justify-content']) style.justifyContent = mergedProps['justify-content'] as any;
    if (mergedProps['align-items']) style.alignItems = mergedProps['align-items'] as any;
    if (mergedProps['flex-wrap']) style.flexWrap = mergedProps['flex-wrap'] as any;
    if (mergedProps['flex-grow']) {
      style.flexGrow = mergedProps['flex-grow'];
      style.fillRatio = mergedProps['flex-grow'];
    }

    if (mergedProps['grid-template-columns']) style.gridTemplateColumns = mergedProps['grid-template-columns'];
    if (mergedProps['grid-template-rows']) style.gridTemplateRows = mergedProps['grid-template-rows'];

    if (mergedProps['gap']) {
      style.gap = mergedProps['gap'];
      style.rowGap = mergedProps['gap'];
      style.columnGap = mergedProps['gap'];
    }
    if (mergedProps['row-gap']) style.rowGap = mergedProps['row-gap'];
    if (mergedProps['column-gap']) style.columnGap = mergedProps['column-gap'];

    if (mergedProps['width']) style.width = mergedProps['width'];
    if (mergedProps['height']) style.height = mergedProps['height'];
    if (mergedProps['min-width']) style.minWidth = mergedProps['min-width'];
    if (mergedProps['min-height']) style.minHeight = mergedProps['min-height'];
    if (mergedProps['max-width']) style.maxWidth = mergedProps['max-width'];
    if (mergedProps['max-height']) style.maxHeight = mergedProps['max-height'];

    if (mergedProps['padding']) style.padding = parseCssSpacing(mergedProps['padding']);
    if (mergedProps['margin']) style.margin = parseCssSpacing(mergedProps['margin']);

    // Colors: guarantee clean HEX
    if (mergedProps['background-color']) style.backgroundColor = rgbaArrayToHex(mergedProps['background-color']);
    else if (mergedProps['background']) style.backgroundColor = rgbaArrayToHex(mergedProps['background']);

    if (mergedProps['color']) style.color = rgbaArrayToHex(mergedProps['color']);

    if (mergedProps['border-width']) style.borderWidth = parseCssSpacing(mergedProps['border-width']);
    if (mergedProps['border-color']) style.borderColor = rgbaArrayToHex(mergedProps['border-color']);
    if (mergedProps['border-style']) style.borderStyle = mergedProps['border-style'] as any;
    if (mergedProps['border-radius']) style.borderRadius = mergedProps['border-radius'];

    if (mergedProps['font-size']) style.fontSize = mergedProps['font-size'];
    if (mergedProps['font-weight']) style.fontWeight = mergedProps['font-weight'];
    if (mergedProps['text-align']) style.textAlign = mergedProps['text-align'] as any;
    if (mergedProps['opacity']) style.opacity = mergedProps['opacity'];

    const nodeId = el.id || `node_${idCounter++}_${tagName}`;
    const name = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : tagName;

    let textContent: string | undefined;
    if (nodeType === 'text' || nodeType === 'button' || el.children.length === 0) {
      const txt = el.textContent?.trim();
      if (txt) textContent = txt;
    }

    const childElements = Array.from(el.children).filter(c => c instanceof HTMLElement) as HTMLElement[];
    const children = childElements.map(traverseElement);

    return {
      id: nodeId,
      name,
      type: nodeType,
      style,
      textContent,
      placeholder,
      src,
      alt,
      children,
      isExpanded: true,
    };
  };

  const bodyChildren = Array.from(doc.body.children).filter(c => c instanceof HTMLElement) as HTMLElement[];
  if (bodyChildren.length === 0) {
    return {
      id: 'root',
      name: 'Root Canvas',
      type: 'container',
      style: createDefaultStyle(),
      children: [],
      isExpanded: true,
    };
  }

  if (bodyChildren.length === 1) {
    const root = traverseElement(bodyChildren[0]);
    root.id = 'root';
    root.name = 'Screen Canvas (Root)';
    if (!root.style.width || root.style.width === 'auto') {
      root.style.width = '840px';
    }
    if (!root.style.height || root.style.height === 'auto') {
      root.style.height = '540px';
    }
    return root;
  }

  return {
    id: 'root',
    name: 'Root Canvas',
    type: 'container',
    style: createDefaultStyle({
      display: 'flex',
      flow: 'COLUMN',
      flexDirection: 'column',
      width: '840px',
      height: '540px',
    }),
    children: bodyChildren.map(traverseElement),
    isExpanded: true,
  };
};

// ========================================================
// XML Layout Serializer & Parser
// ========================================================
const escapeXmlAttr = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const exportToXml = (rootNode: LayoutNode): string => {
  const serializeNode = (node: LayoutNode, indent: number = 0): string => {
    const spaces = ' '.repeat(indent);
    const s = node.style;
    const attrs: string[] = [];

    attrs.push(`id="${node.id}"`);
    if (node.name && node.name !== node.id) {
      attrs.push(`name="${escapeXmlAttr(node.name)}"`);
    }

    let tag = node.type || 'container';
    if (tag === 'container' && s.display === 'flex') {
      tag = 'flex';
    } else if (tag === 'container' && s.display === 'grid') {
      tag = 'grid';
    }

    if (s.flow && s.flow !== 'NONE') attrs.push(`flow="${s.flow}"`);
    if (s.flexDirection && s.flexDirection !== 'row') attrs.push(`flexDirection="${s.flexDirection}"`);
    if (s.justifyContent && s.justifyContent !== 'flex-start') attrs.push(`justifyContent="${s.justifyContent}"`);
    if (s.alignItems && s.alignItems !== 'stretch') attrs.push(`alignItems="${s.alignItems}"`);
    if (s.fillRatio) attrs.push(`fillRatio="${s.fillRatio}"`);
    else if (s.flexGrow && s.flexGrow !== '0') attrs.push(`flexGrow="${s.flexGrow}"`);

    if (s.gap && s.gap !== '0px') attrs.push(`gap="${s.gap}"`);
    if (s.width && s.width !== 'auto') attrs.push(`width="${s.width}"`);
    if (s.height && s.height !== 'auto') attrs.push(`height="${s.height}"`);
    if (s.minWidth && s.minWidth !== '0px') attrs.push(`minWidth="${s.minWidth}"`);
    if (s.minHeight && s.minHeight !== '0px') attrs.push(`minHeight="${s.minHeight}"`);
    if (s.maxWidth && s.maxWidth !== 'none') attrs.push(`maxWidth="${s.maxWidth}"`);
    if (s.maxHeight && s.maxHeight !== 'none') attrs.push(`maxHeight="${s.maxHeight}"`);

    const m = s.margin;
    if (m.top !== '0px' || m.right !== '0px' || m.bottom !== '0px' || m.left !== '0px') {
      if (m.top === m.right && m.right === m.bottom && m.bottom === m.left) {
        attrs.push(`margin="${m.top}"`);
      } else {
        attrs.push(`margin="${m.top} ${m.right} ${m.bottom} ${m.left}"`);
      }
    }

    const p = s.padding;
    if (p.top !== '0px' || p.right !== '0px' || p.bottom !== '0px' || p.left !== '0px') {
      if (p.top === p.right && p.right === p.bottom && p.bottom === p.left) {
        attrs.push(`padding="${p.top}"`);
      } else {
        attrs.push(`padding="${p.top} ${p.right} ${p.bottom} ${p.left}"`);
      }
    }

    if (s.backgroundColor && s.backgroundColor !== 'transparent') {
      attrs.push(`backgroundColor="${s.backgroundColor}"`);
    }
    if (s.color) attrs.push(`color="${s.color}"`);
    if (s.fontSize && s.fontSize !== '14px') attrs.push(`fontSize="${s.fontSize}"`);
    if (s.fontWeight && s.fontWeight !== '400') attrs.push(`fontWeight="${s.fontWeight}"`);
    if (s.textAlign && s.textAlign !== 'left') attrs.push(`textAlign="${s.textAlign}"`);
    if (s.borderRadius && s.borderRadius !== '0px') attrs.push(`borderRadius="${s.borderRadius}"`);
    if (s.borderColor && s.borderColor !== 'transparent') attrs.push(`borderColor="${s.borderColor}"`);
    const bw = s.borderWidth;
    if (bw.top !== '0px' || bw.right !== '0px' || bw.bottom !== '0px' || bw.left !== '0px') {
      attrs.push(`borderWidth="${bw.top}"`);
    }

    if (s.position && s.position !== 'relative') attrs.push(`position="${s.position}"`);
    if (s.overflow && s.overflow !== 'visible') attrs.push(`overflow="${s.overflow}"`);
    if (s.overflowY && s.overflowY !== 'visible') attrs.push(`overflowY="${s.overflowY}"`);

    if (node.textContent) attrs.push(`text="${escapeXmlAttr(node.textContent)}"`);
    if (node.placeholder) attrs.push(`placeholder="${escapeXmlAttr(node.placeholder)}"`);
    if (node.src) attrs.push(`src="${escapeXmlAttr(node.src)}"`);
    if (node.alt) attrs.push(`alt="${escapeXmlAttr(node.alt)}"`);

    const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    if (node.children.length === 0) {
      return `${spaces}<${tag}${attrString} />`;
    }

    const childrenStr = node.children.map(c => serializeNode(c, indent + 2)).join('\n');
    return `${spaces}<${tag}${attrString}>\n${childrenStr}\n${spaces}</${tag}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializeNode(rootNode, 0)}`;
};

export const parseXmlLayout = (xmlText: string): LayoutNode => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText.trim(), 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(parserError.textContent || 'Invalid XML syntax');
  }

  let idCounter = 1;

  const traverseElement = (el: Element): LayoutNode => {
    const rawTag = el.tagName.toLowerCase();
    let nodeType: LayoutNode['type'] = 'container';

    if (rawTag === 'button') nodeType = 'button';
    else if (rawTag === 'text' || rawTag === 'p' || rawTag === 'span') nodeType = 'text';
    else if (rawTag === 'heading' || rawTag === 'h1' || rawTag === 'h2' || rawTag === 'h3') nodeType = 'heading';
    else if (rawTag === 'input') nodeType = 'input';
    else if (rawTag === 'badge') nodeType = 'badge';
    else if (rawTag === 'card') nodeType = 'card';
    else if (rawTag === 'scroll') nodeType = 'scroll';
    else if (rawTag === 'divider') nodeType = 'divider';
    else if (rawTag === 'spacer') nodeType = 'spacer';
    else if (rawTag === 'image' || rawTag === 'img') nodeType = 'image';
    else if (rawTag === 'flex') nodeType = 'flex';
    else if (rawTag === 'grid') nodeType = 'grid';
    else if (el.hasAttribute('type')) nodeType = el.getAttribute('type') as any;

    const style = createCleanNodeStyle();

    if (nodeType === 'flex' || rawTag === 'flex') {
      style.display = 'flex';
      style.flow = 'ROW';
    } else if (nodeType === 'grid' || rawTag === 'grid') {
      style.display = 'grid';
    } else if (nodeType === 'button') {
      style.display = 'inline-block';
      style.cursor = 'pointer';
    }

    if (el.hasAttribute('display')) style.display = el.getAttribute('display') as any;
    if (el.hasAttribute('flow')) {
      const f = el.getAttribute('flow')!;
      style.flow = f as any;
      if (f === 'ROW') {
        style.display = 'flex';
        style.flexDirection = 'row';
      } else if (f === 'COLUMN') {
        style.display = 'flex';
        style.flexDirection = 'column';
      }
    }
    if (el.hasAttribute('flexDirection')) style.flexDirection = el.getAttribute('flexDirection') as any;
    if (el.hasAttribute('justifyContent')) style.justifyContent = el.getAttribute('justifyContent') as any;
    if (el.hasAttribute('alignItems')) style.alignItems = el.getAttribute('alignItems') as any;
    if (el.hasAttribute('fillRatio')) {
      style.fillRatio = el.getAttribute('fillRatio')!;
      style.flexGrow = style.fillRatio;
    }
    if (el.hasAttribute('flexGrow')) style.flexGrow = el.getAttribute('flexGrow')!;
    if (el.hasAttribute('gap')) {
      style.gap = el.getAttribute('gap')!;
      style.rowGap = style.gap;
      style.columnGap = style.gap;
    }
    if (el.hasAttribute('width')) style.width = el.getAttribute('width')!;
    if (el.hasAttribute('height')) style.height = el.getAttribute('height')!;
    if (el.hasAttribute('minWidth')) style.minWidth = el.getAttribute('minWidth')!;
    if (el.hasAttribute('minHeight')) style.minHeight = el.getAttribute('minHeight')!;
    if (el.hasAttribute('maxWidth')) style.maxWidth = el.getAttribute('maxWidth')!;
    if (el.hasAttribute('maxHeight')) style.maxHeight = el.getAttribute('maxHeight')!;

    if (el.hasAttribute('margin')) style.margin = defaultSpacing(el.getAttribute('margin')!);
    if (el.hasAttribute('padding')) style.padding = defaultSpacing(el.getAttribute('padding')!);
    if (el.hasAttribute('borderWidth')) style.borderWidth = defaultSpacing(el.getAttribute('borderWidth')!);
    if (el.hasAttribute('borderColor')) style.borderColor = rgbaArrayToHex(el.getAttribute('borderColor')!);
    if (el.hasAttribute('borderRadius')) style.borderRadius = el.getAttribute('borderRadius')!;
    if (el.hasAttribute('backgroundColor')) style.backgroundColor = rgbaArrayToHex(el.getAttribute('backgroundColor')!);
    if (el.hasAttribute('color')) style.color = rgbaArrayToHex(el.getAttribute('color')!);
    if (el.hasAttribute('fontSize')) style.fontSize = el.getAttribute('fontSize')!;
    if (el.hasAttribute('fontWeight')) style.fontWeight = el.getAttribute('fontWeight')!;
    if (el.hasAttribute('textAlign')) style.textAlign = el.getAttribute('textAlign') as any;
    if (el.hasAttribute('position')) style.position = el.getAttribute('position') as any;
    if (el.hasAttribute('overflow')) style.overflow = el.getAttribute('overflow') as any;
    if (el.hasAttribute('overflowY')) style.overflowY = el.getAttribute('overflowY') as any;

    const id = el.getAttribute('id') || `node_${idCounter++}_xml`;
    const name = el.getAttribute('name') || id;
    const textContent = el.getAttribute('text') || el.getAttribute('textContent') || undefined;
    const placeholder = el.getAttribute('placeholder') || undefined;
    const src = el.getAttribute('src') || undefined;
    const alt = el.getAttribute('alt') || undefined;

    const childElements = Array.from(el.children).filter(c => c.nodeType === 1);
    const children = childElements.map(traverseElement);

    return {
      id,
      name,
      type: nodeType,
      style,
      textContent,
      placeholder,
      src,
      alt,
      children,
      isExpanded: true,
    };
  };

  const rootElement = doc.documentElement;
  return traverseElement(rootElement);
};
