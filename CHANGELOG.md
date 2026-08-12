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

## [Commit: b42d26b] - Sunday, July 19, 2026 at 11:12 PM
**Message:** Fix Netlify build by pinning Node.js version to 18
**Time Tracked Since Last Save:** ~34 Days

### High-Level Summary of Changes:
- **Added:** `.node-version`
- **Added:** `CHANGELOG.md`
- **Modified:** `project_status_report.md`
- **Modified:** `scripts/generate_changelog.js`
- **Added:** `server/config/injuryRules.json`
- **Added:** `server/config/recoveryMapping.json`
- **Added:** `server/models/PlayerAssessment.js`
- **Added:** `server/models/PlayerHealthEvent.js`
- **Added:** `server/models/PlayerMedicalProfile.js`
- **Added:** `server/models/PlayerRecovery.js`
- **Added:** `server/routes/injuryIntelligence.js`
- **Modified:** `server/routes/players.js`
- **Modified:** `server/routes/public.js`
- **Added:** `server/scripts/seed_t20_league.js`
- **Added:** `server/scripts/seed_womens_t20_2024.js`
- **Added:** `server/seed_users.js`
- **Modified:** `server/server.js`
- **Added:** `server/services/cricketDataProvider.js`
- **Added:** `server/services/exerciseEngine.js`
- **Added:** `server/services/liveMatchEngine.js`
- **Added:** `server/services/medicalProfileBuilder.js`
- **Added:** `server/services/news/index.js`
- **Added:** `server/services/news/providers/BaseProvider.js`
- **Added:** `server/services/news/providers/GNewsProvider.js`
- **Added:** `server/services/news/providers/NewsAPIProvider.js`
- **Added:** `server/services/nlp/nlpProcessor.js`
- **Added:** `server/services/predictionEngine.js`
- **Added:** `server/services/recommendationEngine.js`
- **Added:** `server/services/recoveryEngine.js`
- **Added:** `server/services/ruleEngine.js`
- **Added:** `server/services/timelineService.js`
- **Modified:** `src/App.js`
- **Modified:** `src/pages/CricketLab.js`
- **Modified:** `src/pages/DashboardAnalyst.js`
- **Modified:** `src/pages/DashboardManager.js`
- **Modified:** `src/pages/Login.js`
- **Modified:** `src/pages/PlayerBio.js`
- **Modified:** `src/pages/Players.js`
- **Modified:** `src/public-hub/LiveMatchPulseCenter.js`
- **Modified:** `src/public-hub/MatchCanvas.js`
- **Modified:** `src/public-hub/PublicHubApp.js`

---


## [Commit: 9fdba93] - Tuesday, July 21, 2026 at 10:34 AM
**Message:** Add _redirects for Netlify SPA routing
**Time Tracked Since Last Save:** ~1 Days

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Added:** `public/_redirects`

---


## [Commit: fa02812] - Wednesday, August 12, 2026 at 10:10 AM
**Message:** Update Kinetix AI features, components, and documentation
**Time Tracked Since Last Save:** ~21 Days

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Added:** `KINETIX_AI_RESEARCH_PAPER_FULL.md`
- **Added:** `Kinetix_AI_Master_Technical_Documentation_and_Viva_Handbook.pdf`
- **Added:** `Kinetix_AI_Research_Paper.pdf`
- **Added:** `PROJECT_MASTER_REPORT.md`
- **Added:** `Research Paper/researchpaper.docx`
- **Modified:** `package.json`
- **Added:** `scripts/generate_master_handbook.py`
- **Added:** `server/cricbuzz.html`
- **Modified:** `server/middleware/auth.js`
- **Modified:** `server/models/User.js`
- **Modified:** `server/package-lock.json`
- **Modified:** `server/package.json`
- **Modified:** `server/routes/admin.js`
- **Added:** `server/scripts/seed_admin_panel_data.js`
- **Modified:** `server/scripts/seed_users.js`
- **Modified:** `server/server.js`
- **Modified:** `server/services/cricketDataProvider.js`
- **Added:** `server/test_scraper.js`
- **Modified:** `src/App.js`
- **Modified:** `src/components/AnalyticsTracker.js`
- **Added:** `src/components/GlobalSearch.js`
- **Modified:** `src/components/Navbar.js`
- **Added:** `src/components/NotificationDropdown.js`
- **Added:** `src/components/ProfileDropdown.js`
- **Added:** `src/components/PublicSettingsModal.js`
- **Modified:** `src/context/AuthContext.js`
- **Added:** `src/pages/AdminPanel.js`
- **Modified:** `src/pages/CricketLab.js`
- **Modified:** `src/pages/Login.js`
- **Modified:** `src/pages/Signup.js`
- **Modified:** `src/public-hub/LiveMatchPulseCenter.js`
- **Modified:** `src/public-hub/PlayerEncyclopedia.js`
- **Modified:** `src/public-hub/PublicHubApp.js`
- **Modified:** `src/styles/App.css`
- **Modified:** `src/utils/apiService.js`
- **Added:** `src/utils/publicStorage.js`
- **Added:** `temp.json`
- **Added:** `temp_matches.txt`
- **Added:** `vercel.json`

