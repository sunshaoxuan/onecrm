# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.0] - 2026-02-09

### Added
- **Backend I18n Service**: Added independent backend under `backend/` with multilingual endpoints:
  - `GET /api/i18n/version`
  - `GET /api/i18n/languages`
  - `GET /api/i18n/resources`
  - `GET /api/i18n/{lang}`
  - `POST /api/i18n/resources`
  - `POST /api/i18n/cache/reload`
- **Object Storage Support**: Added MinIO/S3-compatible repository for i18n data (`I18N_STORE_DRIVER=s3`).
- **MinIO Infra**: Added dedicated OneCRM MinIO compose stack and startup script:
  - `backend/infra/minio/docker-compose.yml`
  - `backend/scripts/start-minio.ps1`
- **Backend Compliance Gate**:
  - `docs/process/STD-09-后端代码合规执行标准.md`
  - `backend/scripts/check-compliance.mjs`
  - `npm run verify` now enforces compliance + tests.

### Changed
- **Document Classification**: Consolidated all project docs into unified `docs/` tree (`design/process/reference/history/templates/test-cases`).
- **Template Numbering**: Separated template numbering from requirement/design numbering:
  - `TPL-API-01-前端驱动接口需求模板.md`
  - `TPL-I18N-01-前端词条需求模板.md`
- **Doc Asset Ownership**: Moved backend docs from `backend/docs` into global project docs (`docs/`).
- **README Refresh**: Updated documentation map, template entry points, and backend capability notes.

### Fixed
- **API Contract Consistency**: Unified response shape to `status/data` and `status/error_code/message`.
- **I18n Data Model**: Added audit fields to stored i18n resources (`id/created_at/updated_at/created_by/updated_by/is_deleted`).

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
