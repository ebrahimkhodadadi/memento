import { X, Plus, Trash2 } from 'lucide-react';
import type { ViewMode, JournalEntry, Milestone, Settings } from '../types';

interface NoteDrawerProps {
  selectedUnitIndex: number;
  viewMode: ViewMode;
  noteTitle: string;
  setNoteTitle: (val: string) => void;
  noteContent: string;
  setNoteContent: (val: string) => void;
  noteCat: JournalEntry['category'];
  setNoteCat: (cat: JournalEntry['category']) => void;
  onSaveNote: () => void;
  onDeleteNote: () => void;
  onClose: () => void;
  getUnitDateRange: (idx: number) => string;
  getUnitMilestones: (idx: number) => Milestone[];
  journal: Record<string, JournalEntry>;
  getUnitNoteKey: (idx: number) => string;
  settings: Settings;
  t: any;
}

export function NoteDrawer({
  selectedUnitIndex,
  viewMode,
  noteTitle,
  setNoteTitle,
  noteContent,
  setNoteContent,
  noteCat,
  setNoteCat,
  onSaveNote,
  onDeleteNote,
  onClose,
  getUnitDateRange,
  getUnitMilestones,
  journal,
  getUnitNoteKey,
  settings,
  t
}: NoteDrawerProps) {
  const noteKey = getUnitNoteKey(selectedUnitIndex);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">
            {viewMode === 'weeks' ? t.weekLabel : viewMode === 'months' ? t.monthLabel : t.yearLabel} {selectedUnitIndex + 1}
          </h3>
          <button className="btn btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div style={{ fontSize: '0.8rem', opacity: 0.9, background: 'var(--accent-bg)', padding: '10px', borderRadius: '8px' }}>
            <div><strong>{t.dateLabel}:</strong> {getUnitDateRange(selectedUnitIndex)}</div>
            <div><strong>{t.ageLabel}:</strong> {((viewMode === 'weeks' ? selectedUnitIndex / 52 : viewMode === 'months' ? selectedUnitIndex / 12 : selectedUnitIndex)).toFixed(1)} {t.years}</div>
          </div>

          {/* Display milestones falling in this week */}
          {getUnitMilestones(selectedUnitIndex).map(m => (
            <div key={m.id} style={{ border: '1px solid var(--border)', background: 'var(--card-bg)', padding: '8px', borderRadius: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem' }}>{m.icon}</span>
              <div>
                <strong style={{ color: 'var(--text-h)', fontSize: '0.85rem' }}>{settings.language === 'fa' ? m.titleFa : m.titleEn}</strong>
                <div style={{ fontSize: '0.7rem' }}>{settings.language === 'fa' ? m.descriptionFa : m.descriptionEn}</div>
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>{t.milestoneTitle}</label>
            <input 
              type="text" 
              value={noteTitle} 
              onChange={e => setNoteTitle(e.target.value)} 
              placeholder={t.titlePlaceholder} 
            />
          </div>

          <div className="form-group">
            <label>{t.gender}</label>
            <select 
              value={noteCat} 
              onChange={e => setNoteCat(e.target.value as JournalEntry['category'])}
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ margin: 0 }}>{t.writeJournal}</label>
              <button
                type="button"
                className="badge"
                onClick={() => {
                  const prompts = settings.language === 'fa' ? [
                    "چه چیزی در حال حاضر در کنترل من است و چه چیزی خارج از کنترل من؟",
                    "اگر امروز آخرین روز زندگی من بود، این دوره را چگونه سپری می‌کردم؟",
                    "با چه مانعی روبرو شدم و چطور می‌توانم آن را به عنوان یک فرصت ببینم؟",
                    "آیا خشم یا حسرت را در خود نگه داشته‌ام؟ فایده آن برای من چیست؟",
                    "چه کاری را خوب انجام دادم، چه کاری را بد، و چگونه می‌توانم بهتر شوم؟",
                    "چگونه می‌توانم برای این لحظه خاص از زندگی‌ام شکرگزار باشم؟"
                  ] : [
                    "What is in my control right now? What is outside my control?",
                    "If today were my last day, how would I spend this period?",
                    "What obstacle did I face, and how can I see it as an opportunity?",
                    "Am I holding onto anger or regret? What is the utility of it?",
                    "What did I do well, what did I do poorly, and how can I improve?",
                    "How can I practice gratitude for this specific moment in my life?"
                  ];
                  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
                  setNoteContent(noteContent ? `${noteContent}\n\n[${randomPrompt}]` : `[${randomPrompt}]`);
                }}
                style={{ border: '1px solid var(--accent)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', padding: '2px 6px' }}
              >
                💡 {settings.language === 'fa' ? 'درج سوال فلسفی (رواق‌گرایی)' : 'Insert Stoic Prompt'}
              </button>
            </div>
            <textarea 
              value={noteContent} 
              onChange={e => setNoteContent(e.target.value)} 
              placeholder={t.contentPlaceholder}
              rows={6}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-primary" onClick={onSaveNote} style={{ flex: 1 }}>
              <Plus size={14} />
              <span>{t.saveEntry}</span>
            </button>
            {journal[noteKey] && (
              <button className="btn" onClick={onDeleteNote} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                <Trash2 size={14} />
                <span>{t.deleteEntry}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
