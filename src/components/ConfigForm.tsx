import type { Profile } from '../types';
import { COUNTRY_DATA } from '../constants';
import { JALALI_MONTH_NAMES } from '../jalali';

interface ConfigFormProps {
  editingProfileId: string | null;
  profiles: Profile[];
  language: string;
  formName: string;
  setFormName: (val: string) => void;
  formBirthDate: string;
  setFormBirthDate: (val: string) => void;
  formBirthTime: string;
  setFormBirthTime: (val: string) => void;
  formExpectedLifespan: number;
  setFormExpectedLifespan: (val: number) => void;
  formGender: 'male' | 'female' | 'other';
  setFormGender: (val: 'male' | 'female' | 'other') => void;
  formCountry: string;
  setFormCountry: (val: string) => void;
  formSmoking: boolean;
  setFormSmoking: (val: boolean) => void;
  formExercise: boolean;
  setFormExercise: (val: boolean) => void;
  formDiet: boolean;
  setFormDiet: (val: boolean) => void;
  formStress: boolean;
  setFormStress: (val: boolean) => void;
  formSleep: boolean;
  setFormSleep: (val: boolean) => void;
  formAlcohol: boolean;
  setFormAlcohol: (val: boolean) => void;
  formPollution: boolean;
  setFormPollution: (val: boolean) => void;
  formGenetics: boolean;
  setFormGenetics: (val: boolean) => void;
  jalaliYear: number;
  setJalaliYear: (val: number) => void;
  jalaliMonth: number;
  setJalaliMonth: (val: number) => void;
  jalaliDay: number;
  setJalaliDay: (val: number) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onCancel: () => void;
  t: any;
}

