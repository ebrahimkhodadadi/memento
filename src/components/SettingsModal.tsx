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

          <div className="form-group">
            <label>{t.webNotifications}</label>
            <div 
              className={`lifestyle-card ${settings.notificationsEnabled ? 'active' : ''}`}
              onClick={async () => {
                const newValue = !settings.notificationsEnabled;
                if (newValue && 'Notification' in window) {
                  const permission = await Notification.requestPermission();
                  if (permission !== 'granted') {
                    alert(settings.language === 'fa' 
                      ? 'اجازه اعلانات داده نشد. لطفاً دسترسی را از تنظیمات مرورگر خود فعال کنید.' 
                      : 'Notification permission denied. Please enable permission in your browser settings.');
                    return;
                  }
                }
                setSettings(prev => ({ ...prev, notificationsEnabled: newValue }));
              }}
            >
              <input type="checkbox" checked={!!settings.notificationsEnabled} readOnly />
              <span>{t.webNotifications}</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{t.webNotificationsDesc}</p>
          </div>

          {/* Backup & Restore Data (Import/Export JSON) */}
          <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
            <label>{settings.language === 'fa' ? 'پشتیبان‌گیری و بازیابی داده‌ها' : 'Backup & Restore Data'}</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  const data = {
                    settings: localStorage.getItem('memento_settings'),
                    profiles: localStorage.getItem('memento_profiles'),
                    activeProfileId: localStorage.getItem('memento_active_profile_id'),
                    journal: localStorage.getItem('memento_journal'),
                    customMilestones: localStorage.getItem('memento_custom_milestones')
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `memento_mori_backup_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }} 
                style={{ flex: 1 }}
              >
                💾 {settings.language === 'fa' ? 'خروجی بکاپ' : 'Export Backup'}
              </button>
              
              <label className="btn" style={{ flex: 1, cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                📁 {settings.language === 'fa' ? 'وارد کردن بکاپ' : 'Import Backup'}
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.profiles || data.journal || data.settings) {
                          if (data.settings) localStorage.setItem('memento_settings', data.settings);
                          if (data.profiles) localStorage.setItem('memento_profiles', data.profiles);
                          if (data.activeProfileId) localStorage.setItem('memento_active_profile_id', data.activeProfileId);
                          if (data.journal) localStorage.setItem('memento_journal', data.journal);
                          if (data.customMilestones) localStorage.setItem('memento_custom_milestones', data.customMilestones);

                          alert(settings.language === 'fa' 
                            ? 'داده‌ها با موفقیت بازیابی شدند. برنامه مجدداً بارگذاری می‌شود.' 
                            : 'Data restored successfully. Reloading application.');
                          window.location.reload();
                        } else {
                          alert(settings.language === 'fa' ? 'فرمت فایل بکاپ نامعتبر است.' : 'Invalid backup file format.');
                        }
                      } catch (err) {
                        alert(settings.language === 'fa' ? 'خطا در خواندن فایل بکاپ.' : 'Error parsing backup file.');
                      }
                    };
                    reader.readAsText(file);
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '6px', lineHeight: 1.4 }}>
              {settings.language === 'fa' 
                ? 'اطلاعات پروفایل‌ها، یادداشت‌ها و اهداف خود را به صورت یک فایل ذخیره کرده یا بازیابی کنید.'
                : 'Save or restore your profiles, journals, and milestones to/from a local JSON file.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
