// ========================================================
// Rachana Theme Engine & Color Derivation
// ========================================================

export interface CustomThemePalette {
  baseColor: string;    // Main panel background (e.g. #131b2e)
  accentColor: string;  // Primary accent (e.g. #38bdf8)
}

export const PRESET_CUSTOM_PALETTES: Array<{ name: string; base: string; accent: string; description: string }> = [
  { name: 'Midnight Navy', base: '#0f172a', accent: '#38bdf8', description: 'Deep oceanic slate with neon cyan' },
  { name: 'Cyberpunk Dark', base: '#181410', accent: '#f59e0b', description: 'Warm industrial pitch with amber glow' },
  { name: 'Forest Emerald', base: '#0c1813', accent: '#10b981', description: 'Deep botanical dark with vibrant emerald' },
  { name: 'Royal Violet', base: '#161226', accent: '#a855f7', description: 'Nebula dark with electric purple' },
  { name: 'Crimson Night', base: '#1a1014', accent: '#f43f5e', description: 'Vampire dark with vivid rose accent' },
  { name: 'Nordic Frost', base: '#141e28', accent: '#06b6d4', description: 'Cool arctic grey with crisp icy blue' },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 24, g: 24, b: 27 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  if (factor >= 0) {
    // Lighten
    const newR = r + (255 - r) * factor;
    const newG = g + (255 - g) * factor;
    const newB = b + (255 - b) * factor;
    return rgbToHex(newR, newG, newB);
  } else {
    // Darken
    const newR = r * (1 + factor);
    const newG = g * (1 + factor);
    const newB = b * (1 + factor);
    return rgbToHex(newR, newG, newB);
  }
}

export function applyThemeToDom(
  theme: 'grey' | 'amoled-black' | 'white' | 'custom',
  customBase: string = '#0f172a',
  customAccent: string = '#38bdf8'
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme);

  if (theme === 'custom') {
    const base = customBase || '#0f172a';
    const accent = customAccent || '#38bdf8';

    const appBg = adjustBrightness(base, -35);
    const panelBg = base;
    const headerBg = adjustBrightness(base, -18);
    const subBg = adjustBrightness(base, 12);
    const cardBg = adjustBrightness(base, 18);
    const inputBg = adjustBrightness(base, -20);
    const hoverBg = adjustBrightness(base, 24);
    const borderColor = adjustBrightness(base, 32);
    const borderSubtle = adjustBrightness(base, 16);
    const viewportBg = adjustBrightness(base, -40);
    const viewportDot = adjustBrightness(base, 22);

    root.style.setProperty('--theme-bg-app', appBg);
    root.style.setProperty('--theme-bg-panel', panelBg);
    root.style.setProperty('--theme-bg-header', headerBg);
    root.style.setProperty('--theme-bg-sub', subBg);
    root.style.setProperty('--theme-bg-card', cardBg);
    root.style.setProperty('--theme-bg-input', inputBg);
    root.style.setProperty('--theme-bg-hover', hoverBg);
    root.style.setProperty('--theme-border', borderColor);
    root.style.setProperty('--theme-border-subtle', borderSubtle);
    root.style.setProperty('--theme-text-main', '#f8fafc');
    root.style.setProperty('--theme-text-sub', '#cbd5e1');
    root.style.setProperty('--theme-text-muted', '#94a3b8');
    root.style.setProperty('--theme-ruler-bg', headerBg);
    root.style.setProperty('--theme-ruler-tick', adjustBrightness(base, 45));
    root.style.setProperty('--theme-ruler-subtick', adjustBrightness(base, 25));
    root.style.setProperty('--theme-viewport-bg', viewportBg);
    root.style.setProperty('--theme-viewport-dot', viewportDot);
    root.style.setProperty('--theme-accent', accent);
  } else {
    // Clear inline custom properties for predefined CSS themes
    const props = [
      '--theme-bg-app',
      '--theme-bg-panel',
      '--theme-bg-header',
      '--theme-bg-sub',
      '--theme-bg-card',
      '--theme-bg-input',
      '--theme-bg-hover',
      '--theme-border',
      '--theme-border-subtle',
      '--theme-text-main',
      '--theme-text-sub',
      '--theme-text-muted',
      '--theme-ruler-bg',
      '--theme-ruler-tick',
      '--theme-ruler-subtick',
      '--theme-viewport-bg',
      '--theme-viewport-dot',
      '--theme-accent',
    ];
    props.forEach(p => root.style.removeProperty(p));
  }
}

