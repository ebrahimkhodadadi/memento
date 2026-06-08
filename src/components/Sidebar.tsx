import { useState } from 'react';
import { Info, AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { SurvivalCurve } from './SurvivalCurve';
import { PHILOSOPHICAL_QUOTES } from '../constants';
import type { Profile, Settings } from '../types';
import { formatJalaliVerbose } from '../jalali';

interface SidebarProps {
  activeProfile: Profile;
  calculations: any;
  settings: Settings;
  mortalityProb10Y: number;
  quoteIndex: number;
  onNextQuote: () => void;
  t: any;
}

export function Sidebar({
  activeProfile,
  calculations,
  settings,
  mortalityProb10Y,
  quoteIndex,
  onNextQuote,
  t
}: SidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const yearsLived = calculations.stats.lived.days / 365.25;
  const candleNumber = Math.floor(yearsLived) + 1;

  // Format birthdate verbose
  const getBirthDetailsString = () => {
    try {
      const [gy, gm, gd] = activeProfile.birthDate.split('-').map(Number);
      const timeStr = activeProfile.birthTime ? ` ${activeProfile.birthTime}` : '';
      if (settings.language === 'fa') {
        return `${formatJalaliVerbose(gy, gm, gd)}${timeStr ? ` ساعت ${timeStr}` : ''}`;
      }
      return `${new Date(activeProfile.birthDate).toLocaleDateString('en-US', { dateStyle: 'long' })}${timeStr ? ` at ${timeStr}` : ''}`;
    } catch (e) {
      return activeProfile.birthDate;
    }
  };

  return (
    <aside className="sidebar-panel">
      {/* Quick Insight Banner */}
      <div className="insight-banner">
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          {settings.language === 'fa' 
            ? `امروز یک هدیه است. شما ${calculations.livedPercent.toFixed(2)}٪ از مسیر زندگی خود را طی کرده‌اید.`
            : `Today is a gift. You have lived ${calculations.livedPercent.toFixed(2)}% of your timeline.`
          }
        </span>
      </div>

      {/* Birth Details & Birthday Candle box */}
      <div className="glass-panel sidebar-section">
        <div className="sidebar-section-header" onClick={() => toggleSection('birth-details')}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🎉 {settings.language === 'fa' ? 'جزئیات تولد' : 'Birth Details'}</h3>
          <button className="sidebar-collapse-btn">
            {collapsedSections['birth-details'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <div className={`sidebar-section-content ${collapsedSections['birth-details'] ? 'collapsed' : ''}`}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            <strong>{settings.language === 'fa' ? 'تاریخ و ساعت تولد:' : 'Born:'}</strong>{' '}
            {getBirthDetailsString()}
          </div>
          
          {/* Birthday Candle Highlight Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '8px'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {settings.language === 'fa' ? 'شمع تولد بعدی شما:' : 'Your Next Candle:'}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-h)' }}>
              {candleNumber} 🎂
            </span>
          </div>
        </div>
      </div>

      {/* Circular Progress & Lived Stats */}
      <div className="glass-panel sidebar-section">
        <div className="sidebar-section-header" onClick={() => toggleSection('life-progress')}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t.lifeLived} / {t.lifeRemaining}</h3>
          <button className="sidebar-collapse-btn">
            {collapsedSections['life-progress'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <div className={`sidebar-section-content ${collapsedSections['life-progress'] ? 'collapsed' : ''}`}>
        <div className="progress-container">
          <div className="progress-circle-wrap">
            <svg viewBox="0 0 140 140">
              <circle className="progress-circle-bg" cx="70" cy="70" r="60" />
              <circle 
                className="progress-circle-bar" 
                cx="70" 
                cy="70" 
                r="60" 
                strokeDasharray={376.99}
                strokeDashoffset={376.99 - (376.99 * calculations.livedPercent) / 100}
              />
            </svg>
            <div className="progress-circle-text">
              {calculations.livedPercent.toFixed(1)}%
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-dot lived" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{calculations.stats.lived.weeks.toLocaleString()} {t.weeks}</div>
                <div style={{ fontSize: '0.75rem' }}>{t.lived}</div>
              </div>
            </div>

            <div className="stat-item">
              <span className="stat-dot remaining" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{calculations.stats.remaining.weeks.toLocaleString()} {t.weeks}</div>
                <div style={{ fontSize: '0.75rem' }}>{t.remaining}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>{settings.language === 'fa' ? 'امید به زندگی علمی:' : 'Life Expectancy:'} {calculations.adjustedLifespan} {t.years}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{calculations.livedPercent.toFixed(1)}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            background: 'var(--unit-empty)', 
            borderRadius: '10px', 
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <div style={{ 
              width: `${calculations.livedPercent}%`, 
              height: '100%', 
              background: settings.language === 'fa' 
                ? 'linear-gradient(270deg, var(--unit-lived), var(--accent))' 
                : 'linear-gradient(90deg, var(--unit-lived), var(--accent))',
              borderRadius: '10px',
              transition: 'width 0.8s ease-out'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.8 }}>
            <span>0 {t.years}</span>
            <span>{calculations.age.years} {t.years} {t.lived}</span>
            <span>{calculations.adjustedLifespan} {t.years}</span>
          </div>
        </div>

        {/* Exact age counters */}
        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{t.exactAge}</h4>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-h)', whiteSpace: 'nowrap' }}>
            {t.preciseAgeDesc
              .replace('{y}', calculations.age.years.toString())
              .replace('{m}', calculations.age.months.toString())
              .replace('{d}', calculations.age.days.toString())
              .replace('{h}', calculations.age.hours.toString())
              .replace('{mn}', calculations.age.minutes.toString())
              .replace('{s}', calculations.age.seconds.toString())}
          </p>
        </div>

        <div className="stats-panel-grid">
          <div className="stat-box">
            <div className="stat-box-label">{t.days} {t.lived}</div>
            <div className="stat-box-value">{calculations.stats.lived.days.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">{t.months} {t.lived}</div>
            <div className="stat-box-value">{calculations.stats.lived.months.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">{t.hours} {t.lived}</div>
            <div className="stat-box-value">{calculations.stats.lived.hours.toLocaleString()}</div>
          </div>
        </div>
        </div>
      </div>

      {/* Uncensored Death Probability & Obituary Reflection */}
      {settings.uncensoredMode && (
        <div className="glass-panel mortality-section sidebar-section">
          <div className="sidebar-section-header" onClick={() => toggleSection('mortality')}>
            <h3 className="mortality-title" style={{ margin: 0, flex: 1 }}>
              <AlertTriangle size={16} style={{ color: 'var(--unit-current)' }} />
              <span style={{ fontSize: '0.95rem' }}>{t.mortalityProb}</span>
            </h3>
            <button className="sidebar-collapse-btn">
              {collapsedSections['mortality'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
          <div className={`sidebar-section-content ${collapsedSections['mortality'] ? 'collapsed' : ''}`}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
              <span>{t.mortalityProb10Years}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{mortalityProb10Y.toFixed(2)}%</span>
            </div>
            <div className="mortality-progress">
              <div className="mortality-progress-fill" style={{ width: `${Math.min(100, mortalityProb10Y)}%` }} />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.8rem', marginBottom: '2px' }}>{t.survivalProbability}</h4>
            <SurvivalCurve 
              ageInDays={calculations.stats.lived.days} 
              adjustedLifespan={calculations.adjustedLifespan}
              theme={settings.theme}
              language={settings.language}
              livedLabel={t.lived}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '2px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--unit-current)', marginBottom: '4px' }}>{t.obituaryTitle}</h4>
            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', lineHeight: 1.4 }}>
              {t.obituaryText
                .replace('{name}', activeProfile.name)
                .replace('{livedPercent}', calculations.livedPercent.toFixed(1))
                .replace('{daysLived}', calculations.stats.lived.days.toLocaleString())
                .replace('{daysLeft}', calculations.stats.remaining.days.toLocaleString())}
            </p>
          </div>
          </div>
        </div>
      )}

      {/* Philosophical Quotes */}
      <div className="glass-panel quote-panel sidebar-section" style={{ flexGrow: 1 }}>
        <div className="sidebar-section-header" onClick={() => toggleSection('quotes')}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{settings.language === 'fa' ? 'تأملات فلسفی' : 'Philosophical Reflections'}</h3>
          <button className="sidebar-collapse-btn">
            {collapsedSections['quotes'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <div className={`sidebar-section-content ${collapsedSections['quotes'] ? 'collapsed' : ''}`}>
          <p className="quote-text">
            {settings.language === 'fa' 
              ? PHILOSOPHICAL_QUOTES[quoteIndex].quoteFa 
              : PHILOSOPHICAL_QUOTES[quoteIndex].quoteEn}
          </p>
          <p className="quote-author">
            — {settings.language === 'fa' 
              ? PHILOSOPHICAL_QUOTES[quoteIndex].authorFa 
              : PHILOSOPHICAL_QUOTES[quoteIndex].authorEn}
          </p>
          
          <button 
            className="btn" 
            onClick={onNextQuote}
            style={{ marginTop: '4px' }}
          >
            <RotateCcw size={12} />
            <span>{t.nextQuote}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
