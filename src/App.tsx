import { useState, useEffect, useMemo } from 'react';
import { BookOpen, X, BarChart2 } from 'lucide-react';
import type { Profile, ViewMode, JournalEntry, Milestone, ThemeName, Settings } from './types';
import { DEFAULT_MILESTONES, PHILOSOPHICAL_QUOTES, TRANSLATIONS } from './constants';
import { soundEngine } from './sound';
import { gregorianToJalali, jalaliToGregorian, formatJalaliVerbose } from './jalali';

import { lazy, Suspense } from 'react';

// Import refactored smaller components
import { Header } from './components/Header';
import { CountdownBanner } from './components/CountdownBanner';
import { Sidebar } from './components/Sidebar';
import { GridVisualizer } from './components/GridVisualizer';
import { JournalTab } from './components/JournalTab';

const ConfigForm = lazy(() => import('./components/ConfigForm').then(m => ({ default: m.ConfigForm })));
const NoteDrawer = lazy(() => import('./components/NoteDrawer').then(m => ({ default: m.NoteDrawer })));
const ProfilesModal = lazy(() => import('./components/ProfilesModal').then(m => ({ default: m.ProfilesModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));

const DEFAULT_SETTINGS: Settings = {
  theme: 'zen',
  language: 'fa',
  soundEnabled: false,
  ambientEnabled: false,
  uncensoredMode: true,
  darkMode: false,
  showCountdownNote: true,
};

function App() {
  // --- LocalStorage State Initialization ---
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('memento_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('memento_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('memento_active_profile_id') || '';
  });

  const [journal, setJournal] = useState<Record<string, JournalEntry>>(() => {
    const saved = localStorage.getItem('memento_journal');
    return saved ? JSON.parse(saved) : {};
  });

  const [customMilestones, setCustomMilestones] = useState<Record<string, Milestone[]>>(() => {
    const saved = localStorage.getItem('memento_custom_milestones');
    return saved ? JSON.parse(saved) : {};
  });

  const [countdownNotes, setCountdownNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('memento_countdown_notes');
    return saved ? JSON.parse(saved) : {};
  });

  // --- Temporary UI State ---
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
  const [activeColumn, setActiveColumn] = useState<'stats' | 'grid' | 'journal'>('grid');
  
  // Modals & Panels Toggles
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  // Default active tab is goals ('milestones') as requested
  const [activeTab, setActiveTab] = useState<'journal' | 'milestones' | 'legacy'>('milestones');
  
  // Custom Milestone Form
  const [newMilestoneAge, setNewMilestoneAge] = useState<number>(30);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneCat, setNewMilestoneCat] = useState<Milestone['category']>('general');

  // Form State for Profile Creation / Edit
  const [formName, setFormName] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('2000-01-01');
  const [formBirthTime, setFormBirthTime] = useState('');
  const [formExpectedLifespan, setFormExpectedLifespan] = useState<number>(80);
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formCountry, setFormCountry] = useState('iran');
  const [formSmoking, setFormSmoking] = useState(false);
  const [formExercise, setFormExercise] = useState(false);
  const [formDiet, setFormDiet] = useState(false);
  const [formStress, setFormStress] = useState(false);
  const [formSleep, setFormSleep] = useState(false);
  const [formAlcohol, setFormAlcohol] = useState(false);
  const [formPollution, setFormPollution] = useState(false);
  const [formGenetics, setFormGenetics] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Jalali Birthdate Selects (Persian Language mode)
  const [jalaliYear, setJalaliYear] = useState<number>(1379);
  const [jalaliMonth, setJalaliMonth] = useState<number>(1);
  const [jalaliDay, setJalaliDay] = useState<number>(1);

  // Note Editing Form inside Drawer
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCat, setNoteCat] = useState<JournalEntry['category']>('general');

  // Real-time ticking trigger
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Current philosophical quote
  const [quoteIndex, setQuoteIndex] = useState(0);

  // PWA deferred install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Hover state for tooltip on grid
  const [hoveredUnitIndex, setHoveredUnitIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const t = TRANSLATIONS[settings.language];

  // --- Save State to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('memento_settings', JSON.stringify(settings));
    // Apply theme, dark mode class, & language to elements
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('lang', settings.language);
    document.documentElement.setAttribute('dir', settings.language === 'fa' ? 'rtl' : 'ltr');
    document.body.className = settings.language === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('dark', settings.darkMode);
    document.title = settings.language === 'fa' 
      ? 'Memento Mori - زندگی‌شمار و شبیه‌ساز طول عمر فلسفی' 
      : 'Memento Mori - Life Visualizer & Countdown';

    // Update PWA theme-color meta tag based on current theme
    const themeColors: Record<string, { light: string; dark: string }> = {
      zen:     { light: '#f5f6f2', dark: '#141a15' },
      cosmic:  { light: '#f0f3ff', dark: '#090b11' },
      vintage: { light: '#fcfbf7', dark: '#181512' },
      minimal: { light: '#ffffff', dark: '#0a0a0a' },
      aura:    { light: '#fbf8f2', dark: '#1c1714' },
    };
    const scheme = themeColors[settings.theme] || themeColors.zen;
    const color = settings.darkMode ? scheme.dark : scheme.light;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('memento_profiles', JSON.stringify(profiles));
    if (profiles.length === 0) {
      setIsConfiguring(true);
    }
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('memento_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('memento_journal', JSON.stringify(journal));
  }, [journal]);

  useEffect(() => {
    localStorage.setItem('memento_custom_milestones', JSON.stringify(customMilestones));
  }, [customMilestones]);

  useEffect(() => {
    localStorage.setItem('memento_countdown_notes', JSON.stringify(countdownNotes));
  }, [countdownNotes]);

  // --- Timer & Sound Effect Sync ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (settings.soundEnabled) {
        soundEngine.playTick();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.soundEnabled]);

  // Sync sound volume to engine on mount and when changed
  useEffect(() => {
    soundEngine.setSoundVolume(settings.soundVolume ?? 0.5);
  }, [settings.soundVolume]);

  // Apply Sound Engine Toggles
  useEffect(() => {
    soundEngine.setTicking(settings.soundEnabled);
  }, [settings.soundEnabled]);

  useEffect(() => {
    soundEngine.setAmbient(settings.ambientEnabled);
  }, [settings.ambientEnabled]);

  // Listen to PWA install availability event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
  };



  // Sync Jalali inputs with Gregorian formBirthDate
  useEffect(() => {
    if (settings.language === 'fa') {
      const [gy, gm, gd] = jalaliToGregorian(jalaliYear, jalaliMonth, jalaliDay);
      const formatted = `${gy}-${gm.toString().padStart(2, '0')}-${gd.toString().padStart(2, '0')}`;
      if (formBirthDate !== formatted) {
        setFormBirthDate(formatted);
      }
    }
  }, [jalaliYear, jalaliMonth, jalaliDay, settings.language]);

  // Sync Gregorian formBirthDate to Jalali when config is opened
  const syncGregorianToJalali = (gregorianDateStr: string) => {
    try {
      const [gy, gm, gd] = gregorianDateStr.split('-').map(Number);
      if (gy && gm && gd) {
        const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
        setJalaliYear(jy);
        setJalaliMonth(jm);
        setJalaliDay(jd);
      }
    } catch (e) {
      console.error("Error syncing Gregorian to Jalali", e);
    }
  };

  // --- Calculations for the Active Profile ---
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || null;
  }, [profiles, activeProfileId]);

  // Life Calculations
  const calculations = useMemo(() => {
    if (!activeProfile) return null;

    const birthDate = new Date(activeProfile.birthDate + 'T' + (activeProfile.birthTime || '12:00') + ':00Z');
    
    // Virtual expected lifespan adjusted by lifestyle
    let adjustedLifespan = activeProfile.expectedLifespan;
    if (activeProfile.lifestyle.smoking) adjustedLifespan -= 10;
    if (activeProfile.lifestyle.exercise) adjustedLifespan += 5;
    if (activeProfile.lifestyle.diet) adjustedLifespan += 4;
    if (activeProfile.lifestyle.stress) adjustedLifespan -= 3;
    if (activeProfile.lifestyle.sleep) adjustedLifespan += 3;
    if (activeProfile.lifestyle.alcohol) adjustedLifespan -= 5;
    if (activeProfile.lifestyle.pollution) adjustedLifespan -= 2;
    if (activeProfile.lifestyle.genetics) adjustedLifespan += 4;
    adjustedLifespan = Math.max(10, adjustedLifespan); // floor at 10 years

    const deathDate = new Date(birthDate);
    deathDate.setUTCFullYear(birthDate.getUTCFullYear() + adjustedLifespan);

    const lifeLivedMs = currentTime.getTime() - birthDate.getTime();
    const totalExpectedMs = deathDate.getTime() - birthDate.getTime();
    const remainingMs = Math.max(0, deathDate.getTime() - currentTime.getTime());

    const livedPercent = Math.min(100, Math.max(0, (lifeLivedMs / totalExpectedMs) * 100));
    
    // Precise age in UTC to prevent timezone offsets shifting values on travel
    let years = currentTime.getUTCFullYear() - birthDate.getUTCFullYear();
    let months = currentTime.getUTCMonth() - birthDate.getUTCMonth();
    let days = currentTime.getUTCDate() - birthDate.getUTCDate();
    let hours = currentTime.getUTCHours() - birthDate.getUTCHours();
    let minutes = currentTime.getUTCMinutes() - birthDate.getUTCMinutes();
    let seconds = currentTime.getUTCSeconds() - birthDate.getUTCSeconds();

    if (seconds < 0) { minutes--; seconds += 60; }
    if (minutes < 0) { hours--; minutes += 60; }
    if (hours < 0) { days--; hours += 24; }
    if (days < 0) {
      months--;
      const prevMonth = new Date(Date.UTC(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), 0));
      days += prevMonth.getUTCDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Exact counters
    const totalDaysLived = Math.floor(lifeLivedMs / (1000 * 60 * 60 * 24));
    const totalWeeksLived = Math.floor(lifeLivedMs / (1000 * 60 * 60 * 24 * 7));
    const totalMonthsLived = Math.floor(lifeLivedMs / (1000 * 60 * 60 * 24 * 30.4375));
    const totalHoursLived = Math.floor(lifeLivedMs / (1000 * 60 * 60));

    const totalDaysLeft = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const totalWeeksLeft = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 7));
    const totalMonthsLeft = Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.4375));

    // Countdown remaining components — cascading from remainingMs
    const msPerSecond = 1000;
    const msPerMinute = msPerSecond * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30.4375;
    const msPerYear = msPerDay * 365.25;

    let remMs = remainingMs;
    const remYears = Math.floor(remMs / msPerYear);
    remMs -= remYears * msPerYear;
    const remMonths = Math.floor(remMs / msPerMonth);
    remMs -= remMonths * msPerMonth;
    const remDays = Math.floor(remMs / msPerDay);
    remMs -= remDays * msPerDay;
    const remHours = Math.floor(remMs / msPerHour);
    remMs -= remHours * msPerHour;
    const remMinutes = Math.floor(remMs / msPerMinute);
    remMs -= remMinutes * msPerMinute;
    const remSeconds = Math.floor(remMs / msPerSecond);

    return {
      birthDate,
      deathDate,
      adjustedLifespan,
      livedPercent,
      age: { years, months, days, hours, minutes, seconds },
      stats: {
        lived: { days: totalDaysLived, weeks: totalWeeksLived, months: totalMonthsLived, hours: totalHoursLived },
        remaining: { days: totalDaysLeft, weeks: totalWeeksLeft, months: totalMonthsLeft },
      },
      countdown: { years: remYears, months: remMonths, days: remDays, hours: remHours, minutes: remMinutes, seconds: remSeconds }
    };
  }, [activeProfile, currentTime]);

  // --- Check and trigger new week notification ---
  useEffect(() => {
    if (!settings.notificationsEnabled || !activeProfile || !calculations) return;
    
    // Only run in client environment when Notification is supported
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const currentWeekLived = Math.floor(calculations.stats.lived.weeks);
    const lastNotifiedWeekStr = localStorage.getItem(`memento_notified_week_${activeProfile.id}`);
    const lastNotifiedWeek = lastNotifiedWeekStr ? parseInt(lastNotifiedWeekStr, 10) : -1;

    if (lastNotifiedWeekStr === null) {
      // First initialization of this profile, mark current week as notified to avoid instant trigger
      localStorage.setItem(`memento_notified_week_${activeProfile.id}`, currentWeekLived.toString());
      return;
    }

    if (currentWeekLived > lastNotifiedWeek) {
      const bodyText = t.notificationBody.replace('{livedPercent}', calculations.livedPercent.toFixed(2));
      try {
        new Notification(t.notificationTitle, {
          body: bodyText,
          icon: '/favicon.svg',
          tag: 'memento-mori-new-week',
          requireInteraction: false
        });
        localStorage.setItem(`memento_notified_week_${activeProfile.id}`, currentWeekLived.toString());
      } catch (err) {
        console.error("Failed to show browser notification: ", err);
      }
    }
  }, [settings.notificationsEnabled, activeProfile, calculations, t]);

  // Grid units count based on view mode
  const gridData = useMemo(() => {
    if (!activeProfile || !calculations) return null;
    
    let totalUnits = 0;
    let currentUnitIndex = 0;
    
    const yearsLived = calculations.stats.lived.days / 365.25;

    if (viewMode === 'weeks') {
      totalUnits = calculations.adjustedLifespan * 52;
      currentUnitIndex = Math.floor(calculations.stats.lived.weeks);
    } else if (viewMode === 'months') {
      totalUnits = calculations.adjustedLifespan * 12;
      currentUnitIndex = Math.floor(calculations.stats.lived.months);
    } else {
      totalUnits = calculations.adjustedLifespan;
      currentUnitIndex = Math.floor(yearsLived);
    }

    return { totalUnits, currentUnitIndex };
  }, [activeProfile, calculations, viewMode]);

  // Combine default and custom milestones for active profile
  const activeMilestones = useMemo(() => {
    if (!activeProfileId) return [];
    const custom = customMilestones[activeProfileId] || [];
    return [...DEFAULT_MILESTONES, ...custom];
  }, [activeProfileId, customMilestones]);

  const notesLookup = useMemo(() => {
    const set = new Set<number>();
    if (!activeProfileId) return set;
    
    const prefix = `${activeProfileId}-${viewMode}-`;
    Object.keys(journal).forEach(key => {
      if (key.startsWith(prefix)) {
        const indexPart = key.substring(prefix.length);
        const idx = parseInt(indexPart, 10);
        if (!isNaN(idx)) {
          set.add(idx);
        }
      }
    });
    return set;
  }, [journal, activeProfileId, viewMode]);

  const milestonesLookup = useMemo(() => {
    const set = new Set<number>();
    if (!calculations || !activeProfile) return set;

    const multiplier = viewMode === 'weeks' ? 52 : viewMode === 'months' ? 12 : 1;
    activeMilestones.forEach(m => {
      if (m.isLegacy) return;
      const idx = Math.floor(m.age * multiplier);
      if (idx >= 0) {
        set.add(idx);
      }
    });
    return set;
  }, [activeMilestones, viewMode, calculations, activeProfile]);

  // Fetch milestones that occur in a specific unit index
  const getUnitMilestones = (index: number) => {
    if (!calculations || !activeProfile) return [];
    
    const unitAgeStart = viewMode === 'weeks' ? index / 52 : viewMode === 'months' ? index / 12 : index;
    const unitAgeEnd = viewMode === 'weeks' ? (index + 1) / 52 : viewMode === 'months' ? (index + 1) / 12 : index + 1;

    return activeMilestones.filter(m => m.age >= unitAgeStart && m.age < unitAgeEnd);
  };

  const getUnitNoteKey = (index: number) => {
    return `${activeProfileId}-${viewMode}-${index}`;
  };

  // Gompertz 10 year mortality probability calculation
  const mortalityProb10Y = useMemo(() => {
    if (!calculations) return 0;
    const age = calculations.stats.lived.days / 365.25;
    const a = 0.0002;
    const b = 0.00001;
    const c = 1.10;
    let survivalProb = 1.0;
    for (let t = 0; t < 10; t++) {
      const ageT = age + t;
      const qx = Math.min(0.99, a + b * Math.pow(c, ageT));
      survivalProb *= (1 - qx);
    }
    return (1 - survivalProb) * 100;
  }, [calculations]);

  // --- Handlers ---
  
  const handleOpenConfig = (profile: Profile | null = null) => {
    if (profile) {
      setEditingProfileId(profile.id);
      setFormName(profile.name);
      setFormBirthDate(profile.birthDate);
      setFormBirthTime(profile.birthTime || '');
      setFormExpectedLifespan(profile.expectedLifespan);
      setFormGender(profile.gender);
      setFormCountry(profile.country);
      setFormSmoking(profile.lifestyle.smoking);
      setFormExercise(profile.lifestyle.exercise);
      setFormDiet(profile.lifestyle.diet);
      setFormStress(profile.lifestyle.stress);
      setFormSleep(!!profile.lifestyle.sleep);
      setFormAlcohol(!!profile.lifestyle.alcohol);
      setFormPollution(!!profile.lifestyle.pollution);
      setFormGenetics(!!profile.lifestyle.genetics);
      syncGregorianToJalali(profile.birthDate);
    } else {
      setEditingProfileId(null);
      setFormName('');
      setFormBirthDate('2000-03-20');
      setFormBirthTime('');
      setFormExpectedLifespan(80);
      setFormGender('male');
      setFormCountry('iran');
      setFormSmoking(false);
      setFormExercise(false);
      setFormDiet(false);
      setFormStress(false);
      setFormSleep(false);
      setFormAlcohol(false);
      setFormPollution(false);
      setFormGenetics(false);
      setJalaliYear(1379);
      setJalaliMonth(1);
      setJalaliDay(1);
    }
    setIsConfiguring(true);
    setIsProfileModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const lifestyle = {
      smoking: formSmoking,
      exercise: formExercise,
      diet: formDiet,
      stress: formStress,
      sleep: formSleep,
      alcohol: formAlcohol,
      pollution: formPollution,
      genetics: formGenetics,
    };

    if (editingProfileId) {
      // Edit existing
      setProfiles(prev => prev.map(p => p.id === editingProfileId ? {
        ...p,
        name: formName,
        birthDate: formBirthDate,
        birthTime: formBirthTime || undefined,
        expectedLifespan: formExpectedLifespan,
        gender: formGender,
        country: formCountry,
        lifestyle
      } : p));
      setEditingProfileId(null);
    } else {
      // Create new
      const newId = Math.random().toString(36).substring(2, 9);
      const newProfile: Profile = {
        id: newId,
        name: formName,
        birthDate: formBirthDate,
        birthTime: formBirthTime || undefined,
        expectedLifespan: formExpectedLifespan,
        gender: formGender,
        country: formCountry,
        lifestyle
      };
      setProfiles(prev => [...prev, newProfile]);
      setActiveProfileId(newId);
    }

    setIsConfiguring(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm(t.deleteProfileConfirm)) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setProfiles(remaining);
      
      const newJournal = { ...journal };
      Object.keys(newJournal).forEach(key => {
        if (key.startsWith(profileId + '-')) {
          delete newJournal[key];
        }
      });
      setJournal(newJournal);

      const newCustomMilestones = { ...customMilestones };
      delete newCustomMilestones[profileId];
      setCustomMilestones(newCustomMilestones);

      if (activeProfileId === profileId) {
        if (remaining.length > 0) {
          setActiveProfileId(remaining[0].id);
        } else {
          setActiveProfileId('');
        }
      }
    }
  };

  const handleUnitClick = (index: number) => {
    setSelectedUnitIndex(index);
    const key = getUnitNoteKey(index);
    const existing = journal[key];
    if (existing) {
      setNoteTitle(existing.title);
      setNoteContent(existing.content);
      setNoteCat(existing.category);
    } else {
      setNoteTitle('');
      setNoteContent('');
      setNoteCat('general');
    }
  };

  const handleSaveNote = () => {
    if (selectedUnitIndex === null || !activeProfileId) return;
    
    const key = getUnitNoteKey(selectedUnitIndex);
    const newEntry: JournalEntry = {
      id: key,
      title: noteTitle || `${viewMode === 'weeks' ? t.weekLabel : viewMode === 'months' ? t.monthLabel : t.yearLabel} ${selectedUnitIndex + 1}`,
      content: noteContent,
      category: noteCat,
      date: new Date().toLocaleDateString()
    };

    setJournal(prev => ({
      ...prev,
      [key]: newEntry
    }));
    
    setSelectedUnitIndex(null);
  };

  const handleDeleteNote = () => {
    if (selectedUnitIndex === null) return;
    const key = getUnitNoteKey(selectedUnitIndex);
    setJournal(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setSelectedUnitIndex(null);
  };

  const handleAddCustomMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProfileId) return;

    const newMilestone: Milestone = {
      id: Math.random().toString(36).substring(2, 9),
      age: newMilestoneAge,
      titleEn: newMilestoneTitle,
      titleFa: newMilestoneTitle,
      descriptionEn: newMilestoneDesc,
      descriptionFa: newMilestoneDesc,
      icon: '🎯',
      category: newMilestoneCat,
      isCustom: true
    };

    setCustomMilestones(prev => {
      const activeList = prev[activeProfileId] || [];
      return {
        ...prev,
        [activeProfileId]: [...activeList, newMilestone]
      };
    });

    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
  };

  const handleDeleteCustomMilestone = (id: string) => {
    if (!activeProfileId) return;
    setCustomMilestones(prev => {
      const activeList = prev[activeProfileId] || [];
      return {
        ...prev,
        [activeProfileId]: activeList.filter(m => m.id !== id)
      };
    });
  };

  const handleAddLegacyEvent = (yearsAfter: number, title: string, desc: string) => {
    if (!activeProfileId) return;
    const newMilestone: Milestone = {
      id: Math.random().toString(36).substring(2, 9),
      age: (calculations?.adjustedLifespan || 80) + yearsAfter,
      titleEn: title,
      titleFa: title,
      descriptionEn: desc,
      descriptionFa: desc,
      icon: '🌌',
      category: 'general',
      isCustom: true,
      isLegacy: true,
      yearsAfter: yearsAfter
    };

    setCustomMilestones(prev => {
      const activeList = prev[activeProfileId] || [];
      return {
        ...prev,
        [activeProfileId]: [...activeList, newMilestone]
      };
    });
  };

  // --- SVG/Canvas Image Export ---
  const handleExportPng = () => {
    if (!activeProfile || !calculations || !gridData) return;
    
    const cols = viewMode === 'weeks' ? 52 : viewMode === 'months' ? 12 : 10;
    const rows = Math.ceil(gridData.totalUnits / cols);
    
    const squareSize = 14;
    const gapSize = 4;
    const padding = 30;
    const headerHeight = 90;
    const footerHeight = 40;
    
    const canvas = document.createElement('canvas');
    canvas.width = cols * (squareSize + gapSize) - gapSize + padding * 2;
    canvas.height = rows * (squareSize + gapSize) - gapSize + padding * 2 + headerHeight + footerHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const getThemeColors = (themeName: ThemeName) => {
      switch (themeName) {
        case 'cosmic':
          return { bg: '#0b0d17', lived: '#7c3aed', empty: '#1e1b4b', current: '#f43f5e', text: '#f1f5f9', subtext: '#94a3b8' };
        case 'vintage':
          return { bg: '#FAF6EE', lived: '#C9827C', empty: '#EFEAE0', current: '#406073', text: '#2C251F', subtext: '#5C544A' };
        case 'minimal':
          return { bg: '#ffffff', lived: '#777777', empty: '#f3f3f3', current: '#e11d48', text: '#000000', subtext: '#555555' };
        case 'aura':
          return { bg: '#FCF7F0', lived: '#EDB592', empty: '#F5EFE6', current: '#527A71', text: '#3D2E24', subtext: '#735F53' };
        case 'zen':
        default:
          return { bg: '#f5f6f2', lived: '#8ca993', empty: '#e4e7df', current: '#bf5656', text: '#212c1f', subtext: '#3f4a3e' };
      }
    };

    const colors = getThemeColors(settings.theme);

    // Wait for custom fonts to load before drawing to prevent fallback system font issues
    document.fonts.ready.then(() => {
      // Draw background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw Title
      ctx.font = settings.language === 'fa' ? '600 24px IRANSans, sans-serif' : '600 24px Georgia, serif';
      ctx.fillStyle = colors.text;
      ctx.fillText("MEMENTO MORI", padding, padding + 28);
      
      // Draw Profile Info
      ctx.font = settings.language === 'fa' ? '14px IRANSans, sans-serif' : '14px Inter, sans-serif';
      ctx.fillStyle = colors.subtext;
      ctx.fillText(
        `${activeProfile.name} • ${calculations.age.years} ${t.years} ${t.lived} • ${calculations.livedPercent.toFixed(2)}%`, 
        padding, 
        padding + 52
      );

      // Draw units
      for (let i = 0; i < gridData.totalUnits; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padding + col * (squareSize + gapSize);
        const y = padding + headerHeight + row * (squareSize + gapSize);
        
        if (i === gridData.currentUnitIndex) {
          ctx.fillStyle = colors.current;
        } else if (i < gridData.currentUnitIndex) {
          ctx.fillStyle = colors.lived;
        } else {
          ctx.fillStyle = colors.empty;
        }
        
        ctx.fillRect(x, y, squareSize, squareSize);
      }

      // Draw Footer
      ctx.font = settings.language === 'fa' ? '11px IRANSans, sans-serif' : 'italic 11px Georgia, serif';
      ctx.fillStyle = colors.subtext;
      ctx.textAlign = 'center';
      const quote = PHILOSOPHICAL_QUOTES[quoteIndex];
      const quoteText = settings.language === 'fa' ? quote.quoteFa : quote.quoteEn;
      const authorText = settings.language === 'fa' ? quote.authorFa : quote.authorEn;
      ctx.fillText(`"${quoteText}" — ${authorText}`, canvas.width / 2, canvas.height - 20);
      
      const link = document.createElement('a');
      link.download = `${activeProfile.name}_memento_mori_${viewMode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const getUnitDateRange = (index: number) => {
    if (!calculations || !activeProfile) return '';
    const birthTimeMs = calculations.birthDate.getTime();
    
    let start: Date;
    let end: Date;

    if (viewMode === 'weeks') {
      start = new Date(birthTimeMs + index * 7 * 24 * 60 * 60 * 1000);
      end = new Date(birthTimeMs + (index + 1) * 7 * 24 * 60 * 60 * 1000);
    } else if (viewMode === 'months') {
      start = new Date(birthTimeMs + index * 30.4375 * 24 * 60 * 60 * 1000);
      end = new Date(birthTimeMs + (index + 1) * 30.4375 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(birthTimeMs);
      start.setFullYear(calculations.birthDate.getFullYear() + index);
      end = new Date(birthTimeMs);
      end.setFullYear(calculations.birthDate.getFullYear() + index + 1);
    }

    if (settings.language === 'fa') {
      return `${formatJalaliVerbose(start.getFullYear(), start.getMonth() + 1, start.getDate())} - ${formatJalaliVerbose(end.getFullYear(), end.getMonth() + 1, end.getDate())}`;
    }
    return `${start.toLocaleDateString('en-US')} - ${end.toLocaleDateString('en-US')}`;
  };

  const handleUnitMouseEnter = (e: React.MouseEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    setTooltipPos({
      x: rect.left + scrollLeft + rect.width / 2,
      y: rect.top + scrollTop - 40
    });
    setHoveredUnitIndex(index);
  };

  return (
    <div className="app-container">
      {/* HEADER COMPONENT */}
      <Header 
        settings={settings}
        activeProfile={activeProfile}
        onToggleLanguage={() => setSettings(prev => ({ ...prev, language: prev.language === 'en' ? 'fa' : 'en' }))}
        onToggleDarkMode={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
        onToggleSound={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        onSoundVolumeChange={(vol: number) => setSettings(prev => ({ ...prev, soundVolume: vol }))}
        onToggleAmbient={() => setSettings(prev => ({ ...prev, ambientEnabled: !prev.ambientEnabled }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfilePicker={() => setIsProfileModalOpen(true)}
        onEditProfile={() => handleOpenConfig(activeProfile)}
        onGoHome={() => {
          if (activeProfile) {
            setIsConfiguring(false);
            setSelectedUnitIndex(null);
          }
        }}
        showInstallBtn={!!deferredPrompt}
        onInstall={handleInstallClick}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(prev => !prev)}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen(prev => !prev)}
        t={t}
      />

      {/* FULL-WIDTH COUNTDOWN BANNER */}
      {activeProfile && calculations && !isConfiguring && (
        <CountdownBanner 
          countdown={calculations.countdown}
          livedPercent={calculations.livedPercent}
          language={settings.language}
          activeProfileId={activeProfileId}
          countdownNotes={countdownNotes}
          onSaveCountdownNote={(id: string, text: string) => setCountdownNotes(prev => ({ ...prev, [id]: text }))}
          onDeleteCountdownNote={(id: string) => setCountdownNotes(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          })}
          showCountdownNote={settings.showCountdownNote}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          ambientEnabled={settings.ambientEnabled}
          onToggleAmbient={() => setSettings(prev => ({ ...prev, ambientEnabled: !prev.ambientEnabled }))}
          t={t}
        />
      )}

      {/* 1. SETUP / CONFIGURATION SCREEN */}
      {isConfiguring ? (
        <Suspense fallback={<div className="splash-container"><div className="splash-spinner"></div></div>}>
          <ConfigForm 
            editingProfileId={editingProfileId}
            profiles={profiles}
            language={settings.language}
            formName={formName}
            setFormName={setFormName}
            formBirthDate={formBirthDate}
            setFormBirthDate={setFormBirthDate}
            formBirthTime={formBirthTime}
            setFormBirthTime={setFormBirthTime}
            formExpectedLifespan={formExpectedLifespan}
            setFormExpectedLifespan={setFormExpectedLifespan}
            formGender={formGender}
            setFormGender={setFormGender}
            formCountry={formCountry}
            setFormCountry={setFormCountry}
            formSmoking={formSmoking}
            setFormSmoking={setFormSmoking}
            formExercise={formExercise}
            setFormExercise={setFormExercise}
            formDiet={formDiet}
            setFormDiet={setFormDiet}
            formStress={formStress}
            setFormStress={setFormStress}
            formSleep={formSleep}
            setFormSleep={setFormSleep}
            formAlcohol={formAlcohol}
            setFormAlcohol={setFormAlcohol}
            formPollution={formPollution}
            setFormPollution={setFormPollution}
            formGenetics={formGenetics}
            setFormGenetics={setFormGenetics}
            jalaliYear={jalaliYear}
            setJalaliYear={setJalaliYear}
            jalaliMonth={jalaliMonth}
            setJalaliMonth={setJalaliMonth}
            jalaliDay={jalaliDay}
            setJalaliDay={setJalaliDay}
            onSaveProfile={handleSaveProfile}
            onCancel={() => setIsConfiguring(false)}
            t={t}
          />
        </Suspense>
      ) : activeProfile && calculations && gridData ? (
        // 2. NO-SCROLL DASHBOARD MAIN INTERFACE
        <div className={`dashboard-layout ${isLeftSidebarOpen ? 'left-open' : 'left-collapsed'} ${isRightSidebarOpen ? 'right-open' : 'right-collapsed'} show-col-${activeColumn}`}>
          
          {/* COLUMN 1: SIDEBAR COMPONENT */}
          <aside className={`sidebar-column-wrapper ${isLeftSidebarOpen ? 'open' : 'collapsed'}`}>
            <Sidebar 
              activeProfile={activeProfile}
              calculations={calculations}
              settings={settings}
              mortalityProb10Y={mortalityProb10Y}
              quoteIndex={quoteIndex}
              onNextQuote={() => setQuoteIndex((quoteIndex + 1) % PHILOSOPHICAL_QUOTES.length)}
              t={t}
            />
          </aside>

          {/* COLUMN 2: MAIN WORKSPACE */}
          <main className="main-panel">
            
            {/* INTERACTIVE GRID VISUALIZER */}
            <GridVisualizer 
              viewMode={viewMode}
              setViewMode={setViewMode}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              gridData={gridData}
              notesLookup={notesLookup}
              milestonesLookup={milestonesLookup}
              handleUnitClick={handleUnitClick}
              handleUnitMouseEnter={handleUnitMouseEnter}
              setHoveredUnitIndex={setHoveredUnitIndex}
              settings={settings}
              handleExportPng={handleExportPng}
              t={t}
            />

            {/* Floating button to reveal collapsed stats */}
            {!isLeftSidebarOpen && (
              <button 
                className="floating-left-sidebar-toggle"
                onClick={() => setIsLeftSidebarOpen(true)}
                title={settings.language === 'fa' ? 'نمایش آمار و جزئیات' : 'Show Stats & Details'}
              >
                <BarChart2 size={16} />
                <span>{settings.language === 'fa' ? 'آمار و جزئیات' : 'Stats & Details'}</span>
              </button>
            )}

            {/* Floating button to reveal collapsed goals & journal */}
            {!isRightSidebarOpen && (
              <button 
                className="floating-sidebar-toggle"
                onClick={() => setIsRightSidebarOpen(true)}
                title={settings.language === 'fa' ? 'نمایش اهداف و دفترچه' : 'Show Goals & Journal'}
              >
                <BookOpen size={16} />
                <span>{settings.language === 'fa' ? 'اهداف و دفترچه' : 'Goals & Journal'}</span>
              </button>
            )}
          </main>

          {/* COLUMN 3: RIGHT COLLAPSIBLE SIDEBAR */}
          <aside className={`right-sidebar-panel ${isRightSidebarOpen ? 'open' : 'collapsed'}`}>
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflowY: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  🎯 {settings.language === 'fa' ? 'اهداف و دفترچه' : 'Goals & Journal'}
                </h3>
                <button 
                  className="btn btn-icon-only" 
                  onClick={() => setIsRightSidebarOpen(false)}
                  style={{ border: 'none', background: 'transparent', padding: 2 }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '2px' }}>
                <JournalTab 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  activeProfileId={activeProfileId}
                  journal={journal}
                  customMilestones={customMilestones}
                  newMilestoneAge={newMilestoneAge}
                  setNewMilestoneAge={setNewMilestoneAge}
                  newMilestoneTitle={newMilestoneTitle}
                  setNewMilestoneTitle={setNewMilestoneTitle}
                  newMilestoneDesc={newMilestoneDesc}
                  setNewMilestoneDesc={setNewMilestoneDesc}
                  newMilestoneCat={newMilestoneCat}
                  setNewMilestoneCat={setNewMilestoneCat}
                  onAddMilestone={handleAddCustomMilestone}
                  onDeleteMilestone={handleDeleteCustomMilestone}
                  onAddLegacyEvent={handleAddLegacyEvent}
                  setViewMode={setViewMode}
                  onOpenNoteDrawer={handleUnitClick}
                  language={settings.language}
                  t={t}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* --- DRAWERS AND DIALOGS --- */}

      <Suspense fallback={null}>
        {/* Note Editing Drawer */}
        {selectedUnitIndex !== null && calculations && activeProfile && (
          <NoteDrawer 
            selectedUnitIndex={selectedUnitIndex}
            viewMode={viewMode}
            noteTitle={noteTitle}
            setNoteTitle={setNoteTitle}
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            noteCat={noteCat}
            setNoteCat={setNoteCat}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onClose={() => setSelectedUnitIndex(null)}
            getUnitDateRange={getUnitDateRange}
            getUnitMilestones={getUnitMilestones}
            journal={journal}
            getUnitNoteKey={getUnitNoteKey}
            settings={settings}
            t={t}
          />
        )}

        {/* Profiles Modal */}
        {isProfileModalOpen && (
          <ProfilesModal 
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={setActiveProfileId}
            onEditProfile={handleOpenConfig}
            onDeleteProfile={handleDeleteProfile}
            onAddProfile={() => handleOpenConfig()}
            onClose={() => setIsProfileModalOpen(false)}
            t={t}
          />
        )}

        {/* Global Settings Drawer */}
        {isSettingsOpen && (
          <SettingsModal 
            settings={settings}
            setSettings={setSettings}
            onClose={() => setIsSettingsOpen(false)}
            t={t}
          />
        )}
      </Suspense>

      {/* Grid Hover Tooltip */}
      {hoveredUnitIndex !== null && calculations && (
        <div 
          className="unit-tooltip"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            transform: settings.language === 'fa' ? 'translate(50%, -100%)' : 'translate(-50%, -100%)'
          }}
        >
          <div style={{fontWeight: 600, color: 'var(--text-h)'}}>
            {viewMode === 'weeks' ? t.weekLabel : viewMode === 'months' ? t.monthLabel : t.yearLabel} {hoveredUnitIndex + 1}
          </div>
          <div>{getUnitDateRange(hoveredUnitIndex)}</div>
          <div>{((viewMode === 'weeks' ? hoveredUnitIndex / 52 : viewMode === 'months' ? hoveredUnitIndex / 12 : hoveredUnitIndex)).toFixed(1)} {t.years}</div>
          
          {/* Milestone indication */}
          {getUnitMilestones(hoveredUnitIndex).map(m => (
            <div key={m.id} style={{fontSize: '0.75rem', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px', color: 'var(--accent)'}}>
              {m.icon} {settings.language === 'fa' ? m.titleFa : m.titleEn}
            </div>
          ))}

          {/* Journal Note title indication */}
          {journal[getUnitNoteKey(hoveredUnitIndex)] && (
            <div style={{fontSize: '0.75rem', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px', fontStyle: 'italic'}}>
              📝 {journal[getUnitNoteKey(hoveredUnitIndex)].title}
            </div>
          )}
        </div>
      )}

      {activeProfile && !isConfiguring && (
        <div className="mobile-bottom-nav">
          <button 
            className={`mobile-nav-btn ${activeColumn === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveColumn('stats')}
          >
            <span className="icon">📊</span>
            <span className="label">{settings.language === 'fa' ? 'جزئیات و آمار' : 'Stats'}</span>
          </button>
          <button 
            className={`mobile-nav-btn ${activeColumn === 'grid' ? 'active' : ''}`}
            onClick={() => setActiveColumn('grid')}
          >
            <span className="icon">🗓️</span>
            <span className="label">{settings.language === 'fa' ? 'جدول زندگی' : 'Life Grid'}</span>
          </button>
          <button 
            className={`mobile-nav-btn ${activeColumn === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveColumn('journal')}
          >
            <span className="icon">🎯</span>
            <span className="label">{settings.language === 'fa' ? 'اهداف و دفترچه' : 'Goals & Journal'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
