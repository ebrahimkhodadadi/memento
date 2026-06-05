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
          <button className="btn btn-icon-only" onClick={() => setZoomLevel(1)} title={t.resetZoom}>
            <RotateCcw size={14} />
          </button>
          <button className="btn btn-primary" onClick={handleExportPng}>
            <Share2 size={14} />
            <span>{t.exportPng}</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-zoom-container">
        <div 
          className="grid-wrapper" 
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className={`memento-grid ${viewMode}`}>
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
