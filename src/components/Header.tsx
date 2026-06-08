import { useState } from 'react';
import { Globe, Sun, Moon, Volume2, VolumeX, Music, Settings, User, Edit2, BookOpen, PanelLeft, Download, Menu, X } from 'lucide-react';
import type { Settings as SettingsType, Profile } from '../types';

interface HeaderProps {
  settings: SettingsType;
  activeProfile: Profile | null;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
  onSoundVolumeChange?: (vol: number) => void;
  onToggleAmbient: () => void;
  onOpenSettings: () => void;
  onOpenProfilePicker: () => void;
  onEditProfile: () => void;
  onGoHome: () => void;
  onInstall?: () => void;
  showInstallBtn?: boolean;
  isLeftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  t: any;
}

export function Header({
  settings,
  activeProfile,
  onToggleLanguage,
  onToggleDarkMode,
  onToggleSound,
  onSoundVolumeChange,
  onToggleAmbient,
  onOpenSettings,
  onOpenProfilePicker,
  onEditProfile,
  onGoHome,
  onInstall,
  showInstallBtn,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  t
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="app-header glass-panel">
        <div 
          className="brand-section" 
          onClick={activeProfile ? onGoHome : undefined} 
          style={{ cursor: activeProfile ? 'pointer' : 'default' }}
        >
          <button 
            className="btn btn-icon-only mobile-hamburger-btn"
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }}
            title={settings.language === 'fa' ? 'منو' : 'Menu'}
          >
            <Menu size={20} />
          </button>
          <h1 className="brand-title">{t.title}</h1>
          <p className="brand-subtitle">{t.subtitle}</p>
        </div>

        {/* Desktop header controls */}
        <div className="header-controls desktop-controls">
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

          {/* Ticking Clock Sound Toggle with Volume Slider */}
          <div className="sound-btn-wrapper">
            <button 
              className={`btn btn-icon-only ${settings.soundEnabled ? 'btn-primary' : ''}`}
              onClick={onToggleSound}
              title={t.soundEffects}
            >
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <div className="sound-volume-popup">
              <button 
                className="vol-btn"
                onClick={() => onSoundVolumeChange?.(Math.max(0, (settings.soundVolume ?? 0.5) - 0.1))}
                title={settings.language === 'fa' ? 'کاهش صدا' : 'Lower volume'}
              >
                -
              </button>
              <div className="vol-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={settings.soundVolume ?? 0.5}
                  onChange={e => onSoundVolumeChange?.(parseFloat(e.target.value))}
                  className="vol-slider"
                />
              </div>
              <button 
                className="vol-btn"
                onClick={() => onSoundVolumeChange?.(Math.min(1, (settings.soundVolume ?? 0.5) + 0.1))}
                title={settings.language === 'fa' ? 'افزایش صدا' : 'Higher volume'}
              >
                +
              </button>
              <span className="vol-percent">
                {Math.round((settings.soundVolume ?? 0.5) * 100)}%
              </span>
            </div>
          </div>

          {/* Ambient Meditation Music Toggle with Volume Slider */}
          <div className="sound-btn-wrapper">
            <button 
              className={`btn btn-icon-only ${settings.ambientEnabled ? 'btn-primary' : ''}`}
              onClick={onToggleAmbient}
              title={t.ambientMusic}
            >
              <Music size={18} />
            </button>
            <div className="sound-volume-popup">
              <button 
                className="vol-btn"
                onClick={() => onSoundVolumeChange?.(Math.max(0, (settings.soundVolume ?? 0.5) - 0.1))}
                title={settings.language === 'fa' ? 'کاهش صدا' : 'Lower volume'}
              >
                -
              </button>
              <div className="vol-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={settings.soundVolume ?? 0.5}
                  onChange={e => onSoundVolumeChange?.(parseFloat(e.target.value))}
                  className="vol-slider"
                />
              </div>
              <button 
                className="vol-btn"
                onClick={() => onSoundVolumeChange?.(Math.min(1, (settings.soundVolume ?? 0.5) + 0.1))}
                title={settings.language === 'fa' ? 'افزایش صدا' : 'Higher volume'}
              >
                +
              </button>
              <span className="vol-percent">
                {Math.round((settings.soundVolume ?? 0.5) * 100)}%
              </span>
            </div>
          </div>

          {/* Install App PWA Trigger */}
          {showInstallBtn && onInstall && (
            <button 
              className="btn btn-primary" 
              onClick={onInstall}
              title={t.installApp}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={18} />
              <span>{t.installApp}</span>
            </button>
          )}

          {/* Settings Trigger */}
          <button 
            className="btn btn-icon-only" 
            onClick={onOpenSettings}
            title={t.settings}
          >
            <Settings size={18} />
          </button>

          {/* Left Sidebar (Stats) Toggle */}
          {activeProfile && onToggleLeftSidebar && (
            <button 
              className={`btn btn-icon-only ${isLeftSidebarOpen ? 'active' : ''}`}
              onClick={onToggleLeftSidebar}
              title={isLeftSidebarOpen ? (settings.language === 'fa' ? 'بستن آمار و جزئیات' : 'Hide Stats & Details') : (settings.language === 'fa' ? 'نمایش آمار و جزئیات' : 'Show Stats & Details')}
            >
              <PanelLeft size={18} />
            </button>
          )}

          {/* Goals & Journal Sidebar Toggle */}
          {activeProfile && onToggleRightSidebar && (
            <button 
              className={`btn btn-icon-only ${isRightSidebarOpen ? 'active' : ''}`}
              onClick={onToggleRightSidebar}
              title={isRightSidebarOpen ? (settings.language === 'fa' ? 'بستن اهداف و دفترچه' : 'Hide Goals & Journal') : (settings.language === 'fa' ? 'نمایش اهداف و دفترچه' : 'Show Goals & Journal')}
            >
              <BookOpen size={18} />
            </button>
          )}

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

      {/* Mobile slide-down menu - OUTSIDE header to avoid stacking context issue */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu-dropdown">
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">{settings.language === 'fa' ? 'منو' : 'Menu'}</span>
              <button 
                className="btn btn-icon-only"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-h)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Language Toggle */}
            <button className="mobile-menu-item" onClick={() => { onToggleLanguage(); setIsMobileMenuOpen(false); }}>
              <Globe size={18} />
              <span>{settings.language === 'en' ? 'فارسی' : 'English'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button className="mobile-menu-item" onClick={() => { onToggleDarkMode(); setIsMobileMenuOpen(false); }}>
              {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{settings.darkMode ? t.lightMode || "Light Mode" : t.darkMode}</span>
            </button>

            {/* Sound Toggle */}
            <button 
              className={`mobile-menu-item ${settings.soundEnabled ? 'active' : ''}`}
              onClick={() => { onToggleSound(); setIsMobileMenuOpen(false); }}
            >
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{t.soundEffects}</span>
            </button>

            {/* Ambient Music Toggle */}
            <button 
              className={`mobile-menu-item ${settings.ambientEnabled ? 'active' : ''}`}
              onClick={() => { onToggleAmbient(); setIsMobileMenuOpen(false); }}
            >
              <Music size={18} />
              <span>{t.ambientMusic}</span>
            </button>

            {/* Install App */}
            {showInstallBtn && onInstall && (
              <button className="mobile-menu-item" onClick={() => { onInstall(); setIsMobileMenuOpen(false); }}>
                <Download size={18} />
                <span>{t.installApp}</span>
              </button>
            )}

            {/* Settings */}
            <button className="mobile-menu-item" onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }}>
              <Settings size={18} />
              <span>{t.settings}</span>
            </button>

            {/* Separator */}
            {activeProfile && <div className="mobile-menu-separator" />}

            {/* Profile-specific items */}
            {activeProfile && (
              <>
                <button className="mobile-menu-item" onClick={() => { onToggleLeftSidebar?.(); setIsMobileMenuOpen(false); }}>
                  <PanelLeft size={18} />
                  <span>{isLeftSidebarOpen ? (settings.language === 'fa' ? 'بستن آمار و جزئیات' : 'Hide Stats & Details') : (settings.language === 'fa' ? 'نمایش آمار و جزئیات' : 'Show Stats & Details')}</span>
                </button>

                <button className="mobile-menu-item" onClick={() => { onToggleRightSidebar?.(); setIsMobileMenuOpen(false); }}>
                  <BookOpen size={18} />
                  <span>{isRightSidebarOpen ? (settings.language === 'fa' ? 'بستن اهداف و دفترچه' : 'Hide Goals & Journal') : (settings.language === 'fa' ? 'نمایش اهداف و دفترچه' : 'Show Goals & Journal')}</span>
                </button>

                <button className="mobile-menu-item" onClick={() => { onOpenProfilePicker(); setIsMobileMenuOpen(false); }}>
                  <User size={18} />
                  <span>{activeProfile.name}</span>
                </button>

                <button className="mobile-menu-item" onClick={() => { onEditProfile(); setIsMobileMenuOpen(false); }}>
                  <Edit2 size={16} />
                  <span>{t.editProfile || 'Edit Profile'}</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

