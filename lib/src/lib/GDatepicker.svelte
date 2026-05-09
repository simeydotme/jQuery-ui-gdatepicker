<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import type { GDatepickerProps, OverlayMode } from './types';
  import {
    addDays,
    addMonths,
    clampRangeSelection,
    compareDateArrays,
    dateKey,
    differenceInDays,
    getDaysInMonth,
    toDateArray,
    type DateArray
  } from './utils/date';
  import { formatToken, normalizeLocale, parseToken, weekdayLabels } from './utils/intl';
  import { createWheelNormalizer } from './utils/wheel';

  interface DayCell {
    id: string;
    date: DateArray;
    classes: string[];
    disabled: boolean;
  }

  interface NewlineCell {
    classes: string[];
    label: string;
  }

  type CalendarCell = { kind: 'day'; cell: DayCell } | { kind: 'newline'; cell: NewlineCell };

  const dispatch = createEventDispatcher<{ change: { value: string; first: DateArray | null; last: DateArray | null } }>();

  export let value = '';
  export let placeholder: GDatepickerProps['placeholder'] = true;
  export let selectRange: GDatepickerProps['selectRange'] = false;
  export let divider = ' - ';
  export let language = 'en';
  export let locale: string | undefined = undefined;
  export let sidebarMonthFormat = 'MMMM';
  export let sidebarYearFormat = 'YYYY';
  export let overlayMonthFormat = 'MMM[, ]YYYY';
  export let overlayYearFormat = 'YYYY';
  export let headerDayFormat = 'dd';
  export let format = 'L';
  export let formatOutput = 'LL';
  export let position = { top: 3, left: 0 };
  export let scrollSpeed = 300;
  export let overlayWheel: OverlayMode = true;
  export let overlayClick: OverlayMode = 'year';
  export let overlayKeyboard: OverlayMode = true;
  export let overlayDuration = 1000;
  export let theme: GDatepickerProps['theme'] = false;

  const uid = `gdp-${Math.random().toString(36).slice(2, 10)}`;
  const wheelNormalizer = createWheelNormalizer();

  let picker!: HTMLDivElement;
  let firstInput!: HTMLInputElement;
  let secondInput: HTMLInputElement | undefined;
  let hiddenInput!: HTMLInputElement;

  let isVisible = false;
  let overlayVisible = false;
  let overlayText = '';
  let overlayTimer: ReturnType<typeof setTimeout> | undefined;

  let selectedFirst: DateArray | null = null;
  let selectedLast: DateArray | null = null;
  let selectFirstToggle = true;

  const today = toDateArray(new Date());
  let activeMonth = today[1];
  let activeYear = today[0];

  let internalValue = value;
  let firstView = '';
  let secondView = '';
  let headerDays: string[] = [];
  let calendarCells: CalendarCell[] = [];

  let resolvedLocale = normalizeLocale(locale ?? language);
  let themeClass = theme ? `ui-gdatepicker-theme-${theme}` : '';
  let placeholderText = '';

  $: resolvedLocale = normalizeLocale(locale ?? language);
  $: themeClass = theme ? `ui-gdatepicker-theme-${theme}` : '';
  $: placeholderText =
    placeholder === false
      ? formatToken(today, resolvedLocale, formatOutput)
      : typeof placeholder === 'string'
        ? placeholder
        : formatToken(today, resolvedLocale, formatOutput);

  const updateOutputs = () => {
    firstView = selectedFirst ? formatToken(selectedFirst, resolvedLocale, formatOutput) : '';
    secondView = selectedLast ? formatToken(selectedLast, resolvedLocale, formatOutput) : '';

    if (selectedFirst) {
      const firstHidden = formatToken(selectedFirst, resolvedLocale, format);
      if (selectRange && selectedLast) {
        internalValue = `${firstHidden}${divider}${formatToken(selectedLast, resolvedLocale, format)}`;
      } else {
        internalValue = firstHidden;
      }
    } else {
      internalValue = '';
    }

    value = internalValue;
    dispatch('change', { value: internalValue, first: selectedFirst, last: selectedLast });
  };

  const showOverlay = (eventType: 'wheel' | 'click' | 'keyboard', type: 'month' | 'year') => {
    const shouldShow = (mode: OverlayMode): boolean => !!mode && (mode === true || mode === type);
    const allowed =
      (eventType === 'wheel' && shouldShow(overlayWheel)) ||
      (eventType === 'click' && shouldShow(overlayClick)) ||
      (eventType === 'keyboard' && shouldShow(overlayKeyboard));

    if (!allowed) return;

    const formatString = type === 'year' ? overlayYearFormat : overlayMonthFormat;
    overlayText = formatToken([activeYear, activeMonth, 1], resolvedLocale, formatString);
    overlayVisible = true;

    if (overlayTimer) clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => {
      overlayVisible = false;
    }, overlayDuration);
  };

  const parseInitialValue = () => {
    const [firstRaw, lastRaw] = value.split(divider);
    if (!firstRaw) return;

    const first = parseToken(firstRaw.trim(), resolvedLocale, format);
    if (!first) return;

    selectedFirst = first;
    activeMonth = first[1];
    activeYear = first[0];

    if (selectRange) {
      const second = lastRaw ? parseToken(lastRaw.trim(), resolvedLocale, format) : first;
      if (second) {
        selectedLast = second;
      }
      selectFirstToggle = !lastRaw;
    }

    updateOutputs();
  };

  const selectedKeySet = (): Set<string> => {
    const keys = new Set<string>();
    if (!selectedFirst) return keys;

    if (!selectRange || !selectedLast) {
      keys.add(dateKey(selectedFirst));
      return keys;
    }

    const diff = differenceInDays(selectedFirst, selectedLast) ?? 0;
    for (let i = 0; i <= diff; i += 1) {
      keys.add(dateKey(addDays(selectedFirst, i)));
    }

    return keys;
  };

  const dimKeySet = (): Set<string> => {
    const keys = new Set<string>();
    if (!selectRange || !selectedFirst || selectFirstToggle || typeof selectRange !== 'number') return keys;

    for (let i = 0; i <= selectRange; i += 1) {
      keys.add(dateKey(addDays(selectedFirst, i)));
    }

    return keys;
  };

  const rebuildCalendar = () => {
    const selected = selectedKeySet();
    const available = dimKeySet();
    const todayKey = dateKey(today);

    headerDays = weekdayLabels(resolvedLocale, headerDayFormat);

    calendarCells = [];
    const begin = addMonths(activeMonth, activeYear, -1);

    for (let monthOffset = 0; monthOffset < 5; monthOffset += 1) {
      const current = addMonths(begin.month, begin.year, monthOffset);
      const month = current.month;
      const year = current.year;
      const daysInMonth = getDaysInMonth(month, year);
      const firstDay = new Date(year, month, 1).getDay() || 7;

      if (monthOffset === 0) {
        const prevMonthData = addMonths(month, year, -1);
        const prevMonthDays = getDaysInMonth(prevMonthData.month, prevMonthData.year);
        for (let filler = firstDay - 1; filler > 0; filler -= 1) {
          const day = prevMonthDays - filler + 1;
          calendarCells.push({
            kind: 'day',
            cell: {
              id: `${uid}-${day}-${prevMonthData.month}-${prevMonthData.year}-f`,
              date: [prevMonthData.year, prevMonthData.month, day],
              classes: ['ui-gdatepicker-day', 'ui-gdatepicker-previous-month'],
              disabled: true
            }
          });
        }
      }

      const monthLabel = formatToken([year, month, 1], resolvedLocale, sidebarMonthFormat);
      const yearLabel = year === today[0] ? '' : formatToken([year, month, 1], resolvedLocale, sidebarYearFormat);

      for (let day = 1; day <= daysInMonth; day += 1) {
        const currentDate: DateArray = [year, month, day];
        const key = dateKey(currentDate);
        const classes = ['ui-gdatepicker-day'];

        if (monthOffset === 0) classes.push('ui-gdatepicker-previous-month');
        if (year === activeYear && month === activeMonth) classes.push('ui-gdatepicker-current-month');
        if (key === todayKey) classes.push('ui-gdatepicker-today');
        if (selected.has(key)) classes.push('ui-gdatepicker-selected');
        if (available.size && !available.has(key)) classes.push('ui-gdatepicker-dim');

        const firstWeek = day <= 7;
        const dividerLeft = day === 1 && firstDay > 1;
        if (firstWeek) classes.push('ui-gdatepicker-divider-top');
        if (dividerLeft) classes.push('ui-gdatepicker-divider-left');

        calendarCells.push({
          kind: 'day',
          cell: {
            id: `${uid}-${day}-${month}-${year}`,
            date: currentDate,
            classes,
            disabled: false
          }
        });

        if ((firstDay + (day - 1)) % 7 === 0) {
          const label = firstDay + (day - 1) < 8 ? `${monthLabel} ${yearLabel}`.trim() : '';
          calendarCells.push({
            kind: 'newline',
            cell: {
              classes: ['ui-gdatepicker-newline', ...(year === activeYear && month === activeMonth ? ['ui-gdatepicker-current-month'] : [])],
              label
            }
          });
        }
      }
    }
  };

  const openPicker = () => {
    isVisible = true;
    const origin = firstInput.getBoundingClientRect();
    picker.style.top = `${window.scrollY + origin.top + firstInput.offsetHeight + position.top}px`;
    picker.style.left = `${window.scrollX + origin.left + position.left}px`;
  };

  const hidePicker = () => {
    isVisible = false;
    if (selectRange && selectedFirst && !selectedLast) {
      selectedLast = selectedFirst;
      updateOutputs();
    }
  };

  const selectDate = (date: DateArray) => {
    if (selectFirstToggle) {
      selectedFirst = date;
      selectedLast = null;
      if (selectRange) selectFirstToggle = false;
    } else {
      if (selectedFirst && compareDateArrays(date, selectedFirst) < 0) {
        selectedFirst = date;
        selectedLast = null;
        selectFirstToggle = false;
      } else {
        selectedLast = date;
        selectFirstToggle = true;
      }
    }

    if (selectRange && typeof selectRange === 'number' && selectedFirst && selectedLast) {
      selectedLast = clampRangeSelection(selectedFirst, selectedLast, selectRange);
      selectFirstToggle = true;
    }

    updateOutputs();
    rebuildCalendar();
  };

  const goMonth = (delta: number, select = false) => {
    const next = addMonths(activeMonth, activeYear, delta);
    activeMonth = next.month;
    activeYear = next.year;
    if (select && selectedFirst) {
      const day = Math.min(selectedFirst[2], getDaysInMonth(activeMonth, activeYear));
      const base: DateArray = [activeYear, activeMonth, day];
      selectDate(base);
    }
    rebuildCalendar();
  };

  const goYear = (delta: number, select = false) => {
    activeYear += delta;
    if (select && selectedFirst) {
      const day = Math.min(selectedFirst[2], getDaysInMonth(activeMonth, activeYear));
      selectDate([activeYear, activeMonth, day]);
    }
    rebuildCalendar();
  };

  const moveSelectedByDay = (delta: number) => {
    const base = selectedFirst ?? today;
    const next = addDays(base, delta);
    activeMonth = next[1];
    activeYear = next[0];
    selectedFirst = next;
    if (selectedLast) {
      selectedLast = addDays(selectedLast, delta);
    }
    updateOutputs();
    rebuildCalendar();
  };

  const handleDayClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>('.ui-gdatepicker-day[data-date]');
    if (!button) return;
    const raw = button.dataset.date;
    if (!raw) return;
    const [y, m, d] = raw.split('-').map(Number);
    selectDate([y, m, d]);
  };

  const handleBodyKeyboard = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    handleDayClick(event as unknown as MouseEvent);
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const steps = wheelNormalizer.consume(event);
    if (!steps) return;

    if (event.shiftKey) {
      goYear(steps);
      showOverlay('wheel', 'year');
      return;
    }

    goMonth(steps);
    showOverlay('wheel', 'month');
  };

  const clearFirst = () => {
    selectedFirst = null;
    selectedLast = null;
    selectFirstToggle = true;
    updateOutputs();
    rebuildCalendar();
  };

  const clearSecond = () => {
    if (!selectedFirst) return;
    selectedLast = null;
    selectFirstToggle = false;
    updateOutputs();
    rebuildCalendar();
  };

  const handleKeyboard = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hidePicker();
      return;
    }
    if (event.key === 'Tab') {
      hidePicker();
      return;
    }

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();

    const backwards = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    const delta = backwards ? -1 : 1;

    if (event.ctrlKey) {
      goYear(delta, true);
      showOverlay('keyboard', 'year');
      return;
    }

    if (event.shiftKey) {
      goMonth(delta, true);
      showOverlay('keyboard', 'month');
      return;
    }

    moveSelectedByDay(delta);
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!isVisible) return;
    if (picker.contains(target) || firstInput.contains(target) || (secondInput && secondInput.contains(target))) return;
    hidePicker();
  };

  onMount(() => {
    parseInitialValue();
    updateOutputs();
    rebuildCalendar();
    document.addEventListener('mousedown', handleDocumentClick);
  });

  onDestroy(() => {
    if (overlayTimer) clearTimeout(overlayTimer);
    document.removeEventListener('mousedown', handleDocumentClick);
    wheelNormalizer.reset();
  });

  $: if (isVisible) {
    rebuildCalendar();
  }
