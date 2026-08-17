# KirpiNova Windows-to-Web Parity Audit

The Windows application at `work/KirpiNova-v11639-verify` is the behavioral reference. The web application is a visual and architectural replacement, not permission to remove product capabilities.

## Migration invariants

1. Never delete an unrecognized field, widget, layout item, or imported record merely because the current web release cannot render it.
2. Normalize known fields at repository boundaries and preserve unknown payloads for later migrations.
3. New dashboard state is included in encrypted cloud vaults and `.knv` archives through `previewStorageKeys`.
4. Existing web users without dashboard state receive the web default once; saved layouts are not overwritten by later defaults.
5. A login-password reset never changes or bypasses the vault passphrase. A future Journal lock must add a real cryptographic boundary rather than a visual gate.
6. Each recovered domain needs round-trip tests covering save, reload, encrypted archive, and cloud-vault collection before it is considered complete.

## Dashboard and widgets

Legacy evidence: `src/js/layout/dashboard-layout.js`, `src/js/layout/customization.js`, `src/js/layout/arranged-engine.js`, and `src/js/widgets/widget-registry.js`.

| Capability | Windows reference | Web status |
| --- | --- | --- |
| Add/remove widgets | Widget library for every non-fixed registry item | Restored in v0.29 foundation |
| Organize widgets | Arranged and freeform drag layouts | Arranged drag and keyboard/button ordering restored; freeform canvas remains planned |
| Resize widgets | Grid and freeform resizing | Width controls restored; pointer resize and explicit height controls remain planned |
| Tidy/reset | Per-page tidy and reset | Reset restored; packing-aware tidy remains planned |
| Multiple dashboard pages | Stats, Finance, Journal | Main dashboard restored first; Finance and Journal canvases remain planned |
| Quick Add | Task, income, expense, journal, document, debts | Actions restored; task saves in place, other direct composers remain planned |
| Quick Notes | Per-instance persistent text | Restored with encrypted workspace persistence |
| Today’s Tasks | Focused task list | Restored |
| Today’s Schedule | Timed moments | Restored; weekly hourly schedule belongs to Tasks/Calendar parity |
| Finance overview | Income, expense, saving, balance | Restored |
| Documents due | Upcoming and overdue records | Restored |
| People overview | Favorite/close people | Restored foundation |
| Analytics | Completion, expenses, wellbeing | Restored as addable widgets |
| Weather, RSS, HTML embed, clocks, countdown, Pomodoro | Rich configurable widgets | Planned |
| Finance charts and metrics | Trend, rate, categories, goals, currency, debt | Planned with Finance parity |
| Journal analytics | Week/month/year wellbeing, mood trend, frequency | Planned with Journal parity |
| Exchange-rate trend | Historical EUR/USD/GBP to TRY | Planned with Finance parity |

## Tasks, subtasks, reminders, and schedule

| Area | Preserved web fields | Missing parity |
| --- | --- | --- |
| Task | id, title, notes, due date, category, priority, done, created date | Recurrence and legacy auxiliary fields require field-level import mapping |
| Subtask | id, text, done | Present |
| Reminder | ISO reminder datetime | Lead-time options and production notification verification remain |
| Schedule | Calendar events and month view | Weekly hourly view, unscheduled lane, drag-to-time, and schedule editing remain |

## Finance

| Area | Current web status | Missing parity |
| --- | --- | --- |
| Transactions | Income, expense, saving, currencies, categories, prior-balance savings | Monthly report export |
| Savings | Transactions and balance-impact distinction | Full goals/tagged-savings management and statistical widgets |
| Subscriptions | Present | Production workflow verification |
| Receipt scanning | Present | Production Gemini and attachment verification |
| Borrowed and lent | Missing | Debt records, repayments, outstanding totals, quick actions, reports |
| Currency exchange | Live report-currency conversion exists | User rate settings, overrides, rate panel, historical chart |
| Reporting | Basic dashboard summaries | Monthly PDF/print/export workflow and legacy report contents |

## Journal

The web model currently keeps id, title, body, date, category, happiness, energy, stress, draft state, and timestamps. Missing parity includes the independent Journal lock, its auto-lock behavior and attempt protection, richer legacy document fields, and the complete analytics canvas. The second lock requires a separately derived encryption key and migration design; it must not be implemented as CSS visibility.

## People

The web model currently keeps name, relationship, group, email, phone, birthday, notes, favorite, and timestamps. The legacy People domain also needs a field-level recovery pass for addresses, multiple contact points, custom fields, important dates, relationship graph data, interaction history, reminders, attachments, archive state, and richer groups. Unknown imported People fields must remain intact until each is mapped.

## Recovery sequence

1. Dashboard foundation and non-destructive layout storage.
2. Weekly hourly schedule and task/calendar field parity.
3. Finance debts, goals, rate settings, reports, and finance widgets.
4. Journal secondary encryption and analytics.
5. Full People schema, relationship graph, history, and attachments.
6. Remaining live widgets and multi-page/freeform dashboard modes.
7. Full Windows export import fixture, encrypted archive round trip, and production deployment verification.