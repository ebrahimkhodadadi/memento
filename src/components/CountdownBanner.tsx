import { Clock } from 'lucide-react';

interface CountdownBannerProps {
  countdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  livedPercent: number;
  language: string;
  t: any;
}

export function CountdownBanner({ countdown, livedPercent, language, t }: CountdownBannerProps) {
  const units = [
    { value: countdown.years, labelEn: 'Years', labelFa: 'سال' },
    { value: countdown.months, labelEn: 'Months', labelFa: 'ماه' },
    { value: countdown.days, labelEn: 'Days', labelFa: 'روز' },
    { value: countdown.hours, labelEn: 'Hours', labelFa: 'ساعت' },
    { value: countdown.minutes, labelEn: 'Minutes', labelFa: 'دقیقه' },
    { value: countdown.seconds, labelEn: 'Seconds', labelFa: 'ثانیه' },
  ];

  return (
    <div className="countdown-banner glass-panel">
      <div className="countdown-banner-label">
        <Clock size={18} />
        <span>{t.timeLeft}</span>
      </div>
      <div className="countdown-banner-blocks">
        {units.map((unit, idx) => (
          <div key={idx} className="countdown-block">
            <span className="countdown-block-value">
              {unit.value.toString().padStart(2, '0')}
            </span>
            <span className="countdown-block-label">
              {language === 'fa' ? unit.labelFa : unit.labelEn}
            </span>
          </div>
        ))}
      </div>
      <div className="countdown-banner-percent">
        {livedPercent.toFixed(2)}% {t.lived}
      </div>
    </div>
  );
}
