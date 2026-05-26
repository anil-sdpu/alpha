

Project Name: Alpha Coaching Classes – Tuition Management System

1. Project Overview

Build a complete web-based Tuition Management System for Alpha Coaching Classes.

The system should help tutors manage:

Students

Classes

Subjects

Chapters

Tests

Question papers

Daily Practice Questions (DPQ)

Marks

Attendance

Fees

Notifications

Reports


Students should be able to:

Login securely

View profile

View enrolled class

Access subjects

Access tests

View marks/results

Download question papers

Solve/view Daily Practice Questions

Track attendance

Check fee status

Receive notifications



---

2. User Roles

A. Admin/Tutor Login

Tutor can:

Dashboard

Show:

Total students

Total classes

Upcoming tests

Pending DPQ

Fee pending students

Recent activities

Performance analytics charts



---

Student Management

Features:

Add student

Edit student

Delete student

Search student

Assign student to class

Add parent details

Add contact number

Add email

Upload student photo

Reset password

Activate/deactivate account


Student fields:

Student ID (auto-generated)

Full Name

Gender

DOB

Mobile

Parent Name

Parent Contact

Address

Email

Admission Date

Class

Section

Status



---

Class Management

Tutor can:

Add class
Example:

8th

9th

10th

PUC 1

PUC 2



Fields:

Class name

Academic year

Description



---

Subject Management

Under each class:

Add subjects

Edit subjects

Delete subjects


Examples:

Mathematics

Physics

Chemistry

Biology


Fields:

Subject name

Subject code

Description



---

Chapter Management

Features:

Add chapter under subject

Chapter number

Chapter title

Notes upload

Chapter status



---

Test Management

Tutor should be able to create:

Test types:

Chapterwise test

Weekly test

Monthly test

Unit test

Mock test

Final exam


Features:

Create test

Assign to class

Assign to subject

Assign to chapter

Set date

Start/end time

Total marks

Duration

Instructions



---

Question Bank Management

Tutor can:

Add questions manually

Upload Excel/CSV

Upload PDF

Categorize questions


Question types:

Multiple choice

Fill in the blanks

True/False

Short answer

Long answer

Numerical


Fields:

Question

Options

Correct answer

Marks

Difficulty level

Chapter

Tags



---

Question Paper Generator

System should generate:

Random question papers

Manual question papers

Printable PDF


Features:

Select class

Select subject

Select chapter

Select difficulty

Select number of questions

Auto generate PDF



---

Daily Practice Questions (DPQ)

Tutor can:

Create DPQ

Schedule DPQ

Publish DPQ daily

Assign to classes


Student can:

View DPQ

Submit answers


Tutor can:

Review submissions



---

Test Result Management

Tutor can:

Enter marks manually

Upload marks by Excel

Publish results


System should show:

Rank

Percentage

Subject analysis

Performance trend



---

Attendance Management

Tutor can:

Mark daily attendance

View attendance reports


Student can:

View attendance %



---

Fee Management

Tutor can:

Add fee amount

Track paid/unpaid

Generate receipts


Fields:

Total fee

Paid

Due

Payment date

Payment mode



---

Notifications

Send:

Test reminders

DPQ reminders

Fee reminders

Attendance alerts

General announcements


Methods:

Email

SMS

In-app notification



---

File Upload System

Tutor can upload:

PDFs

Notes

Images

Question papers

Answer keys



---

Reports & Analytics

Generate:

Student performance reports

Class reports

Attendance reports

Fee reports


Charts:

Monthly performance

Subject comparison

Rank trends



---

3. Student Login Features

Student dashboard:

Profile details

Current class

Subjects list

Upcoming tests

DPQ list

Results

Attendance

Fee status

Notifications

Download materials



---

4. Authentication Requirements

Secure login system.

Features:

Tutor login

Student login

Password reset

OTP email verification

Session management

Role-based access



---

5. Database Requirement

Use [MySQL](https://www.mysql.com?utm_source=chatgpt.com)

Create relational database.

Suggested tables:

users

tutors

students

classes

subjects

chapters

tests

questions

question_papers

dpq

dpq_answers

test_results

attendance

fees

notifications

uploads

audit_logs


Use:

Primary keys

Foreign keys

Indexes

Timestamps



---

6. Tech Stack (AI should generate)

Backend:

Python

[FastAPI](https://fastapi.tiangolo.com?utm_source=chatgpt.com) or [Django](https://www.djangoproject.com?utm_source=chatgpt.com)


Frontend:

[React](https://react.dev?utm_source=chatgpt.com)

[Tailwind CSS](https://tailwindcss.com?utm_source=chatgpt.com)


Database:

MySQL


Authentication:

JWT tokens


File Storage:

Local uploads folder


PDF Generation:

PDF generator library


Charts:

Chart dashboard



---

7. UI Requirements

Modern clean design.

Pages needed:

Login page

Tutor dashboard

Student dashboard

Students page

Classes page

Subjects page

Chapters page

Tests page

Question bank page

DPQ page

Attendance page

Fees page

Reports page

Settings page


Requirements:

Mobile responsive

Fast loading

Easy navigation

Search bars

Filters

Export buttons



---

8. AI Features (Important)

Use AI to help tutor:

AI Question Generator

Generate questions from:

Chapter text

Uploaded PDF

Notes



---

AI DPQ Generator

Generate daily practice questions automatically.


---

AI Performance Analysis

Analyze:

Weak chapters

Strong subjects

Improvement suggestions



---

AI Recommendation

Recommend:

Revision chapters

Practice questions



---

9. Security Requirements

Must include:

Password hashing

SQL injection prevention

Input validation

File upload validation

Role permissions

Backup support



---

10. Deployment Requirements

Deploy on:

[Render](https://render.com?utm_source=chatgpt.com) or [Railway](https://railway.app?utm_source=chatgpt.com)


Need:

Domain support

SSL

Daily backup



---

11. Sample Branding

App name:

Alpha Coaching Classes

Logo placeholder.

Color theme:

Blue

White

Professional academic look



---

12. Final Deliverables AI Must Generate

AI should generate:

Full source code

Database schema

SQL scripts

Backend APIs

Frontend UI

Authentication

Sample test data

Installation guide

Deployment guide

README documentation


---

SIMPLE INSTRUCTION TO AI

Build complete production-ready Tuition Management System exactly as described above.
Generate all source code, MySQL database schema, APIs, frontend pages, login systems, and deployment instructions.
Assume user is non-technical.
Provide step-by-step setup instructions.
Code should be clean and scalable.

use React js and node js stack.