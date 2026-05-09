# gDatepicker (Svelte + TypeScript rewrite)

A modern rewrite of the original jQuery gDatepicker using:

- **Svelte 5**
- **TypeScript**
- **TailwindCSS (v4)**
- **Intl (native)** for date localization/formatting (no Moment.js)

Library styling is implemented in Tailwind component layers in:

- `lib/src/app.css`

and no longer depends on importing the legacy copied `jquery.gdatepicker*.css` files at runtime.

## Goals covered

- Preserves original visual style (default/purple/midnight themes)
- Preserves single-date and range-date interactions
- Keeps and expands i18n through `Intl` locale support
- Adds normalized mouse wheel + trackpad navigation behavior
- Includes test coverage with Vitest + Testing Library
- Includes a simple demo page (the app itself) suitable for GitHub Pages

## Development

```bash
cd /home/runner/work/jQuery-ui-gdatepicker/jQuery-ui-gdatepicker/lib
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Type checking

```bash
npm run check
```

## Production build

```bash
npm run build
```

## GitHub Pages build

```bash
npm run build:ghpages
```

## Usage

```svelte
<script lang="ts">
  import { GDatepicker } from './src/lib';
  let value = '';
</script>

<GDatepicker bind:value={value} language="en-gb" format="L" formatOutput="LL" />
```

## Props

`GDatepicker` supports the legacy-oriented options surface:

- `value` (bindable)
- `placeholder`
- `selectRange`
- `divider`
- `language` / `locale`
- `sidebarMonthFormat`
- `sidebarYearFormat`
- `overlayMonthFormat`
- `overlayYearFormat`
- `headerDayFormat`
- `format`
- `formatOutput`
- `position`
- `scrollSpeed`
- `overlayWheel`
- `overlayClick`
- `overlayKeyboard`
- `overlayDuration`
- `theme`
