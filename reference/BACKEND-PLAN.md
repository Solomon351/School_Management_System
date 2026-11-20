EDUCANIZE BACKEND PLAN (read this before every backend task)

STACK
- Node.js + Express + Mongoose (MongoDB Atlas), CommonJS (require)
- Base URL: /api/v1 (the frontend already uses http://localhost:5000/api/v1)
- Folders: backend/src/{config,models,routes,controllers,middleware,utils,seed}
- Secrets only in backend/.env (never committed). .env.example lists names only.

RULES FOR EVERY ROUTE
- Success: {"success":true,"data":...}. Error: {"success":false,"message":"..."} with the right HTTP status.
- Validate all input on the server. Never trust the browser.
- Never return passwordHash. Never log passwords, tokens or PINs.
- Every route except login and health needs a valid token and a role check.
- The SERVER does all real calculations: balances, fee status, arrears, totals,
  grades, positions, averages, promotion suggestions, PINs and IDs. Port the logic
  of the frontend files js/results-engine.js and js/fees-demo-data.js so the
  results match.
- Money is stored as whole numbers in kobo. Dates as ISO dates.
- Deactivate instead of delete (status active or inactive).
- Add createdAt and updatedAt to every collection.

ROLES
admin, teacher, parent, student (later: bursar, registrar)
- admin: everything in the admin area
- teacher: only own classes and subjects (attendance, scores, assignments)
- parent: only own linked children (results with scratch card, fees, notices)
- student: only self

COLLECTIONS
users          name, email (optional), phone (optional), loginId (Student ID or Staff ID), passwordHash, role, mustChangePassword, status, lastLoginAt
students       user, studentId (automatic), regNo (optional), names, gender, dob, address, state, lga, parents, status (active, promoted, repeated, graduated, transferred, withdrawn)
teachers       user, staffId, names, phone, email, status
parents        user, names, relationship, phone, email, address, children
sessions       name (2026/2027), terms (First, Second, Third with dates), isCurrent
classes        name (SS1), arm (A), level (primary, junior, senior), formTeacher, session
subjects       name, code, level
classSubjects  class + subject + teacher, per session
enrolments     student + session + class + status. This is how promotion works: records are stamped with session, term and class. Nothing is copied or moved.
settings       school profile, student ID format (prefix, includeYear, digits, separator), grading per level (scoreParts, gradingScale, passMark, promotionAverage, thirdTermRule, reportOptions)
counters       named counters for sequential numbers (student IDs, staff IDs, receipts), increased atomically
feeItems       name, amount per class + session + term, dueDate
bills          one per student per session and term: lines, amountDue, amountPaid, dueDate. Status (unpaid, partial, paid, overdue) is worked out by the server.
payments       bill, amount, method (cash, transfer, pos, card, ussd), date, receiptNo, recordedBy
attendance     class + date + records (student, present, absent or late), takenBy
exams          name, class, subject, date, status
scores         student + session + term + class + subject + parts (CA1, CA2, Exam), enteredBy, status (draft, submitted, published), submittedBy and At, publishedBy and At
scratchCards   cardNo, pinHash, session, term, status (available, used), student, usedAt, batch, createdBy. PINs are created and checked by the server only, and shown once.
assignments    title, class, subject, due, status (draft, published, closed, marked), submissions
notices        title, body, audience, createdBy
timetable      class + day + period + subject + teacher
auditLogs      who, what, when (logins, publishing results, payments, promotions)

STUDENT ID: automatic and in order (prefix + year + counter, format from settings). Never reused. regNo is optional and separate.
LOGIN: one login for everyone. The identifier matches email, phone or loginId. The server returns the role, and the frontend sends the person to html/admin, html/teacher, html/parent or html/student.

BUILD STAGES (one branch each, test before the next)
[x] 1 Setup: /api/v1/health works
[ ] 2 Users, login, roles, first admin seed, change password
[ ] 3 Students, teachers, parents: create, list, edit, deactivate, automatic Student ID, temporary passwords
[ ] 4 Sessions, terms, classes, subjects, class-subject assignments, enrolments
[ ] 5 Connect frontend pages one at a time and remove the demo blocks (search: TEMPORARY: remove before final merge)
[ ] 6 Fees: fee items, bills, payments, arrears, receipts
[ ] 7 Attendance, exams, scores (draft, submit, publish), broadsheet and report card calculations
[ ] 8 Scratch cards and result checking, payment company, Buy Result Card
[ ] 9 Assignments, timetable, notices, reports, settings
[ ] 10 Promotion, teacher and parent and student portals, bulk import, audit logs
