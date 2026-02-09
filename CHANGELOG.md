# Changelog

All notable changes to this project will be documented in this file.

## [v0.2.0] - 2026-02-09

### Added
- **UI Port**: Ported the entire login page design from BobCRM (Calm CRM style).
- **Internationalization (i18n)**: 
    - Added language switcher (ZH/JA/EN).
    - Refactored `App.tsx` to use a `resources` object for all UI text.
    - Created `PROD-04` backend requirement for i18n API.
- **SSO**: Added Google and Microsoft login buttons with SVG icons.
- **Assets**: Added `tokyo01.jpg` and `fujisann01.jpg` hero images.
- **Components**:
    - `AuthShell`: Main layout component for authentication pages.
    - `bob-auth.css`: Styling for the authentication system.

### Changed
- **Layout**: Switched from pure Tailwind grid to a custom CSS Grid layout matching BobCRM.
- **Typography**: 
    - Optimized font sizes for "Calm" aesthetic.
    - Moved registration promo text out of footer for better visibility.
    - Pinned copyright notice to the bottom of the screen.
- **Bug Fixes**:
    - Fixed image carousel infinite loop bug.
    - Fixed login card width constraints (removed artificial limits).
    - Fixed vertical alignment issues in the right-hand panel.

### Removed
- Removed legacy `App.css` styles that conflicted with the new design system.
