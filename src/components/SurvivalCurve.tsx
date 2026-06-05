import { useEffect, useRef } from 'react';

interface SurvivalCurveProps {
  ageInDays: number;
  adjustedLifespan: number;
  theme: string;
  language: string;
  livedLabel: string;
}

export function SurvivalCurve({
  ageInDays,
  adjustedLifespan,
  theme,
  language,
  livedLabel
}: SurvivalCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const currentAge = ageInDays / 365.25;
    const maxAge = Math.max(100, adjustedLifespan + 15);

    // Gompertz-Makeham parameters
    const a = 0.0002;
    const b = 0.00001;
    const c = 1.10;

    const points: { age: number; survival: number }[] = [];
    let survival = 1.0;
    points.push({ age: 0, survival });
    
    for (let x = 1; x <= maxAge; x++) {
      const qx = Math.min(0.99, a + b * Math.pow(c, x - 1));
      survival *= (1 - qx);
      points.push({ age: x, survival });
    }

    const padding = { left: 40, right: 15, top: 15, bottom: 25 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (age: number) => padding.left + (age / maxAge) * chartWidth;
    const getY = (s: number) => padding.top + (1 - s) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = theme === 'cosmic' ? '#1e293b' : '#e5e5e5';
    ctx.lineWidth = 1;
    
    for (let s = 0; s <= 1; s += 0.25) {
      const y = getY(s);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = theme === 'cosmic' ? '#94a3b8' : '#555555';
      ctx.font = language === 'fa' ? '9px IRANSans, sans-serif' : '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(s * 100)}%`, padding.left - 8, y + 3);
    }

    for (let age = 0; age <= maxAge; age += 20) {
      const x = getX(age);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = language === 'fa' ? '9px IRANSans, sans-serif' : '9px sans-serif';
      ctx.fillText(`${age}`, x, height - padding.bottom + 14);
    }

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = theme === 'cosmic' ? '#a78bfa' : '#608066';
    ctx.lineWidth = 2.5;
    ctx.moveTo(getX(points[0].age), getY(points[0].survival));
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(getX(points[i].age), getY(points[i].survival));
    }
    ctx.stroke();

    // Draw current age marker
    const currentSurvival = points.find(p => p.age === Math.floor(currentAge))?.survival || 0;
    const markerX = getX(currentAge);
    const markerY = getY(currentSurvival);

    ctx.beginPath();
    ctx.fillStyle = '#ef4444';
    ctx.arc(markerX, markerY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme === 'cosmic' ? '#f1f5f9' : '#000000';
    ctx.font = language === 'fa' ? '10px IRANSans, sans-serif' : '10px sans-serif';
    ctx.textAlign = language === 'fa' ? 'right' : 'left';
    ctx.fillText(
      `${livedLabel}: ${Math.round(currentSurvival * 100)}%`, 
      markerX + (language === 'fa' ? -8 : 8), 
      markerY - 6
    );
  }, [ageInDays, adjustedLifespan, theme, language, livedLabel]);

  return <canvas ref={canvasRef} className="survival-canvas" />;
}
