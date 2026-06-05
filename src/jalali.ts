export const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335];
  let jy: number, jm: number, jd: number;
  let g_day_no = 365 * (gy - 1600) + Math.floor((gy - 1600) / 4) - Math.floor((gy - 1600) / 100) + Math.floor((gy - 1600) / 400) + gd + g_d_m[gm - 1];
  
  if (gm > 2 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    g_day_no++;
  }
  
  let j_day_no = g_day_no - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no = j_day_no % 12053;
  
  jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no = j_day_no % 1461;
  
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  
  jm = 1;
  while (j_day_no >= (jm <= 6 ? 31 : 30)) {
    j_day_no -= (jm <= 6 ? 31 : 30);
    jm++;
  }
  if (jm === 12 && j_day_no >= 30) {
    // Leap year handling for Esfand
    j_day_no -= 30;
    jm = 12;
  }
  jd = j_day_no + 1;
  
  return [jy, jm, jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy - 979;
  let j_day_no = 365 * gy + Math.floor(gy / 33) * 8 + Math.floor(((gy % 33) + 3) / 4);
  for (let i = 0; i < jm - 1; ++i) {
    j_day_no += (i < 6 ? 31 : 30);
  }
  j_day_no += jd - 1;
  
  let g_day_no = j_day_no + 79;
  let gy_calc = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;
  
  let leap = 1;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy_calc += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = 0;
    }
  }
  
  gy_calc += 4 * Math.floor(g_day_no / 1461);
  g_day_no = g_day_no % 1461;
  
  if (g_day_no >= 366) {
    leap = 0;
    g_day_no--;
    gy_calc += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }
  
  let gd = g_day_no + 1;
  const g_d_m = [0, 31, 28 + leap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  while (gd > g_d_m[gm]) {
    gd -= g_d_m[gm];
    gm++;
  }
  
  return [gy_calc, gm, gd];
}

export function formatJalali(gy: number, gm: number, gd: number): string {
  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
  return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
}

export function formatJalaliVerbose(gy: number, gm: number, gd: number): string {
  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
  return `${jd} ${JALALI_MONTH_NAMES[jm - 1]} ${jy}`;
}
