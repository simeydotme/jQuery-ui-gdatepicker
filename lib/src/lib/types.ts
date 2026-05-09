export type OverlayMode = boolean | 'month' | 'year';

export interface PickerPosition {
  top: number;
  left: number;
}

export interface GDatepickerProps {
  value?: string;
  placeholder?: boolean | string;
  selectRange?: false | number;
  divider?: string;
  language?: string;
  locale?: string;
  sidebarMonthFormat?: string;
  sidebarYearFormat?: string;
  overlayMonthFormat?: string;
  overlayYearFormat?: string;
  headerDayFormat?: string;
  format?: string;
  formatOutput?: string;
  position?: PickerPosition;
  scrollSpeed?: number;
  overlayWheel?: OverlayMode;
  overlayClick?: OverlayMode;
  overlayKeyboard?: OverlayMode;
  overlayDuration?: number;
  theme?: false | 'purple' | 'midnight' | string;
}

export interface WheelNormalizer {
  consume: (event: WheelEvent) => number;
  reset: () => void;
}
