# Changelog

## [Commit: 6d34e5a] - Monday, June 15, 2026 at 12:58 PM
**Message:** refactor: Redesigned Public Hub with Sidebar Layout and enhanced Match Pulse UI
**Time Tracked Since Last Save:** ~1 Days

### High-Level Summary of Changes:
- **Modified:** `src/public-hub/LiveMatchPulseCenter.js`
- **Modified:** `src/public-hub/PublicHubApp.js`

---


**Total Session Time:** ~45 Minutes (Based on dev server runtime metrics)

## Authentication & Onboarding
- **Dynamic Context Selection:** Upgraded the `/login` and `/signup` pages to dynamically fetch the latest `leagues` and `teams` directly from the backend API.
- **Classic UI Restored:** Reverted the experimental 3-step wizard flow back to the preferred, single-page "classic" UI. Integrated clean `<select>` dropdowns for "Competition Context" and "Franchise Account" directly into the primary forms.
- **Session Integration:** Configured the frontend so that when `Analysts` and `Managers` sign up or log in, their selected League and Team are automatically injected into the `SessionContext`, ensuring a seamless transition to the dashboard.
- **Auto-Selection:** Forms now intelligently pre-select the first "Active" league upon page load.

## Security & Access Control
- **Dynamic Access Window:** Implemented the `isLeagueActive` function to strictly enforce the ±21 day access rule for tournament data.
- **International Bypass Fix:** Patched a strict case-sensitive bug that was blocking International series. The logic now aggressively scans both `seriesType` and `name` (case-insensitive) for the word "international" to guarantee uninterrupted access.

## Maintenance & Code Health
- **React Warnings Resolved:** Addressed multiple ESLint compilation warnings across the dashboards.
  - Added missing dependencies (`API_URL`, `selectedLeagueId`, `selectedTeamId`) to `useEffect` hooks in `DashboardManager.js` and `DashboardAnalyst.js`.
  - Removed unused imports (e.g., `Users` icon) to clean up terminal outputs.
  - Safely ignored the `liveLogs` telemetry warning in `DashboardManager.js` using inline ESLint disable rules.

## Infrastructure & API Diagnostics
- **RapidAPI Audit:** Ran an active audit on the `cricbuzz-cricket` RapidAPI endpoints to explore expanding data fetching capabilities (Domestic, Bi-lateral, Friendly).
- **Quota Exceeded Detection:** Diagnosed and identified a hard `429 Too Many Requests` API block. Confirmed that the "BASIC" (Free) tier monthly limit of 200 requests has been successfully exhausted, safeguarding the account from any hidden or unexpected financial charges.

---

## [Commit: de27be8] - Saturday, June 13, 2026 at 03:32 PM
**Message:** feat: Restored classic Auth UI with dynamic Context Selection
**Time Tracked Since Last Save:** ~10 Days

### High-Level Summary of Changes:
- **Added:** `implementation_plan(futuer plan)` - *Saved the future implementation roadmap for API expansion.*
- **Added:** `scripts/generate_changelog.js` - *Created the Node.js script that automatically generates these commit logs.*
- **Added:** `server/models/League.js` - *Created new MongoDB schema to store competition data from the RapidAPI.*
- **Added:** `server/models/Team.js` - *Created new MongoDB schema to map teams/franchises to specific leagues.*
- **Added:** `server/scripts/collect_league_data.py` - *Built Python pipeline to fetch and store active leagues from Cricbuzz.*
- **Added:** `server/scripts/collect_team_data.py` - *Built Python pipeline to fetch team metadata for the active leagues.*
- **Added:** `server/scripts/migrate_players.js` - *Created migration script to attach legacy player accounts to the new `currentTeamId` field.*
- **Added:** `src/context/SessionContext.js` - *Implemented a React Context provider to globally manage `selectedLeagueId` and `selectedTeamId`.*
- **Modified:** `server/models/LiveMatch.js` - *Updated schema structure to better associate matches with their parent leagues.*
- **Modified:** `server/models/Player.js` - *Added `activeLeagueIds` array and `currentTeamId` reference to filter players.*
- **Modified:** `server/package.json` & `package-lock.json` - *Updated backend dependencies.*
- **Modified:** `server/routes/analytics.js` - *Filtered analytics API endpoints using `activeLeagueIds` and `currentTeamId`.*
- **Modified:** `server/routes/players.js` - *Ensured player fetching routes strictly adhere to `active=true` and team/league filters.*
- **Modified:** `server/routes/public.js` - *Opened public endpoints to bypass the 21-day lock for the public archives.*
- **Modified:** `server/scripts/collect_match_data.py` - *Adjusted data scraping logic to accommodate the new League references.*
- **Modified:** `server/scripts/collect_player_data.py` - *Added logic to capture a player's `currentTeamId` during data collection.*
- **Modified:** `src/App.js` - *Wrapped the main application routing tree with the new `SessionProvider`.*
- **Modified:** `src/pages/Dashboard.js` - *Refactored to fetch data using `SessionContext` values instead of legacy auth context.*
- **Modified:** `src/pages/DashboardAnalyst.js` - *Added specific `useEffect` dependencies to fix ESLint warnings.*
- **Modified:** `src/pages/DashboardManager.js` - *Fixed unused `liveLogs` warning and updated data fetching context.*
- **Modified:** `src/pages/Login.js` - *Reverted to classic UI but embedded new League and Team dropdowns linked to context.*
- **Modified:** `src/pages/Signup.js` - *Reverted to classic UI and embedded dynamic League/Team dropdowns.*
- **Modified:** `src/public-hub/LiveMatchPulseCenter.js` - *Ensured the public pulse center bypasses internal league locks.*
- **Modified:** `src/public-hub/PlayerEncyclopedia.js` - *Ensured public archive remains fully accessible regardless of season date.*

## [Commit: 6d34e5a] - Monday, June 15, 2026 at 12:58 PM
**Message:** refactor: Redesigned Public Hub with Sidebar Layout and enhanced Match Pulse UI
**Time Tracked Since Last Save:** ~1 Days

### High-Level Summary of Changes:
- **Modified:** `src/public-hub/LiveMatchPulseCenter.js`
- **Modified:** `src/public-hub/PublicHubApp.js`