</script>

<div class={`ui-gdatepicker-input-wrapper ${themeClass}`}>
  <input
    bind:this={firstInput}
    class={`ui-gdatepicker-input ${isVisible ? 'ui-gdatepicker-active' : ''}`}
    type="text"
    readonly
    placeholder={placeholderText}
    value={firstView}
    onfocus={openPicker}
    onkeydown={handleKeyboard}
  />
  <button class="ui-gdatepicker-empty" type="button" onclick={clearFirst}>Clear</button>
</div>

{#if selectRange}
  <div class={`ui-gdatepicker-input-wrapper ui-gdatepicker-second-input-wrapper ${themeClass}`}>
    <input
      bind:this={secondInput}
      class={`ui-gdatepicker-input ui-gdatepicker-second-input ${isVisible ? 'ui-gdatepicker-active' : ''}`}
      type="text"
      readonly
      placeholder={placeholderText}
      value={secondView}
      onfocus={openPicker}
      onkeydown={handleKeyboard}
    />
    <button class="ui-gdatepicker-empty ui-gdatepicker-second-empty" type="button" onclick={clearSecond}>Clear</button>
  </div>
{/if}

<input bind:this={hiddenInput} class="has-gdatepicker" type="text" value={internalValue} readonly />

<div
  bind:this={picker}
  class={`ui-gdatepicker ${themeClass} ui-gdatepicker-${resolvedLocale.toLowerCase()} ${isVisible ? 'ui-gdatepicker-show' : ''}`}
  onwheel={handleWheel}
>
  <div class="ui-gdatepicker-wrapper">
    <div class="ui-gdatepicker-head">
      {#each headerDays as day}
        <span class="ui-gdatepicker-day ui-gdatepicker-header-day">{day}</span>
      {/each}
    </div>

    <div
      class="ui-gdatepicker-body"
      role="grid"
      tabindex="-1"
      onclick={handleDayClick}
      onkeydown={handleBodyKeyboard}
      style={`scroll-behavior: smooth; transition-duration: ${scrollSpeed}ms;`}
    >
      {#each calendarCells as row, index}
        {#if row.kind === 'day'}
          <span
            id={row.cell.id}
            class={row.cell.classes.join(' ')}
            data-date={row.cell.disabled ? undefined : `${row.cell.date[0]}-${row.cell.date[1]}-${row.cell.date[2]}`}
            data-day={row.cell.disabled ? undefined : row.cell.date[2]}
            data-month={row.cell.disabled ? undefined : row.cell.date[1]}
            data-year={row.cell.disabled ? undefined : row.cell.date[0]}
          >{row.cell.date[2]}</span>
        {:else}
          <span class={['ui-gdatepicker-monthname', ...row.cell.classes].join(' ')}>{row.cell.label}</span><br />
        {/if}
      {/each}
    </div>

    <button class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up" type="button" onclick={() => { goMonth(-1); showOverlay('click', 'month'); }}>
      <span>previous month</span>
    </button>
    <button class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down" type="button" onclick={() => { goMonth(1); showOverlay('click', 'month'); }}>
      <span>next month</span>
    </button>
    <button class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-up-year" type="button" onclick={() => { goYear(-1); showOverlay('click', 'year'); }}>
      <span>previous year</span>
    </button>
    <button class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-down-year" type="button" onclick={() => { goYear(1); showOverlay('click', 'year'); }}>
      <span>next year</span>
    </button>

    <div class={`ui-gdatepicker-overlay ${overlayVisible ? 'ui-gdatepicker-overlay-visible' : ''}`}>{overlayText}</div>
    <button class="ui-gdatepicker-close" type="button" onclick={hidePicker}>Close</button>
  </div>
</div>
