import { useState, useRef } from 'react';
import { Clock, Maximize2, X, Edit3, Trash2, Check, Plus, Volume2, VolumeX, Music, RotateCcw } from 'lucide-react';

interface CountdownBannerProps {
  countdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  livedPercent: number;
  language: string;
  activeProfileId: string;
  countdownNotes: Record<string, string>;
  onSaveCountdownNote: (id: string, text: string) => void;
  onDeleteCountdownNote: (id: string) => void;
  showCountdownNote?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  ambientEnabled?: boolean;
  onToggleAmbient?: () => void;
  t: any;
}

export function CountdownBanner({ countdown, livedPercent, language, activeProfileId, countdownNotes, onSaveCountdownNote, onDeleteCountdownNote, showCountdownNote, soundEnabled, onToggleSound, ambientEnabled, onToggleAmbient, t }: CountdownBannerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [bannerScale, setBannerScale] = useState(1);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startScale = useRef(1);
  const bannerScaleRef = useRef(1);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startY.current = e.clientY;
    startScale.current = bannerScaleRef.current;

    const handleMouseMove = (moveE: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaY = moveE.clientY - startY.current;
      const newScale = Math.max(1, Math.min(4, startScale.current + deltaY / 150));
      setBannerScale(newScale);
      bannerScaleRef.current = newScale;
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const units = [
    { value: countdown.years, labelEn: 'Years', labelFa: 'سال' },
    { value: countdown.months, labelEn: 'Months', labelFa: 'ماه' },
    { value: countdown.days, labelEn: 'Days', labelFa: 'روز' },
    { value: countdown.hours, labelEn: 'Hours', labelFa: 'ساعت' },
    { value: countdown.minutes, labelEn: 'Minutes', labelFa: 'دقیقه' },
    { value: countdown.seconds, labelEn: 'Seconds', labelFa: 'ثانیه' },
  ];

  return (
    <>
      <div className="countdown-banner glass-panel" style={{ position: 'relative', minHeight: `${Math.max(80, 80 * bannerScale)}px` }}>
        <div className="countdown-banner-label" style={{ fontSize: `${0.85 * bannerScale}rem` }}>
          <Clock size={18 * bannerScale} />
          <span>{t.timeLeft}</span>
        </div>
        <div className="countdown-banner-blocks" style={{ gap: `${12 * bannerScale}px` }}>
          {units.map((unit, idx) => (
            <div key={idx} className="countdown-block" style={{ minWidth: `${70 * bannerScale}px`, padding: `${8 * bannerScale}px ${12 * bannerScale}px`, borderRadius: `${8 * bannerScale}px` }}>
              <span className="countdown-block-value" style={{ fontSize: `${2.3 * bannerScale}rem` }}>
                {unit.value.toString().padStart(2, '0')}
              </span>
              <span className="countdown-block-label" style={{ fontSize: `${0.8 * bannerScale}rem`, marginTop: `${4 * bannerScale}px` }}>
                {language === 'fa' ? unit.labelFa : unit.labelEn}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${6 * bannerScale}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${10 * bannerScale}px` }}>
            <div className="countdown-banner-percent" style={{ fontSize: `${0.85 * bannerScale}rem` }}>
              {livedPercent.toFixed(2)}% {t.lived}
            </div>
            <button 
              className="btn btn-icon-only" 
              onClick={() => setIsFullscreen(true)}
              title={language === 'fa' ? 'بزرگنمایی تایمر' : 'Enlarge Timer'}
              style={{ border: 'none', background: 'transparent', padding: `${4 * bannerScale}px`, transform: `scale(${bannerScale})` }}
            >
              <Maximize2 size={16} />
            </button>
          </div>
          {bannerScale > 1.05 && (
            <button 
              className="countdown-banner-reset-btn"
              onClick={() => { setBannerScale(1); bannerScaleRef.current = 1; }}
              title={language === 'fa' ? 'بازنشانی اندازه' : 'Reset size'}
            >
              <RotateCcw size={12} />
              <span>{language === 'fa' ? 'بازنشانی' : 'Reset'}</span>
            </button>
          )}
        </div>
        {/* Resize Handle */}
        <div 
          className="countdown-banner-resize-handle"
          onMouseDown={handleResizeStart}
          title={language === 'fa' ? 'کشیدن برای تغییر اندازه' : 'Drag to resize'}
        />
      </div>

      {/* Fullscreen Timer Overlay */}
      {isFullscreen && (
        <div className="countdown-fullscreen-overlay">
          <div className="fullscreen-top-actions">
            <div className="fullscreen-actions-group">
              <button 
                className={`fullscreen-action-btn ${soundEnabled ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggleSound?.(); }}
                title={language === 'fa' ? 'صدای تیک‌تاک' : 'Ticking Sound'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button 
                className={`fullscreen-action-btn ${ambientEnabled ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggleAmbient?.(); }}
                title={language === 'fa' ? 'موسیقی پس‌زمینه' : 'Ambient Music'}
              >
                <Music size={18} />
              </button>
            </div>
            <div className="fullscreen-close-wrapper">
              <button 
                className="fullscreen-close-btn" 
                onClick={() => setIsFullscreen(false)}
                title={language === 'fa' ? 'بستن' : 'Close'}
              >
                <X size={22} />
              </button>
            </div>
          </div>
          
          <div className="countdown-fullscreen-content">
            <div className="countdown-fullscreen-title">
              {t.timeLeft}
            </div>
            
            <div className="countdown-fullscreen-blocks">
              {units.map((unit, idx) => (
                <div key={idx} className="countdown-fullscreen-block">
                  <span className="countdown-fullscreen-value">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <span className="countdown-fullscreen-label">
                    {language === 'fa' ? unit.labelFa : unit.labelEn}
                  </span>
                </div>
              ))}
            </div>

            <div className="countdown-fullscreen-percent">
              {livedPercent.toFixed(6)}% {t.lived}
            </div>

            {/* Editable Countdown Note */}
            {showCountdownNote !== false && (
            <div className="countdown-note-section">
              {!isEditingNote && countdownNotes[activeProfileId] ? (
                <div className="countdown-note-display">
                  <p className="countdown-note-text">{countdownNotes[activeProfileId]}</p>
                  <div className="countdown-note-actions">
                    <button 
                      className="countdown-note-btn"
                      onClick={() => {
                        setNoteText(countdownNotes[activeProfileId]);
                        setIsEditingNote(true);
                      }}
                      title={language === 'fa' ? 'ویرایش یادداشت' : 'Edit note'}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      className="countdown-note-btn"
                      onClick={() => onDeleteCountdownNote(activeProfileId)}
                      title={language === 'fa' ? 'حذف یادداشت' : 'Delete note'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : isEditingNote ? (
                <div className="countdown-note-editor">
                  <textarea
                    className="countdown-note-textarea"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder={language === 'fa' ? 'یادداشت خود را بنویسید...' : 'Write your personal note here...'}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="countdown-note-editor-actions">
                    <button 
                      className="countdown-note-btn save-btn"
                      onClick={() => {
                        if (noteText.trim()) {
                          onSaveCountdownNote(activeProfileId, noteText.trim());
                        }
                        setIsEditingNote(false);
                      }}
                    >
                      <Check size={14} />
                      <span>{language === 'fa' ? 'ذخیره' : 'Save'}</span>
                    </button>
                    <button 
                      className="countdown-note-btn cancel-btn"
                      onClick={() => {
                        setIsEditingNote(false);
                        setNoteText('');
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="countdown-note-add-btn"
                  onClick={() => {
                    setNoteText('');
                    setIsEditingNote(true);
                  }}
                  title={language === 'fa' ? 'افزودن یادداشت' : 'Add a personal note'}
                >
                  <Plus size={16} />
                  <span>{language === 'fa' ? 'افزودن یادداشت شخصی' : 'Add a personal note'}</span>
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
