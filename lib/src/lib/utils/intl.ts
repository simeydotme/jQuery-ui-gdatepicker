import type { DateArray } from './date';
import { fromDateArray, toDateArray } from './date';

const LEGACY_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  'en-gb': 'en-GB',
  'zh-cn': 'zh-CN',
  fr: 'fr-FR'
};

const twoDigit = (value: number): string => String(value).padStart(2, '0');

const tokenize = (pattern: string): string[] => {
  const tokenRegex = /\[[^\]]*\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|LL|L/g;
  const out: string[] = [];
  let index = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(pattern)) !== null) {
    if (match.index > index) out.push(pattern.slice(index, match.index));
    out.push(match[0]);
    index = tokenRegex.lastIndex;
  }
  if (index < pattern.length) out.push(pattern.slice(index));
  return out;
};

export const normalizeLocale = (locale: string): string => {
  const lowered = locale.trim().toLowerCase();
  return LEGACY_LOCALE_MAP[lowered] ?? locale;
};

export const formatToken = (date: DateArray, locale: string, pattern: string): string => {
  const d = fromDateArray(date);
  const lang = normalizeLocale(locale);
  if (pattern === 'L') {
    return new Intl.DateTimeFormat(lang).format(d);
  }
  if (pattern === 'LL') {
    return new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
  }

  return tokenize(pattern)
    .map((token) => {
      if (token.startsWith('[') && token.endsWith(']')) return token.slice(1, -1);
      switch (token) {
        case 'YYYY':
          return String(d.getFullYear());
        case 'YY':
          return String(d.getFullYear()).slice(-2);
        case 'M':
          return String(d.getMonth() + 1);
        case 'MM':
          return twoDigit(d.getMonth() + 1);
        case 'D':
          return String(d.getDate());
        case 'DD':
          return twoDigit(d.getDate());
        case 'MMM':
          return new Intl.DateTimeFormat(lang, { month: 'short' }).format(d);
        case 'MMMM':
          return new Intl.DateTimeFormat(lang, { month: 'long' }).format(d);
        case 'ddd':
          return new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(d);
        case 'dddd':
          return new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(d);
        case 'dd':
          return new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(d).slice(0, 2);
        default:
          return token;
      }
    })
    .join('');
};

const localeDateOrder = (locale: string): Array<'day' | 'month' | 'year'> => {
  const parts = new Intl.DateTimeFormat(normalizeLocale(locale)).formatToParts(new Date(2001, 10, 21));
  return parts
    .filter((part) => part.type === 'day' || part.type === 'month' || part.type === 'year')
    .map((part) => part.type as 'day' | 'month' | 'year');
};

export const parseToken = (value: string, locale: string, pattern: string): DateArray | null => {
  const matches = value.match(/\d+/g);
  if (!matches || matches.length < 3) return null;

  if (pattern === 'L' || pattern === 'LL') {
    const order = localeDateOrder(locale);
    const map = new Map(order.map((part, index) => [part, Number(matches[index])])) as Map<'day' | 'month' | 'year', number>;
    const year = map.get('year');
    const month = map.get('month');
    const day = map.get('day');
    if (!year || !month || !day) return null;
    return toDateArray(new Date(year, month - 1, day));
  }

  const tokenOrder = tokenize(pattern).filter((token) => ['YYYY', 'YY', 'MM', 'M', 'DD', 'D'].includes(token));
  if (tokenOrder.length !== matches.length) return null;

  let year = NaN;
  let month = NaN;
  let day = NaN;

  tokenOrder.forEach((token, index) => {
    const valuePart = Number(matches[index]);
    if (token === 'YYYY') year = valuePart;
    if (token === 'YY') year = valuePart + 2000;
    if (token === 'MM' || token === 'M') month = valuePart;
    if (token === 'DD' || token === 'D') day = valuePart;
  });

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return toDateArray(new Date(year, month - 1, day));
};

export const weekdayLabels = (locale: string, format: string): string[] => {
  const monday = new Date(2026, 0, 5);
  return Array.from({ length: 7 }, (_, index) => formatToken(toDateArray(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)), locale, format));
};
