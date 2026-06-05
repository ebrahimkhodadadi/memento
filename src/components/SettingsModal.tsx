import { X } from 'lucide-react';
import type { Settings, ThemeName } from '../types';

interface SettingsModalProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onClose: () => void;
  t: any;
}

export function SettingsModal({
  settings,
  setSettings,
  onClose,
  t
}: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">{t.settings}</h3>
          <button className="btn btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Theme Selector */}
          <div className="form-group">
            <label>{t.themes}</label>
            <select 
              value={settings.theme} 
              onChange={e => setSettings(prev => ({ ...prev, theme: e.target.value as ThemeName }))}
            >
              <option value="zen">{t.colorThemes.zen}</option>
              <option value="cosmic">{t.colorThemes.cosmic}</option>
              <option value="vintage">{t.colorThemes.vintage}</option>
              <option value="minimal">{t.colorThemes.minimal}</option>
              <option value="aura">{t.colorThemes.aura}</option>
            </select>
          </div>

          {/* Dark Mode toggle checkbox */}
          <div className="form-group">
            <label>{t.darkMode}</label>
            <div 
              className={`lifestyle-card ${settings.darkMode ? 'active' : ''}`}
              onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            >
              <input type="checkbox" checked={settings.darkMode} readOnly />
              <span>{t.darkMode}</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="form-group">
            <label>{t.soundEffects}</label>
            <div 
              className={`lifestyle-card ${settings.soundEnabled ? 'active' : ''}`}
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            >
              <input type="checkbox" checked={settings.soundEnabled} readOnly />
              <span>{t.soundEffects}</span>
            </div>
          </div>

          <div className="form-group">
            <label>{t.ambientMusic}</label>
            <div 
              className={`lifestyle-card ${settings.ambientEnabled ? 'active' : ''}`}
              onClick={() => setSettings(prev => ({ ...prev, ambientEnabled: !prev.ambientEnabled }))}
            >
              <input type="checkbox" checked={settings.ambientEnabled} readOnly />
              <span>{t.ambientMusic}</span>
            </div>
          </div>

          <div className="form-group">
            <label>{t.uncensoredMode}</label>
            <div 
              className={`lifestyle-card ${settings.uncensoredMode ? 'active' : ''}`}
              onClick={() => setSettings(prev => ({ ...prev, uncensoredMode: !prev.uncensoredMode }))}
            >
              <input type="checkbox" checked={settings.uncensoredMode} readOnly />
              <span>{t.uncensoredMode}</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{t.uncensoredDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
