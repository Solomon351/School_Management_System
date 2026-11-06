EDUCANIZE - MASTER PLAN (in order)

DECISIONS MADE
- Results are checked with a scratch card. No free result checking.
- The system generates scratch cards itself. Cards are bought inside
  the system and paid online, money goes straight to our account.
  The server creates the PIN only after a confirmed payment.
- Student ID is automatic and in order. The format is a school setting
  (prefix, year, digits). Registration number is optional.
- Result check uses Student ID, Reg. No. or Email, optional serial, and PIN.
- Fee statuses: Paid, Unpaid, Partial, Overdue. ("Pending" is now "Unpaid".)
- Assignment statuses: Draft, Published, Closed, Marked.
- Fees belong to a session and a term. Old bills are kept forever.
- Grading, score structure, pass mark and promotion rule are
  school settings. Nothing is hard-coded.
- No public signup. Admin registers everyone with a temporary password.
- Work order: finish the screens, then review the extra feature list,
  then write the backend plan, then build the backend.

A. FINISH THE SCREENS (current work)
[ ] 1. Fees (Solomon): one big prompt: class, session and term, full or
       part payment, Unpaid, arrears, student statement. Test, commit, PR.
[ ] 2. Check: are the Attendance and Examinations PRs merged?
[ ] 3. Examinations pages: optional serial and Reg. No. prompt (colleague)
[ ] 4. Parent profile (colleague)
[ ] 5. Assignment statuses to Draft/Published/Closed/Marked (colleague)
[ ] 6. Fee Structure page (amounts per class, session, term)
[ ] 7. Timetable, Reports, Notices (colleague). Use the file names
       reports.html and notices.html so the dashboard links work.
[ ] 8. Settings page: Student ID format, scratch card settings,
       academic session and term, grading and score structure
[ ] 9. Auto Student ID and password on Add Student
[ ] 10. Admin Users screen (list + Add Admin)
[ ] 11. Animation redesign: slow, professional, every admin page
        except signup and login
[ ] 12. Dashboard: rename the Pending card to Unpaid, once Fees is merged
[ ] 13. Every sidebar and dashboard link opens a real page

B. FEATURE REVIEW (decide what to build, then plan the backend)
[ ] Score entry and automatic result calculation
[ ] Report card and broadsheet
[ ] Promotion of students to the next class
[ ] Teacher portal and parent/student portals
[ ] Bulk import of students from a spreadsheet
[ ] Staff roles (bursar, registrar)
[ ] Messages and SMS, admissions, CBT, payroll (later)
[ ] Pages that work on poor internet

C. BACKEND AND LAUNCH
[ ] Backend plan written for the chosen features
[ ] Login, roles, first-login password change, forgot password
[ ] Replace demo data page by page (search: TEMPORARY: remove before final merge)
[ ] Payment company account, Buy Result Card page
[ ] Move "My Results" to a public page outside the admin
[ ] Remove signup.html
[ ] Pitch and pricing sheet, first pilot school
