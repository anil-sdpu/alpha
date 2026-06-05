# API cURL Examples for Alpha Backend

Set `BASE=http://localhost:4000/api` and `TOKEN` after logging in.

Login (get token):

```bash
curl -sS -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{"email":"admin@alpha.local","password":"password"}'
```

Get students:

```bash
curl -sS -H "Authorization: Bearer $TOKEN" $BASE/students
```

Create student:

```bash
curl -sS -X POST $BASE/students -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"full_name":"New Student","class_id":1}'
```

Chapters (list/create):

```bash
curl -H "Authorization: Bearer $TOKEN" $BASE/chapters
curl -X POST $BASE/chapters -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"subject_id":1,"title":"New Chapter"}'
```

Tests:

```bash
curl -H "Authorization: Bearer $TOKEN" $BASE/tests
curl -X POST $BASE/tests -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"class_id":1,"subject_id":1,"title":"Weekly Test","date":"2025-06-10"}'
```

Questions:

```bash
curl -H "Authorization: Bearer $TOKEN" $BASE/questions
curl -X POST $BASE/questions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"subject_id":1,"question_text":"What is 2+2?","options":["3","4","5"],"correct_answer":"4"}'
```

Generate question paper (server-side PDF):

```bash
curl -X POST $BASE/question_papers/generate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"test_id":1,"title":"Generated Paper","question_ids":[1,2,3]}'
```

Upload PDF for question paper (multipart):

```bash
curl -X POST $BASE/upload/question_paper -H "Authorization: Bearer $TOKEN" -F "file=@./weekly-math.pdf" -F "test_id=1" -F "title=Weekly Math"
```

DPQ / Attendance / Fees / Notifications examples are similar; use endpoints `/api/dpq`, `/api/attendance`, `/api/fees`, `/api/notifications` with JSON payloads.
