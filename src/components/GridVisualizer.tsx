import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';
import type { ViewMode, Settings, JournalEntry, Milestone } from '../types';
import { soundEngine } from '../sound';

interface GridVisualizerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  zoomLevel: number;
  setZoomLevel: (z: number | ((prev: number) => number)) => void;
  gridData: { totalUnits: number; currentUnitIndex: number };
  journal: Record<string, JournalEntry>;
  getUnitNoteKey: (index: number) => string;
  getUnitMilestones: (index: number) => Milestone[];
  handleUnitClick: (index: number) => void;
  handleUnitMouseEnter: (e: React.MouseEvent, index: number) => void;
  setHoveredUnitIndex: (index: number | null) => void;
  settings: Settings;
  handleExportPng: () => void;
  t: any;
}

export function GridVisualizer({
  viewMode,
  setViewMode,
  zoomLevel,
  setZoomLevel,
  gridData,
  journal,
  getUnitNoteKey,
  getUnitMilestones,
  handleUnitClick,
  handleUnitMouseEnter,
  setHoveredUnitIndex,
  settings,
  handleExportPng,
  t
}: GridVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });

  // Measure grid size when viewMode or gridData changes
  useEffect(() => {
    if (gridRef.current) {
      setGridSize({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight
      });
    }
  }, [viewMode, gridData.totalUnits]);

  // Calculate and set the zoom level to fit the grid perfectly inside the container
  const handleResetZoom = useCallback(() => {
    if (!containerRef.current || !gridRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const gridWidth = gridRef.current.offsetWidth;
    const gridHeight = gridRef.current.offsetHeight;

    if (gridWidth === 0 || gridHeight === 0) return;

    // Use padding (16px left + 16px right = 32px) and 16px safety margin = 48px
    const targetWidth = Math.max(100, containerWidth - 48);
    const targetHeight = Math.max(100, containerHeight - 48);

    const scaleX = targetWidth / gridWidth;
    const scaleY = targetHeight / gridHeight;

    // Prioritize height so it fits vertically without scrolling, then clamp by width
    const fitZoom = Math.min(scaleX, scaleY);
    const finalZoom = Math.max(0.15, Math.min(3.0, fitZoom));

    setZoomLevel(finalZoom);
    setGridSize({ width: gridWidth, height: gridHeight });
  }, [setZoomLevel]);

  // Auto-fit when the viewMode changes or component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      handleResetZoom();
    }, 100);
    return () => clearTimeout(timer);
  }, [viewMode, handleResetZoom]);
  return (
    <div className="glass-panel visualization-panel">
      <div className="view-selector">
        {/* Switch weeks/months/years */}
        <div className="segmented-control">
          <button 
            className={`segmented-control-btn ${viewMode === 'weeks' ? 'active' : ''}`}
            onClick={() => setViewMode('weeks')}
          >
            {t.weeks}
          </button>
          <button 
            className={`segmented-control-btn ${viewMode === 'months' ? 'active' : ''}`}
            onClick={() => setViewMode('months')}
          >
            {t.months}
          </button>
          <button 
            className={`segmented-control-btn ${viewMode === 'years' ? 'active' : ''}`}
            onClick={() => setViewMode('years')}
          >
            {t.years}
          </button>
        </div>

        {/* Grid zooming controls & PNG Export */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-icon-only" onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.15))} title={t.zoomIn}>
            <ZoomIn size={14} />
          </button>
          <button className="btn btn-icon-only" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.15))} title={t.zoomOut}>
            <ZoomOut size={14} />
          </button>
          <button className="btn btn-icon-only" onClick={handleResetZoom} title={t.resetZoom}>
            <RotateCcw size={14} />
          </button>
          <button className="btn" onClick={handleExportPng}>
            <Share2 size={14} />
            <span>{t.exportPng}</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-zoom-container" ref={containerRef}>
        <div 
          className="grid-wrapper" 
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            width: gridSize.width ? `${gridSize.width}px` : 'auto',
            height: gridSize.height ? `${gridSize.height}px` : 'auto',
            marginBottom: gridSize.height ? `${gridSize.height * (zoomLevel - 1)}px` : '0px',
            marginLeft: gridSize.width ? `${(gridSize.width * (zoomLevel - 1)) / 2}px` : '0px',
            marginRight: gridSize.width ? `${(gridSize.width * (zoomLevel - 1)) / 2}px` : '0px'
          }}
        >
          <div className={`memento-grid ${viewMode}`} ref={gridRef}>
            {Array.from({ length: gridData.totalUnits }).map((_, index) => {
              const isLived = index < gridData.currentUnitIndex;
              const isCurrent = index === gridData.currentUnitIndex;
              const hasNote = !!journal[getUnitNoteKey(index)];
              const milestones = getUnitMilestones(index);
              const hasMilestone = milestones.length > 0;

              let className = 'grid-unit';
              if (isLived) className += ' lived';
              if (isCurrent) className += ' current';
              if (hasNote) className += ' has-note';
              if (hasMilestone) className += ' has-milestone';

              return (
                <div 
                  key={index} 
                  className={className}
                  onClick={() => handleUnitClick(index)}
                  onMouseEnter={(e) => {
                    handleUnitMouseEnter(e, index);
                    if (settings.soundEnabled) {
                      soundEngine.playHoverTick();
                    }
                  }}
                  onMouseLeave={() => setHoveredUnitIndex(null)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
