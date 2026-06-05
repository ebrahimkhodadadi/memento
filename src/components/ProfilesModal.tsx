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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">{t.profiles}</h3>
          <button className="btn btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="profile-list">
          {profiles.map(p => (
            <div 
              key={p.id} 
              className={`profile-item ${p.id === activeProfileId ? 'active' : ''}`}
              onClick={() => {
                onSelectProfile(p.id);
                onClose();
              }}
            >
              <span>{p.name}</span>
              
              <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                <button 
                  className="btn btn-icon-only" 
                  onClick={() => onEditProfile(p)}
                  title={t.editProfile}
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  className="btn btn-icon-only" 
                  onClick={() => onDeleteProfile(p.id)}
                  style={{ color: '#ef4444' }}
                  title={t.deleteProfile}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={onAddProfile}>
          <PlusCircle size={16} />
          <span>{t.addProfile}</span>
        </button>
      </div>
    </div>
  );
}
