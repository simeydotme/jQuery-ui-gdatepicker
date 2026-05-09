export type DateArray = [number, number, number];

export const toDateArray = (date: Date): DateArray => [date.getFullYear(), date.getMonth(), date.getDate()];

export const fromDateArray = (value: DateArray): Date => new Date(value[0], value[1], value[2]);

export const dateKey = (value: DateArray): string => `${value[0]}-${value[1]}-${value[2]}`;

export const getDaysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate();

export const addMonths = (month: number, year: number, step: number): { month: number; year: number } => {
  const date = new Date(year, month + step, 1);
  return { month: date.getMonth(), year: date.getFullYear() };
};

export const addDays = (value: DateArray, days: number): DateArray => {
  const next = new Date(value[0], value[1], value[2] + days);
  return toDateArray(next);
};

export const compareDateArrays = (a: DateArray, b: DateArray): number => {
  const left = Date.UTC(a[0], a[1], a[2]);
  const right = Date.UTC(b[0], b[1], b[2]);
  return left === right ? 0 : left < right ? -1 : 1;
};

export const differenceInDays = (first: DateArray, second: DateArray | null): number | null => {
  if (!second) return null;
  const left = Date.UTC(first[0], first[1], first[2]);
  const right = Date.UTC(second[0], second[1], second[2]);
  return Math.round((right - left) / 86400000);
};

export const clampRangeSelection = (first: DateArray, last: DateArray, maxDays: number): DateArray => {
  const diff = differenceInDays(first, last) ?? 0;
  if (diff <= maxDays) return last;
  return addDays(first, maxDays);
};
