import { Globe, Sun, Moon, Volume2, VolumeX, Music, Settings, User, Edit2 } from 'lucide-react';
import type { Settings as SettingsType, Profile } from '../types';

interface HeaderProps {
  settings: SettingsType;
  activeProfile: Profile | null;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
  onOpenSettings: () => void;
  onOpenProfilePicker: () => void;
  onEditProfile: () => void;
  onGoHome: () => void;
  t: any;
}

export function Header({
  settings,
  activeProfile,
  onToggleLanguage,
  onToggleDarkMode,
  onToggleSound,
  onToggleAmbient,
  onOpenSettings,
  onOpenProfilePicker,
  onEditProfile,
  onGoHome,
  t
}: HeaderProps) {
  return (
    <header className="app-header glass-panel">
      <div className="brand-section" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <h1 className="brand-title">{t.title}</h1>
        <p className="brand-subtitle">{t.subtitle}</p>
      </div>

      <div className="header-controls">
        {/* Language Toggle */}
        <button 
          className="btn" 
          onClick={onToggleLanguage}
          title={t.languages}
        >
          <Globe size={18} />
          <span>{settings.language === 'en' ? 'فارسی' : 'English'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button 
          className="btn btn-icon-only" 
          onClick={onToggleDarkMode}
          title={settings.darkMode ? "Light Mode" : t.darkMode}
        >
          {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Ticking Clock Sound Toggle */}
        <button 
          className={`btn btn-icon-only ${settings.soundEnabled ? 'btn-primary' : ''}`}
          onClick={onToggleSound}
          title={t.soundEffects}
        >
          {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Ambient Meditation Music Toggle */}
        <button 
          className={`btn btn-icon-only ${settings.ambientEnabled ? 'btn-primary' : ''}`}
          onClick={onToggleAmbient}
          title={t.ambientMusic}
        >
          <Music size={18} />
        </button>

        {/* Settings Trigger */}
        <button 
          className="btn btn-icon-only" 
          onClick={onOpenSettings}
          title={t.settings}
        >
          <Settings size={18} />
        </button>

        {activeProfile && (
          <>
            {/* Profile Picker */}
            <button className="btn" onClick={onOpenProfilePicker}>
              <User size={18} />
              <span>{activeProfile.name}</span>
            </button>

            {/* Edit Profile */}
            <button className="btn" onClick={onEditProfile}>
              <Edit2 size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
