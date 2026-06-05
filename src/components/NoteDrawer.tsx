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
            <label>{t.writeJournal}</label>
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
