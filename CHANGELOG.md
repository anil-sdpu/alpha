# Changelog

## 2026-06-05 — Role-based UI + UI parity updates

- Added frontend role helper `frontend/src/AuthContext.jsx` with a permission matrix for `admin`, `tutor`, and `student`.
- Implemented role-based UI controls across pages: show/hide nav items and action buttons (`create`, `edit`, `delete`) based on permissions.
- Pages updated for consistent UI parity and spacing:
  - `QuestionsPage.jsx`, `DPQPage.jsx`, `AttendancePage.jsx`, `FeesPage.jsx`, `NotificationsPage.jsx`, `StudentsPage.jsx`, `ClassesPage.jsx`, `SubjectsPage.jsx`, `ChaptersPage.jsx`, `TestsPage.jsx`
- Sidebar navigation now filters pages based on `view` permission.
- Added small UI refinements for form cards and tables to match `Classes`/`Subjects` pattern.

Notes:
- Backend should still enforce authorization for every operation; this change is a frontend UX and visibility layer.
- If you want stricter permission definitions or RBAC enforcement server-side, I can implement middleware next.

---
