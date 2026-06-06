import { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import type { ViewMode, JournalEntry, Milestone } from '../types';

const DEFAULT_LEGACY_EVENTS = [
  {
    id: 'voyager-journey',
    yearsAfter: 5,
    titleEn: 'Voyager Continues',
    titleFa: 'سفر فضاپیمای وویجر',
    descriptionEn: 'The Voyager spacecraft continues its silent journey through interstellar space, carrying a record of humanity.',
    descriptionFa: 'فضاپیمای وویجر به سفر خاموش خود در فضای بین‌ستاره‌ای ادامه می‌دهد و حامل نشانی از بشریت است.',
    icon: '🚀'
  },
  {
    id: 'digital-archive',
    yearsAfter: 25,
    titleEn: 'Digital Footprint Deactivation',
    titleFa: 'خواب زمستانی اکانت‌های دیجیتال',
    descriptionEn: 'Most of your personal digital accounts, social profiles, and backups are archived or permanently deleted.',
    descriptionFa: 'اکثر حساب‌های کاربری دیجیتال، صفحات مجازی و فایل‌های پشتیبان شما بایگانی یا به طور کامل حذف می‌شوند.',
    icon: '💾'
  },
  {
    id: 'grandchildren-memory',
    yearsAfter: 50,
    titleEn: 'Generational Memories',
    titleFa: 'یادگار در سینه نسل‌ها',
    descriptionEn: 'Stories and memories of your life are shared by grandchildren or close friends who knew you.',
    descriptionFa: 'داستان‌ها و خاطرات زندگی شما توسط نوه‌ها یا دوستان نزدیکی که شما را می‌شناختند بازگو می‌شود.',
    icon: '👵'
  },
  {
    id: 'new-generation',
    yearsAfter: 100,
    titleEn: 'A New Century',
    titleFa: 'قرنی بدون ما',
    descriptionEn: 'A full century has passed. The world is populated by entirely new generations. Physical relics of your daily life are now historical artifacts.',
    descriptionFa: 'یک قرن کامل گذشته است. زمین پر از نسل‌های جدیدی است که هرگز ما را ندیده‌اند. اشیاء روزمره شما اکنون عتیقه‌های تاریخی هستند.',
    icon: '⏳'
  },
  {
    id: 'atomic-integration',
    yearsAfter: 500,
    titleEn: 'Stardust Return',
    titleFa: 'بازگشت به ستاره‌ها',
    descriptionEn: 'Your physical atoms have fully integrated back into the earth, water, and trees, becoming part of the cosmic canvas.',
    descriptionFa: 'اتم‌های فیزیکی بدن شما به طور کامل با خاک، آب و درختان ادغام شده و بخشی از هماهنگی کل کیهان شده‌اند.',
    icon: '✨'
  }
];

interface JournalTabProps {
  activeTab: 'journal' | 'milestones' | 'legacy';
  setActiveTab: (tab: 'journal' | 'milestones' | 'legacy') => void;
  activeProfileId: string;
  journal: Record<string, JournalEntry>;
  customMilestones: Record<string, Milestone[]>;
  newMilestoneAge: number;
  setNewMilestoneAge: (age: number) => void;
  newMilestoneTitle: string;
  setNewMilestoneTitle: (title: string) => void;
  newMilestoneDesc: string;
  setNewMilestoneDesc: (desc: string) => void;
  newMilestoneCat: Milestone['category'];
  setNewMilestoneCat: (cat: Milestone['category']) => void;
  onAddMilestone: (e: React.FormEvent) => void;
  onDeleteMilestone: (id: string) => void;
  onAddLegacyEvent: (yearsAfter: number, title: string, desc: string) => void;
  setViewMode: (mode: ViewMode) => void;
  onOpenNoteDrawer: (idx: number) => void;
  language: string;
  t: any;
}

export function JournalTab({
  activeTab,
  setActiveTab,
  activeProfileId,
  journal,
  customMilestones,
  newMilestoneAge,
  setNewMilestoneAge,
  newMilestoneTitle,
  setNewMilestoneTitle,
  newMilestoneDesc,
  setNewMilestoneDesc,
  newMilestoneCat,
  setNewMilestoneCat,
  onAddMilestone,
  onDeleteMilestone,
  onAddLegacyEvent,
  setViewMode,
  onOpenNoteDrawer,
  language,
  t
}: JournalTabProps) {
  const [legacyYears, setLegacyYears] = useState<number>(5);
  const [legacyTitle, setLegacyTitle] = useState('');
  const [legacyDesc, setLegacyDesc] = useState('');

  const handleLegacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legacyTitle.trim()) return;
    onAddLegacyEvent(legacyYears, legacyTitle, legacyDesc);
    setLegacyTitle('');
    setLegacyDesc('');
  };

  return (
    <div className="glass-panel" style={{ flexGrow: 1, minHeight: '220px' }}>
      <div className="segmented-control" style={{ width: '100%', marginBottom: '10px' }}>
        <button 
          className={`segmented-control-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
          style={{ flex: 1 }}
        >
          {t.customMilestones}
        </button>
        <button 
          className={`segmented-control-btn ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
          style={{ flex: 1 }}
        >
          {t.writeJournal}
        </button>
        <button 
          className={`segmented-control-btn ${activeTab === 'legacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('legacy')}
          style={{ flex: 1 }}
        >
          {t.legacyTab}
        </button>
      </div>

      {activeTab === 'milestones' ? (
        // Goals/Milestones Tab (Now Rendered First!)
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Create custom milestones */}
          <form onSubmit={onAddMilestone} className="drawer-body" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>{t.milestoneAge}</label>
                <input 
                  type="number" 
                  value={newMilestoneAge} 
                  onChange={e => setNewMilestoneAge(Number(e.target.value))} 
                  min={1} 
                  max={120} 
                />
              </div>
              <div className="form-group">
                <label>{t.milestoneTitle}</label>
                <input 
                  type="text" 
                  value={newMilestoneTitle} 
                  onChange={e => setNewMilestoneTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Write a book"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t.milestoneDesc}</label>
                <input 
                  type="text" 
                  value={newMilestoneDesc} 
                  onChange={e => setNewMilestoneDesc(e.target.value)} 
                  placeholder="Short description..." 
                />
              </div>
              <div className="form-group">
                <label>{t.gender}</label>
                <select 
                  value={newMilestoneCat} 
                  onChange={e => setNewMilestoneCat(e.target.value as Milestone['category'])}
                >
                  <option value="general">{t.milestoneCat.general}</option>
                  <option value="milestone">{t.milestoneCat.milestone}</option>
                  <option value="growth">{t.milestoneCat.growth}</option>
                  <option value="health">{t.milestoneCat.health}</option>
                  <option value="career">{t.milestoneCat.career}</option>
                  <option value="relationship">{t.milestoneCat.relationship}</option>
                  <option value="travel">{t.milestoneCat.travel}</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={14} />
              <span>{t.addMilestone}</span>
            </button>
          </form>

          {/* List custom milestones */}
          <div className="journal-list">
            {(customMilestones[activeProfileId] || []).filter(m => !m.isLegacy).map(m => (
              <div key={m.id} className="journal-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                    {language === 'fa' ? m.titleFa : m.titleEn} <span className="badge" style={{ [language === 'fa' ? 'marginRight' : 'marginLeft']: '6px' }}>{t.ageLabel} {m.age}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>{language === 'fa' ? m.descriptionFa : m.descriptionEn}</p>
                </div>
                <button 
                  className="btn btn-icon-only" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMilestone(m.id);
                  }}
                  style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Memories / Journal Tab (Now Rendered Second!)
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.journalInstructions}</p>
          
          <div className="journal-list">
            {Object.keys(journal).filter(key => key.startsWith(activeProfileId + '-')).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
                <BookOpen size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                <span>{t.noEntries}</span>
              </div>
            ) : (
              Object.keys(journal)
                .filter(key => key.startsWith(activeProfileId + '-'))
                .map(key => {
                  const entry = journal[key];
                  const parts = key.split('-');
                  const mode = parts[parts.length - 2];
                  const idx = Number(parts[parts.length - 1]);
                  
                  return (
                    <div 
                      key={key} 
                      className="journal-item"
                      onClick={() => {
                        setViewMode(mode as ViewMode);
                        setTimeout(() => onOpenNoteDrawer(idx), 50);
                      }}
                    >
                      <div className="journal-item-header">
                        <span>{mode.toUpperCase()} {idx + 1}</span>
                        <span className="badge">{t.milestoneCat[entry.category]}</span>
                      </div>
                      <div className="journal-item-title">{entry.title}</div>
                      <p className="journal-item-content">{entry.content}</p>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {activeTab === 'legacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '6px' }}>{t.legacyIntro}</p>

          {/* Add custom legacy event form */}
          <form onSubmit={handleLegacySubmit} className="drawer-body" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>{t.legacyYearsPost}</label>
                <input 
                  type="number" 
                  value={legacyYears} 
                  onChange={e => setLegacyYears(Number(e.target.value))} 
                  min={1} 
                  max={1000} 
                />
              </div>
              <div className="form-group">
                <label>{t.milestoneTitle}</label>
                <input 
                  type="text" 
                  value={legacyTitle} 
                  onChange={e => setLegacyTitle(e.target.value)} 
                  required 
                  placeholder={language === 'fa' ? 'مثلاً: تولد ۱۰۰ سالگی فرزندم' : 'e.g. My child turns 100'}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>{t.milestoneDesc}</label>
              <input 
                type="text" 
                value={legacyDesc} 
                onChange={e => setLegacyDesc(e.target.value)} 
                placeholder={language === 'fa' ? 'توضیحات کوتاه...' : 'Short description...'} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>{t.addLegacyEvent}</span>
            </button>
          </form>

          {/* List combined sorted legacy events */}
          <div className="journal-list">
            {(() => {
              const customLegacy = (customMilestones[activeProfileId] || []).filter(m => m.isLegacy);
              const combined = [
                ...DEFAULT_LEGACY_EVENTS.map(e => ({
                  id: e.id,
                  yearsAfter: e.yearsAfter,
                  title: language === 'fa' ? e.titleFa : e.titleEn,
                  desc: language === 'fa' ? e.descriptionFa : e.descriptionEn,
                  icon: e.icon,
                  isCustom: false
                })),
                ...customLegacy.map(m => ({
                  id: m.id,
                  yearsAfter: m.yearsAfter || 0,
                  title: language === 'fa' ? m.titleFa : m.titleEn,
                  desc: language === 'fa' ? m.descriptionFa : m.descriptionEn,
                  icon: '🌌',
                  isCustom: true
                }))
              ].sort((a, b) => a.yearsAfter - b.yearsAfter);

              return combined.map(e => (
                <div key={e.id} className="journal-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: e.isCustom ? '1px dashed var(--accent)' : undefined }}>
                  <div style={{ flexGrow: 1, paddingRight: language === 'fa' ? undefined : '12px', paddingLeft: language === 'fa' ? '12px' : undefined }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{e.icon} {e.title}</span>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>
                        {e.yearsAfter} {t.years} {settingsPropsWorkaround(t.remaining)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.9 }}>{e.desc}</p>
                  </div>
                  {e.isCustom && (
                    <button 
                      className="btn btn-icon-only" 
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDeleteMilestone(e.id);
                      }}
                      style={{ color: '#ef4444', borderColor: '#fee2e2', flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Workaround for scope and parameters
function settingsPropsWorkaround(val: string) {
  return val;
}
