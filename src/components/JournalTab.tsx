import { Plus, Trash2, BookOpen } from 'lucide-react';
import type { ViewMode, JournalEntry, Milestone } from '../types';

interface JournalTabProps {
  activeTab: 'journal' | 'milestones' | 'uncensored';
  setActiveTab: (tab: 'journal' | 'milestones' | 'uncensored') => void;
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
  setViewMode,
  onOpenNoteDrawer,
  language,
  t
}: JournalTabProps) {
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
            {(customMilestones[activeProfileId] || []).map(m => (
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
    </div>
  );
}
