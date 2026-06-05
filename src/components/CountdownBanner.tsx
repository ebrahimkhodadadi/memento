import { useState } from 'react';
import { Clock, Maximize2, X } from 'lucide-react';

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
  t: any;
}

export function CountdownBanner({ countdown, livedPercent, language, t }: CountdownBannerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <div className="countdown-banner glass-panel">
        <div className="countdown-banner-label">
          <Clock size={18} />
          <span>{t.timeLeft}</span>
        </div>
        <div className="countdown-banner-blocks">
          {units.map((unit, idx) => (
            <div key={idx} className="countdown-block">
              <span className="countdown-block-value">
                {unit.value.toString().padStart(2, '0')}
              </span>
              <span className="countdown-block-label">
                {language === 'fa' ? unit.labelFa : unit.labelEn}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="countdown-banner-percent">
            {livedPercent.toFixed(2)}% {t.lived}
          </div>
          <button 
            className="btn btn-icon-only" 
            onClick={() => setIsFullscreen(true)}
            title={language === 'fa' ? 'بزرگنمایی تایمر' : 'Enlarge Timer'}
            style={{ border: 'none', background: 'transparent', padding: '4px' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Fullscreen Timer Overlay */}
      {isFullscreen && (
        <div className="countdown-fullscreen-overlay">
          <button 
            className="countdown-fullscreen-close" 
            onClick={() => setIsFullscreen(false)}
            title={language === 'fa' ? 'بستن' : 'Close'}
          >
            <X size={22} />
          </button>
          
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
          </div>
        </div>
      )}
    </>
  );
}