export function ConfigForm({
  editingProfileId,
  profiles,
  language,
  formName,
  setFormName,
  formBirthDate,
  setFormBirthDate,
  formBirthTime,
  setFormBirthTime,
  formExpectedLifespan,
  setFormExpectedLifespan,
  formGender,
  setFormGender,
  formCountry,
  setFormCountry,
  formSmoking,
  setFormSmoking,
  formExercise,
  setFormExercise,
  formDiet,
  setFormDiet,
  formStress,
  setFormStress,
  formSleep,
  setFormSleep,
  formAlcohol,
  setFormAlcohol,
  formPollution,
  setFormPollution,
  formGenetics,
  setFormGenetics,
  jalaliYear,
  setJalaliYear,
  jalaliMonth,
  setJalaliMonth,
  jalaliDay,
  setJalaliDay,
  onSaveProfile,
  onCancel,
  t
}: ConfigFormProps) {
  const maxDays = jalaliMonth <= 6 ? 31 : jalaliMonth <= 11 ? 30 : 29;

  return (
    <main className="config-container glass-panel">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
        <img 
          src="/logo.png" 
          alt="Memento Logo" 
          style={{ width: '90px', height: '90px', borderRadius: '20px', objectFit: 'cover', border: '1px solid var(--border)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)' }} 
        />
        <h2 className="config-title" style={{ margin: 0 }}>
          {editingProfileId ? t.editProfile : t.enterBirthDetails}
        </h2>
      </div>
      
      <form onSubmit={onSaveProfile} className="drawer-body">
        <div className="form-group">
          <label>{t.nameLabel}</label>
          <input 
            type="text" 
            value={formName} 
            onChange={e => setFormName(e.target.value)} 
            required 
            placeholder="e.g. Marcus"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t.birthDate}</label>
            {language === 'fa' ? (
              <div className="jalali-select-row">
                {/* Jalali Year */}
                <select 
                  value={jalaliYear} 
                  onChange={e => setJalaliYear(Number(e.target.value))}
                >
                  {Array.from({ length: 121 }, (_, i) => 1300 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {/* Jalali Month */}
                <select 
                  value={jalaliMonth} 
                  onChange={e => setJalaliMonth(Number(e.target.value))}
                >
                  {JALALI_MONTH_NAMES.map((m: string, i: number) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>

                {/* Jalali Day */}
                <select 
                  value={jalaliDay} 
                  onChange={e => setJalaliDay(Number(e.target.value))}
                >
                  {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            ) : (
              <input 
                type="date" 
                value={formBirthDate} 
                onChange={e => setFormBirthDate(e.target.value)} 
                required 
              />
            )}
          </div>

          <div className="form-group">
            <label>{t.birthTime}</label>
            <input 
              type="time" 
              value={formBirthTime} 
              onChange={e => setFormBirthTime(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t.expectedLifespan}</label>
            <select 
              value={formExpectedLifespan} 
              onChange={e => setFormExpectedLifespan(Number(e.target.value))}
            >
              <option value={70}>70</option>
              <option value={80}>80</option>
              <option value={90}>90</option>
              <option value={100}>100</option>
              <option value={85}>Custom (85)</option>
              <option value={95}>Custom (95)</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t.gender}</label>
            <select 
              value={formGender} 
              onChange={e => setFormGender(e.target.value as 'male' | 'female' | 'other')}
            >
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t.country}</label>
          <select 
            value={formCountry} 
            onChange={e => {
              setFormCountry(e.target.value);
              const data = COUNTRY_DATA[e.target.value];
              if (data) {
                const avg = formGender === 'male' ? data.male : formGender === 'female' ? data.female : data.average;
                setFormExpectedLifespan(Math.round(avg));
              }
            }}
          >
            {Object.keys(COUNTRY_DATA).map(c => (
              <option key={c} value={c}>
                {c.toUpperCase()} (Avg: {COUNTRY_DATA[c].average} yrs)
              </option>
            ))}
          </select>
        </div>

        {/* Lifestyle Modifiers */}
        <div className="form-group">
          <label>{t.lifestyleFactors}</label>
          <p style={{fontSize: '0.8rem', opacity: 0.8, marginBottom: '6px'}}>{t.lifestyleIntro}</p>
          
          <div className="lifestyle-grid">
            <div 
              className={`lifestyle-card ${formSmoking ? 'active' : ''}`}
              onClick={() => setFormSmoking(!formSmoking)}
            >
              <input type="checkbox" checked={formSmoking} readOnly />
              <span>{t.smoking}</span>
            </div>

            <div 
              className={`lifestyle-card ${formExercise ? 'active' : ''}`}
              onClick={() => setFormExercise(!formExercise)}
            >
              <input type="checkbox" checked={formExercise} readOnly />
              <span>{t.exercise}</span>
            </div>

            <div 
              className={`lifestyle-card ${formDiet ? 'active' : ''}`}
              onClick={() => setFormDiet(!formDiet)}
            >
              <input type="checkbox" checked={formDiet} readOnly />
              <span>{t.diet}</span>
            </div>

            <div 
              className={`lifestyle-card ${formStress ? 'active' : ''}`}
              onClick={() => setFormStress(!formStress)}
            >
              <input type="checkbox" checked={formStress} readOnly />
              <span>{t.stress}</span>
            </div>

            <div 
              className={`lifestyle-card ${formSleep ? 'active' : ''}`}
              onClick={() => setFormSleep(!formSleep)}
            >
              <input type="checkbox" checked={formSleep} readOnly />
              <span>{t.sleep}</span>
            </div>

            <div 
              className={`lifestyle-card ${formAlcohol ? 'active' : ''}`}
              onClick={() => setFormAlcohol(!formAlcohol)}
            >
              <input type="checkbox" checked={formAlcohol} readOnly />
              <span>{t.alcohol}</span>
            </div>

            <div 
              className={`lifestyle-card ${formPollution ? 'active' : ''}`}
              onClick={() => setFormPollution(!formPollution)}
            >
              <input type="checkbox" checked={formPollution} readOnly />
              <span>{t.pollution}</span>
            </div>

            <div 
              className={`lifestyle-card ${formGenetics ? 'active' : ''}`}
              onClick={() => setFormGenetics(!formGenetics)}
            >
              <input type="checkbox" checked={formGenetics} readOnly />
              <span>{t.genetics}</span>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
          <button type="submit" className="btn btn-primary" style={{flex: 1}}>
            {t.saveProfile}
          </button>
          {profiles.length > 0 && (
            <button type="button" className="btn" onClick={onCancel} style={{flex: 1}}>
              {t.backToSetup}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
