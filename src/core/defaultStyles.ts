import { LayoutNode, LayoutNodeStyle, LayoutNodeType, SpacingSides } from '../types/layout';

export const defaultSpacing = (val: string = '0px'): SpacingSides => ({
  top: val,
  right: val,
  bottom: val,
  left: val,
});

export const createDefaultStyle = (overrides?: Partial<LayoutNodeStyle>): LayoutNodeStyle => ({
  display: 'block',
  position: 'relative',
  boxSizing: 'border-box',
  overflow: 'visible',
  overflowX: 'visible',
  overflowY: 'visible',

  // Tether UI Layout Props
  flow: 'COLUMN',
  fillRatio: '1.0',
  contentAlign: 'START',
  anchorMin: '0.0',
  anchorMax: '1.0',
  interactable: false,

  width: 'auto',
  height: 'auto',
  minWidth: 'auto',
  minHeight: 'auto',
  maxWidth: 'none',
  maxHeight: 'none',
  aspectRatio: 'auto',

  margin: defaultSpacing('0px'),
  padding: defaultSpacing('8px'),

  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  gap: '8px',
  rowGap: '8px',
  columnGap: '8px',

  flexGrow: '0',
  flexShrink: '1',
  flexBasis: 'auto',
  alignSelf: 'auto',
  order: '0',

  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'auto',
  gridAutoFlow: 'row',
  gridAutoRows: 'auto',
  gridAutoColumns: 'auto',

  gridColumn: 'auto',
  gridRow: 'auto',
  gridArea: 'auto',

  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto',
  zIndex: 'auto',

  backgroundColor: 'rgba(40, 44, 52, 0.7)',
  borderWidth: defaultSpacing('1px'),
  borderColor: '#4a5568',
  borderStyle: 'solid',
  borderRadius: '4px',
  opacity: '1',
  color: '#e2e8f0',
  fontSize: '14px',
  fontWeight: '400',
  textAlign: 'left',

  ...overrides,
});

export const createWidgetPreset = (type: LayoutNodeType, customName?: string): LayoutNode => {
  const id = 'node_' + Math.random().toString(36).substring(2, 9);
  
  switch (type) {
    case 'flex':
      return {
        id,
        name: customName || 'Flex Container',
        type: 'flex',
        isExpanded: true,
        style: createDefaultStyle({
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '12px',
          padding: defaultSpacing('16px'),
          backgroundColor: 'rgba(23, 37, 84, 0.4)',
          borderColor: '#2563eb',
          minHeight: '80px',
        }),
        children: [],
      };

    case 'grid':
      return {
        id,
        name: customName || 'Grid 2x2',
        type: 'grid',
        isExpanded: true,
        style: createDefaultStyle({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '12px',
          padding: defaultSpacing('16px'),
          backgroundColor: 'rgba(59, 7, 100, 0.35)',
          borderColor: '#9333ea',
          minHeight: '120px',
        }),
        children: [],
      };

    case 'container':
      return {
        id,
        name: customName || 'Block Container',
        type: 'container',
        isExpanded: true,
        style: createDefaultStyle({
          display: 'block',
          padding: defaultSpacing('12px'),
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          borderColor: '#475569',
          minHeight: '60px',
        }),
        children: [],
      };

    case 'text':
      return {
        id,
        name: customName || 'Text Block',
        type: 'text',
        textContent: 'Sample Text Item',
        style: createDefaultStyle({
          display: 'block',
          width: 'auto',
          height: 'auto',
          padding: { top: '4px', right: '8px', bottom: '4px', left: '8px' },
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderColor: '#334155',
          color: '#f8fafc',
          fontSize: '14px',
          fontWeight: '500',
        }),
        children: [],
      };

    case 'button':
      return {
        id,
        name: customName || 'Button Widget',
        type: 'button',
        textContent: 'Click Me',
        style: createDefaultStyle({
          display: 'inline-block',
          width: 'auto',
          height: 'auto',
          padding: { top: '8px', right: '16px', bottom: '8px', left: '16px' },
          backgroundColor: '#0284c7',
          borderColor: '#38bdf8',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'center',
          cursor: 'pointer',
        }),
        children: [],
      };

    case 'image':
      return {
        id,
        name: customName || 'Image Box',
        type: 'image',
        style: createDefaultStyle({
          display: 'block',
          width: '120px',
          height: '80px',
          backgroundColor: 'rgba(217, 119, 6, 0.25)',
          borderColor: '#d97706',
          borderRadius: '4px',
        }),
        children: [],
      };

    case 'spacer':
      return {
        id,
        name: customName || 'Spacer',
        type: 'spacer',
        style: createDefaultStyle({
          display: 'block',
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(100, 116, 139, 0.2)',
          borderColor: '#64748b',
          borderStyle: 'dashed',
          flexGrow: '1',
        }),
        children: [],
      };

    default:
      return {
        id,
        name: customName || 'Element',
        type: 'container',
        style: createDefaultStyle(),
        children: [],
      };
  }
};

