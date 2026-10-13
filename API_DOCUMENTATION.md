# AI Interview Coach - REST API Documentation

Base URL: `http://localhost:5000/api` (Production / Emulator `http://10.0.2.2:5000/api`)

All protected routes require the HTTP header:
`Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new candidate account.
- **Request Body**:
```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Alex Rivera", "email": "alex@example.com" }
}
```

### `POST /api/auth/login`
Authenticates user with email & password.
- **Request Body**:
```json
{
  "email": "demo@coach.ai",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Alex Rivera", "email": "demo@coach.ai" }
}
```

### `POST /api/auth/forgot-password`
Issues a password reset token for account recovery.
- **Request Body**: `{ "email": "alex@example.com" }`
- **Response**: `{ "success": true, "resetToken": "rst_xyz123" }`

### `POST /api/auth/reset-password`
Resets password with valid token.
- **Request Body**: `{ "email": "alex@example.com", "resetToken": "rst_xyz123", "newPassword": "NewPassword123!" }`

---

## 2. Profile Endpoints

### `GET /api/profile` *(Protected)*
Returns candidate profile, college, experience level, preferred role, and skills.

### `PUT /api/profile` *(Protected)*
Updates candidate profile attributes.
- **Request Body**:
```json
{
  "name": "Alex Rivera",
  "college": "Stanford Institute of Technology",
  "experience_level": "1-2 years",
  "preferred_role": "React Native Developer",
  "skills": ["React Native", "TypeScript", "Node.js"]
}
```

---

## 3. Interview Sessions & Question Endpoints

### `POST /api/interviews` *(Protected)*
Creates a new mock session and triggers AI question generation (or curated question bank selection).
- **Request Body**:
```json
{
  "job_role": "React Native Developer",
  "experience_level": "1-2 years",
  "interview_type": "Technical",
  "difficulty": "Medium",
  "total_questions": 5,
  "target_company": "Meta",
  "mode": "Voice"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "interview": { "id": 12, "job_role": "React Native Developer", "status": "in_progress", ... },
  "questions": [
    {
      "id": 45,
      "question_text": "Explain the New Architecture of React Native...",
      "topic": "Architecture",
      "difficulty": "Medium",
      "expected_concepts": ["JSI", "Fabric", "TurboModules"]
    }
  ]
}
```

### `GET /api/interviews` *(Protected)*
Fetches all previous interview sessions for the authenticated user (sorted by date descending).

### `GET /api/interviews/:id` *(Protected)*
Retrieves session details, questions, candidate answers, evaluation feedback, and overall score summary. Enforces ownership verification.

### `POST /api/questions/:id/answer` *(Protected)*
Evaluates candidate answer text using Gemini AI & backend scoring formula.
- **Request Body**:
```json
{
  "answer_text": "JSI replaces the JSON bridge with C++ host objects...",
  "answer_mode": "Voice"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "evaluation": {
    "technical_score": 88,
    "relevance_score": 90,
    "communication_score": 82,
    "structure_score": 85,
    "concept_coverage_score": 86,
    "overall_score": 87.1,
    "strengths": ["Accurately distinguished static vs dynamic"],
    "improvements": ["Mention virtual method tables"],
    "missing_concepts": ["vtable dynamic binding"],
    "sample_answer": "...",
    "formulaExplanation": "Technical (40%) + Relevance (20%) + Structure (15%) + Concept Coverage (15%) + Communication (10%)"
  }
}
```

### `POST /api/interviews/:id/finish` *(Protected)*
Marks interview as completed, calculates final overall score from database answer records, and sets `completed_at`.

### `DELETE /api/interviews/:id` *(Protected)*
Deletes interview and cascade deletes associated questions, answers, and feedback.

---

## 4. Analytics & Adaptive Practice

### `GET /api/analytics/summary` *(Protected)*
Returns completed count, average overall score, strongest skill, and weak topic.

### `GET /api/analytics/trends` *(Protected)*
Returns time-series scores for historical chart rendering.

### `GET /api/analytics/weak-topics` *(Protected)*
Identifies topics where average score is under 80% and recommends targeted drill difficulty.

### `POST /api/resumes` *(Protected)*
Parses raw resume text and extracts role, experience level, skills, and suggested interview topics.
