# KirpiNova Web Design System

<!-- impeccable:design-schema 1 -->

## Design Thesis

KirpiNova turns the complexity of everyday life into a clear, connected field of information. The system is cool, geometric, spacious, and precise, using a teal-led palette, FORT typography, restrained surfaces, and consistent semantic color.

## Experience Mode

Operate. Brand expression never obscures navigation, content, state, controls, errors, or data.

## Core Tokens

- Brand teal: `#009F98` light / `#35D2C8` dark.
- Deep field: `#07343E` light / `#071C22` dark.
- Canvas: `#F4F8F8` light / `#061418` dark.
- Surface: `#FFFFFF` light / `#0B2025` dark.
- Text: `#123038` light / `#EFF8F7` dark.
- Income and success are green.
- Expenses and destructive actions are red.
- Savings and warnings are amber.
- Available balance and information are blue.
- Journal and wellbeing use violet selectively.

## Typography

Use FORT Book for body text, FORT Medium for headings and controls, and FORT Bold sparingly for significant values. Until licensed WOFF2 files are supplied, use `"Avenir Next", "Segoe UI", Arial, sans-serif` as the fallback.

## Shell Structure

The primary dashboard uses a life horizon:

1. **Now** - today's schedule and immediate attention.
2. **Next** - active tasks and near-term commitments.
3. **Later** - monthly finance and broader context.
4. **Shared** - family information and shared responsibilities.

Desktop uses stable left navigation. Mobile uses bottom navigation for high-frequency destinations. Light and dark themes receive equal component and state coverage.

## Component Rules

- Use open layout, alignment, and dividers before adding containers.
- Cards are reserved for movable widgets or selectable records.
- Use 12px radii, 8px compact-control radii, and tonal 1px borders.
- Minimum interactive target is 44px.
- Every field has a visible label and theme-aware focus ring.
- Tables and financial values use tabular numerals.
- Status is never communicated by color alone.
- Dialogs are reserved for focused or protected actions.
- Motion explains continuity and respects reduced-motion preferences.

## Customizable Dashboard

- Dashboard cards are the intentional exception to the open-layout preference because users own and arrange them.
- Use a 12-column arranged grid on desktop. Organize mode must expose visible add, move, resize, remove, and reset controls; every pointer action needs a keyboard-operable equivalent.
- Use the native modal dialog pattern for the widget library, including cancel, close, backdrop, and focus behavior.
- Removing or resetting a widget must preserve its configuration so restoring it does not erase user content such as Quick Notes.
- Preserve unknown widget and layout fields during normalization and encrypted backup round-trips so newer or imported layouts degrade safely.
- On mobile, widgets stack into a single readable column. Do not rely on drag-and-drop there; retain explicit ordering controls.

## Accessibility

Target WCAG 2.2 AA. Support keyboard operation, visible focus, semantic controls, assistive labels, 200% zoom, reduced motion, and theme-safe contrast.

## Asset Boundary

The approved KirpiNova SVG logo and licensed FORT WOFF2 files have not yet been supplied. The milestone uses a clearly provisional geometric mark and documented fallback font. Replace both during the branding-assets milestone; do not imitate or reuse Rubrik's marks.
