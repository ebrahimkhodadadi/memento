import { X, Edit2, Trash2, PlusCircle } from 'lucide-react';
import type { Profile } from '../types';

interface ProfilesModalProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onEditProfile: (p: Profile) => void;
  onDeleteProfile: (id: string) => void;
  onAddProfile: () => void;
  onClose: () => void;
  t: any;
}

export function ProfilesModal({
  profiles,
  activeProfileId,
  onSelectProfile,
  onEditProfile,
  onDeleteProfile,
  onAddProfile,
  onClose,
  t
}: ProfilesModalProps) {
  // Helper to calculate age and expectation data for comparing profiles side-by-side
  const getProfileLivedPercent = (p: Profile) => {
    const birthDate = new Date(p.birthDate + 'T' + (p.birthTime || '12:00'));
    let adjustedLifespan = p.expectedLifespan;
    if (p.lifestyle.smoking) adjustedLifespan -= 10;
    if (p.lifestyle.exercise) adjustedLifespan += 5;
    if (p.lifestyle.diet) adjustedLifespan += 4;
    if (p.lifestyle.stress) adjustedLifespan -= 3;
    adjustedLifespan = Math.max(10, adjustedLifespan);

    const deathDate = new Date(birthDate);
    deathDate.setFullYear(birthDate.getFullYear() + adjustedLifespan);

    const now = new Date().getTime();
    const lifeLivedMs = now - birthDate.getTime();
    const totalExpectedMs = deathDate.getTime() - birthDate.getTime();

    const livedPercent = Math.min(100, Math.max(0, (lifeLivedMs / totalExpectedMs) * 100));
    
    // Calculate current age
    let age = new Date().getFullYear() - birthDate.getFullYear();
    const mDiff = new Date().getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && new Date().getDate() < birthDate.getDate())) {
      age--;
    }
    
    return { livedPercent, adjustedLifespan, age: Math.max(0, age) };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">{t.profiles}</h3>
          <button className="btn btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="profile-list" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '2px' }}>
          {profiles.map(p => {
            const { livedPercent, adjustedLifespan, age } = getProfileLivedPercent(p);
            
            return (
              <div 
                key={p.id} 
                className={`profile-item ${p.id === activeProfileId ? 'active' : ''}`}
                onClick={() => {
                  onSelectProfile(p.id);
                  onClose();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch', padding: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</span>
                  
                  <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                    <button 
                      className="btn btn-icon-only" 
                      onClick={() => onEditProfile(p)}
                      title={t.editProfile}
                      style={{ padding: '4px' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      className="btn btn-icon-only" 
                      onClick={() => onDeleteProfile(p.id)}
                      style={{ color: '#ef4444', padding: '4px' }}
                      title={t.deleteProfile}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Miniature Progress Comparison Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85 }}>
                    <span>{t.lived}: {age} {t.years}</span>
                    <span>{t.totalExpected}: {adjustedLifespan} {t.years}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--unit-empty)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: `${livedPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>
                    {livedPercent.toFixed(1)}% {t.lived}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={onAddProfile} style={{ marginTop: '6px' }}>
          <PlusCircle size={16} />
          <span>{t.addProfile}</span>
        </button>
      </div>
    </div>
  );
}
