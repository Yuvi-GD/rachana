export type LayoutNodeType =
  | 'container'
  | 'flex'
  | 'grid'
  | 'card'
  | 'scroll'
  | 'text'
  | 'heading'
  | 'button'
  | 'input'
  | 'image'
  | 'badge'
  | 'divider'
  | 'spacer';

export const isContainerNodeType = (type: LayoutNodeType): boolean => {
  return type === 'container' || type === 'flex' || type === 'grid' || type === 'card' || type === 'scroll';
};

export interface SpacingSides {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface ComputedSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutNodeStyle {
  // Display & Flow
  display: 'block' | 'inline-block' | 'inline' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  boxSizing: 'content-box' | 'border-box';
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Tether UI Layout Flow & Anchors
  flow?: 'ROW' | 'COLUMN' | 'NONE';
  fillRatio?: string; // e.g. "1.0", "0.22", "0.78"
  contentAlign?: 'START' | 'CENTER' | 'END' | 'SPACE_BETWEEN';
  anchorMin?: string; // e.g. "0.0" or "0.0 0.0"
  anchorMax?: string; // e.g. "1.0" or "1.0 1.0"
  interactable?: boolean;
  hoverColor?: string;
  pressColor?: string;

  // Box Sizing
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
  aspectRatio: string;

  // Spacing (Margin & Padding)
  margin: SpacingSides;
  padding: SpacingSides;

  // Gap (First-Class Container Spacing)
  gap: string;
  rowGap: string;
  columnGap: string;

  // Flex Container
  flexDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

  // Flex Item
  flexGrow: string;
  flexShrink: string;
  flexBasis: string;
  alignSelf: 'auto' | 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  order: string;

  // Grid Container
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridAutoFlow: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  gridAutoRows: string;
  gridAutoColumns: string;

  // Grid Item
  gridColumn: string;
  gridRow: string;
  gridArea: string;

  // Positioning Coordinates
  top: string;
  right: string;
  bottom: string;
  left: string;
  zIndex: string;

  // Appearance & Effects
  backgroundColor: string;
  borderWidth: SpacingSides;
  borderColor: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius: string;
  boxShadow?: string;
  opacity: string;
  color: string;
  fontFamily?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap';
  cursor?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  customCss?: string;
}

export interface LayoutNode {
  id: string;
  name: string;
  type: LayoutNodeType;
  style: LayoutNodeStyle;
  children: LayoutNode[];
  textContent?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  isExpanded?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface ComputedMetrics {
  id: string;
  tagName: string;
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  contentBox: {
    width: number;
    height: number;
  };
  margin: ComputedSides;
  padding: ComputedSides;
  border: ComputedSides;
  scroll: {
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
    offsetWidth: number;
    offsetHeight: number;
  };
  computedStyle: {
    display: string;
    position: string;
    boxSizing: string;
    width: string;
    height: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    flexGrow?: string;
    flexShrink?: string;
    flexBasis?: string;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
  };
}

export interface LayoutEngineTestCase {
  id: string;
  title: string;
  category: 'General' | 'Complex UI' | 'Flexbox' | 'Grid' | 'BoxModel' | 'Positioning' | 'EdgeCases';
  description: string;
  specReference?: string;
  rootNode: LayoutNode;
  expectedBehaviorNotes: string[];
}
