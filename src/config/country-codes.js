/**
 * country-codes.js
 *
 * Curated list of dial codes + default IANA timezone. Covers the most
 * common business markets; extend as needed. `timezones` is provided
 * for countries with multiple zones so the form can let the user pick.
 */

export const COUNTRY_CODES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', timezone: 'Asia/Kolkata' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', timezone: 'Asia/Dubai' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', timezone: 'America/New_York',
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'] },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', timezone: 'America/Toronto',
    timezones: ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Halifax', 'America/Winnipeg'] },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', timezone: 'Australia/Sydney',
    timezones: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide'] },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', timezone: 'Asia/Singapore' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', timezone: 'Asia/Jakarta' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', timezone: 'Asia/Manila' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', timezone: 'Asia/Bangkok' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', timezone: 'Asia/Seoul' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', timezone: 'Asia/Shanghai' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰', timezone: 'Asia/Hong_Kong' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', timezone: 'Pacific/Auckland' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', timezone: 'Europe/Paris' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', timezone: 'Europe/Rome' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', timezone: 'Europe/Madrid' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', timezone: 'Europe/Amsterdam' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', timezone: 'Europe/Dublin' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', timezone: 'Europe/Zurich' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', timezone: 'Europe/Stockholm' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', timezone: 'Europe/Oslo' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', timezone: 'Europe/Copenhagen' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', timezone: 'Europe/Warsaw' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', timezone: 'Europe/Lisbon' },
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷', timezone: 'Europe/Istanbul' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', timezone: 'Asia/Riyadh' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦', timezone: 'Asia/Qatar' },
  { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼', timezone: 'Asia/Kuwait' },
  { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭', timezone: 'Asia/Bahrain' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲', timezone: 'Asia/Muscat' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬', timezone: 'Africa/Cairo' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', timezone: 'Africa/Johannesburg' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', timezone: 'Africa/Lagos' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', timezone: 'Africa/Nairobi' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', timezone: 'America/Sao_Paulo' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', timezone: 'America/Mexico_City' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', timezone: 'America/Santiago' },
  { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴', timezone: 'America/Bogota' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩', timezone: 'Asia/Dhaka' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', timezone: 'Asia/Karachi' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰', timezone: 'Asia/Colombo' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵', timezone: 'Asia/Kathmandu' },
];

export const DEFAULT_COUNTRY = 'IN';

export function getCountryByCode(code) {
  return COUNTRY_CODES.find((c) => c.code === code) || null;
}

export function getCountryByDial(dial) {
  const norm = String(dial || '').trim();
  return COUNTRY_CODES.find((c) => c.dial === norm) || null;
}

/**
 * Validate a national phone number for a given country.
 *  - India: exactly 10 digits, starting with 6/7/8/9.
 *  - Other countries: flexible international — 6 to 15 digits.
 */
export function validatePhoneForCountry(countryCode, nationalNumber) {
  const digits = String(nationalNumber || '').replace(/\D/g, '');
  if (!digits) return { ok: false, reason: 'Phone is required.' };
  if (countryCode === 'IN') {
    if (digits.length !== 10) return { ok: false, reason: 'Indian numbers must be 10 digits.' };
    if (!/^[6-9]/.test(digits)) return { ok: false, reason: 'Indian numbers must start with 6, 7, 8 or 9.' };
    return { ok: true };
  }
  if (digits.length < 6 || digits.length > 15) {
    return { ok: false, reason: 'Phone number must be 6 to 15 digits.' };
  }
  return { ok: true };
}

export function buildFullPhone(country, nationalNumber) {
  const c = typeof country === 'string' ? getCountryByCode(country) : country;
  const dial = c?.dial || '';
  const digits = String(nationalNumber || '').replace(/\D/g, '');
  if (!dial && !digits) return '';
  return `${dial}${digits ? ' ' + digits : ''}`.trim();
}
