import React from 'react';

interface SplitterProps {
  direction: 'horizontal' | 'vertical';
  currentSize: number;
  onUpdateSize: (newSize: number) => void;
  min?: number;
  max?: number;
  invert?: boolean;
  onDoubleClick?: () => void;
  className?: string;
}

export const Splitter: React.FC<SplitterProps> = ({
  direction,
  currentSize,
  onUpdateSize,
  min = 100,
  max = 800,
  invert = false,
  onDoubleClick,
  className = '',
}) => {
  const isH = direction === 'horizontal';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startPos = isH ? e.clientX : e.clientY;
    const initialSize = currentSize;

    // Attach overlay to body to prevent iframe/child stealing events
    document.body.style.cursor = isH ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isH ? moveEvent.clientX : moveEvent.clientY;
      const rawDelta = currentPos - startPos;
      const delta = invert ? -rawDelta : rawDelta;
      const newSize = Math.max(min, Math.min(max, initialSize + delta));
      onUpdateSize(newSize);
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      title="Click and drag to resize panel (Double-click to reset)"
      className={`group relative z-30 transition-colors select-none ${
        isH
          ? 'w-1.5 cursor-col-resize hover:bg-blue-500/90 bg-[#27272e]'
          : 'h-1.5 cursor-row-resize hover:bg-blue-500/90 bg-[#27272e]'
      } ${className}`}
    >
      <div
        className={`absolute inset-0 m-auto bg-transparent group-hover:bg-blue-400 transition-colors ${
          isH ? 'w-0.5 h-8 rounded-full' : 'h-0.5 w-8 rounded-full'
        }`}
      />
    </div>
  );
};