---


## [Commit: 2d62229] - Wednesday, August 12, 2026 at 10:15 AM
**Message:** Fix Vercel serverless API routing and add backend handler
**Time Tracked Since Last Save:** ~5 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Added:** `api/index.js`
- **Modified:** `package.json`
- **Modified:** `server/server.js`
- **Modified:** `vercel.json`

---


## [Commit: c339e9e] - Wednesday, August 12, 2026 at 10:45 AM
**Message:** Add maxTimeMS database query timeout and fallback handlers for login and dashboard
**Time Tracked Since Last Save:** ~29 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/routes/auth.js`
- **Modified:** `server/routes/dashboard.js`
- **Modified:** `server/seed_users.js`
- **Modified:** `server/server.js`

---


## [Commit: 0e735e0] - Wednesday, August 12, 2026 at 10:47 AM
**Message:** Update Kinetix AI features, components, and documentation
**Time Tracked Since Last Save:** ~1 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`

---


## [Commit: dab2b5e] - Wednesday, August 12, 2026 at 10:47 AM
**Message:** Fix Vercel serverless API routing and add backend handler
**Time Tracked Since Last Save:** ~0 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`

---


## [Commit: fc815f4] - Wednesday, August 12, 2026 at 10:49 AM
**Message:** Completely eliminate 10000ms buffering timeouts across all backend routes and middleware
**Time Tracked Since Last Save:** ~2 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/middleware/tracker.js`
- **Modified:** `server/routes/admin.js`
- **Modified:** `server/routes/analytics.js`
- **Modified:** `server/routes/injuryIntelligence.js`
- **Modified:** `server/routes/players.js`
- **Modified:** `server/routes/public.js`

---


## [Commit: 017a5a5] - Wednesday, August 12, 2026 at 10:52 AM
**Message:** Replace fictional team name Rockets with real team opponent vs Australia
**Time Tracked Since Last Save:** ~2 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `src/pages/DashboardPlayer.js`

---


## [Commit: bdfaaf0] - Wednesday, August 12, 2026 at 10:58 AM
**Message:** Integrate real-life last match performance card and dynamic Cricbuzz match feed into Player Dashboard
**Time Tracked Since Last Save:** ~6 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/test_scraper.js`
- **Modified:** `src/pages/DashboardPlayer.js`

---


## [Commit: 9496e6b] - Wednesday, August 12, 2026 at 11:01 AM
**Message:** Make Personal Trajectory chart 100% dynamic with LATEST vs SEASON tabs, tooltips, and real match datasets
**Time Tracked Since Last Save:** ~2 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `src/components/DashboardChart.js`
- **Modified:** `src/pages/DashboardPlayer.js`

---


## [Commit: 9e2a3af] - Wednesday, August 12, 2026 at 11:06 AM
**Message:** Configure role-based dashboard rendering so Manager gets Manager Command Center, Analyst gets Analyst Center, and Player gets Player Portal
**Time Tracked Since Last Save:** ~4 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `src/pages/Dashboard.js`

---


## [Commit: 99e68e0] - Wednesday, August 12, 2026 at 11:09 AM
**Message:** Add Quick Demo Role Selector on Login page and fix role detection for manager/manger spelling
**Time Tracked Since Last Save:** ~3 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/routes/auth.js`
- **Modified:** `src/pages/Login.js`

---


## [Commit: 88404bf] - Wednesday, August 12, 2026 at 11:12 AM
**Message:** Enforce strict role normalization in AuthContext and add direct role dashboard links in Navbar and ProfileDropdown
**Time Tracked Since Last Save:** ~3 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `src/components/Navbar.js`
- **Modified:** `src/components/ProfileDropdown.js`
- **Modified:** `src/context/AuthContext.js`

---


## [Commit: cd26578] - Wednesday, August 12, 2026 at 11:15 AM
**Message:** Populate full squad roster (16 India squad players + Australia + England) and fix team filter in Players page and server API
**Time Tracked Since Last Save:** ~2 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/routes/players.js`
- **Modified:** `src/pages/Players.js`

---


## [Commit: 6d6c2d8] - Wednesday, August 12, 2026 at 11:19 AM
**Message:** Guarantee all team squad players (Virat Kohli, Rohit Sharma, Jasprit Bumrah, Hardik Pandya, etc.) are always visible on Players page
**Time Tracked Since Last Save:** ~4 Minutes

### High-Level Summary of Changes:
- **Modified:** `CHANGELOG.md`
- **Modified:** `server/routes/players.js`
- **Modified:** `src/pages/Players.js`

---

