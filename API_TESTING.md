# Event Platform API - Testing Documentation

## Overview
This document provides comprehensive testing guidelines for the Event Platform API.

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT tokens stored in HTTP-only cookies

---

## Table of Contents
- [Authentication](#authentication)
- [Events](#events)
- [Applications](#applications)
- [Health Check](#health-check)
- [Response Formats](#response-formats)
- [Error Codes](#error-codes)

---

## Authentication

### Student Signup
**Endpoint:** `POST /api/auth/student/signup`
**Access:** Public
**Description:** Register a new student account

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "student": {
    "_id": "64abc123...",
    "email": "student@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-13T10:00:00.000Z"
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/student/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@example.com\",\"password\":\"SecurePassword123\",\"name\":\"John Doe\"}" \
  -c cookies.txt
```

---

### Student Login
**Endpoint:** `POST /api/auth/student/login`
**Access:** Public
**Description:** Login with student credentials

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "student": {
    "_id": "64abc123...",
    "email": "student@example.com",
    "name": "John Doe"
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@example.com\",\"password\":\"SecurePassword123\"}" \
  -c cookies.txt
```

---

### University Signup
**Endpoint:** `POST /api/auth/university/signup`
**Access:** Public
**Description:** Register a new university account

**Request Body:**
```json
{
  "email": "admin@university.edu",
  "password": "UniversityPass123",
  "name": "Harvard University"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "university": {
    "_id": "64def456...",
    "email": "admin@university.edu",
    "name": "Harvard University",
    "createdAt": "2025-12-13T10:00:00.000Z"
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/university/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@university.edu\",\"password\":\"UniversityPass123\",\"name\":\"Harvard University\"}" \
  -c cookies.txt
```

---

### University Login
**Endpoint:** `POST /api/auth/university/login`
**Access:** Public
**Description:** Login with university credentials

**Request Body:**
```json
{
  "email": "admin@university.edu",
  "password": "UniversityPass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "university": {
    "_id": "64def456...",
    "email": "admin@university.edu",
    "name": "Harvard University"
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/university/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@university.edu\",\"password\":\"UniversityPass123\"}" \
  -c cookies.txt
```

---

### Google OAuth (Student)
**Endpoint:** `GET /api/auth/google/student`
**Access:** Public
**Description:** Redirects to Google OAuth for student login

**Test:**
```bash
# Open in browser
http://localhost:3000/api/auth/google/student
```

**Callback Endpoint:** `GET /api/auth/google/student/callback`
**Description:** Handles Google OAuth callback (automatic redirect)

---

### Google OAuth (University)
**Endpoint:** `GET /api/auth/google/university`
**Access:** Public
**Description:** Redirects to Google OAuth for university login

**Test:**
```bash
# Open in browser
http://localhost:3000/api/auth/google/university
```

**Callback Endpoint:** `GET /api/auth/google/university/callback`
**Description:** Handles Google OAuth callback (automatic redirect)

---

### Get Current User
**Endpoint:** `GET /api/auth/me`
**Access:** Private (Any authenticated user)
**Description:** Get current logged in user profile

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "64abc123...",
    "email": "student@example.com",
    "name": "John Doe"
  },
  "type": "student"
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

### Logout
**Endpoint:** `POST /api/auth/logout`
**Access:** Private (Any authenticated user)
**Description:** Logout user (clears auth token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Events

### Get All Events
**Endpoint:** `GET /api/events`
**Access:** Public
**Description:** Get all events (public listing)

**Success Response (200):**
```json
{
  "success": true,
  "events": [
    {
      "_id": "64xyz789...",
      "universityId": {
        "_id": "64def456...",
        "name": "Harvard University",
        "logo": "https://cloudinary.com/..."
      },
      "title": "Tech Conference 2025",
      "description": "Annual technology conference",
      "date": "2025-12-20T10:00:00.000Z",
      "location": "Main Auditorium",
      "images": ["https://cloudinary.com/img1.jpg"],
      "createdAt": "2025-12-13T10:00:00.000Z"
    }
  ]
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/events
```

---

### Get Single Event
**Endpoint:** `GET /api/events/:id`
**Access:** Public
**Description:** Get single event by ID

**Success Response (200):**
```json
{
  "success": true,
  "event": {
    "_id": "64xyz789...",
    "universityId": {
      "_id": "64def456...",
      "name": "Harvard University",
      "logo": "https://cloudinary.com/..."
    },
    "title": "Tech Conference 2025",
    "description": "Annual technology conference",
    "date": "2025-12-20T10:00:00.000Z",
    "location": "Main Auditorium",
    "images": ["https://cloudinary.com/img1.jpg"]
  }
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/events/64xyz789...
```

---

### Get My Events (University)
**Endpoint:** `GET /api/events/my`
**Access:** Private (University only)
**Description:** Get university's own events

**Success Response (200):**
```json
{
  "success": true,
  "events": [
    {
      "_id": "64xyz789...",
      "universityId": "64def456...",
      "title": "Tech Conference 2025",
      "description": "Annual technology conference",
      "date": "2025-12-20T10:00:00.000Z",
      "location": "Main Auditorium",
      "images": []
    }
  ]
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/events/my \
  -b cookies.txt
```

---

### Create Event
**Endpoint:** `POST /api/events`
**Access:** Private (University only)
**Description:** Create a new event (supports up to 4 image uploads)

**Request Body (multipart/form-data):**
```
title: "Tech Conference 2025"
description: "Annual technology conference featuring industry leaders"
date: "2025-12-20T10:00:00.000Z"
location: "Main Auditorium, Building A"
images: [file1.jpg, file2.jpg] (optional, max 4)
```

**Success Response (201):**
```json
{
  "success": true,
  "event": {
    "_id": "64xyz789...",
    "universityId": "64def456...",
    "title": "Tech Conference 2025",
    "description": "Annual technology conference",
    "date": "2025-12-20T10:00:00.000Z",
    "location": "Main Auditorium",
    "images": ["https://cloudinary.com/img1.jpg"]
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/events \
  -b cookies.txt \
  -F "title=Tech Conference 2025" \
  -F "description=Annual technology conference" \
  -F "date=2025-12-20T10:00:00.000Z" \
  -F "location=Main Auditorium" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

---

### Update Event
**Endpoint:** `PUT /api/events/:id`
**Access:** Private (University only - must be event owner)
**Description:** Update an existing event

**Request Body (multipart/form-data):**
```
title: "Updated Tech Conference 2025" (optional)
description: "Updated description" (optional)
date: "2025-12-21T10:00:00.000Z" (optional)
location: "Updated location" (optional)
images: [newfile.jpg] (optional, max 4 total)
imagesToDelete: ["https://cloudinary.com/old.jpg"] (optional)
```

**Success Response (200):**
```json
{
  "success": true,
  "event": {
    "_id": "64xyz789...",
    "title": "Updated Tech Conference 2025",
    "description": "Updated description",
    "date": "2025-12-21T10:00:00.000Z",
    "location": "Updated location",
    "images": ["https://cloudinary.com/new.jpg"]
  }
}
```

**Test with cURL:**
```bash
curl -X PUT http://localhost:3000/api/events/64xyz789... \
  -b cookies.txt \
  -F "title=Updated Conference" \
  -F "description=Updated description"
```

---

### Delete Event
**Endpoint:** `DELETE /api/events/:id`
**Access:** Private (University only - must be event owner)
**Description:** Delete an event (also deletes associated images from Cloudinary)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

**Test with cURL:**
```bash
curl -X DELETE http://localhost:3000/api/events/64xyz789... \
  -b cookies.txt
```

---

## Applications

### Get My Applications (Student)
**Endpoint:** `GET /api/applications/my`
**Access:** Private (Student only)
**Description:** Get student's applications

**Success Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "64app111...",
      "eventId": {
        "_id": "64xyz789...",
        "title": "Tech Conference 2025"
      },
      "studentId": "64abc123...",
      "status": "pending",
      "createdAt": "2025-12-13T10:00:00.000Z"
    }
  ]
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/applications/my \
  -b cookies.txt
```

---

### Apply to Event
**Endpoint:** `POST /api/applications/:eventId`
**Access:** Private (Student only)
**Description:** Apply to an event

**Success Response (201):**
```json
{
  "success": true,
  "application": {
    "_id": "64app111...",
    "eventId": "64xyz789...",
    "studentId": "64abc123...",
    "status": "pending",
    "createdAt": "2025-12-13T10:00:00.000Z"
  }
}
```

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/applications/64xyz789... \
  -b cookies.txt
```

---

### Delete Application
**Endpoint:** `DELETE /api/applications/:id`
**Access:** Private (Student only - must be application owner)
**Description:** Cancel an application

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application deleted"
}
```

**Test with cURL:**
```bash
curl -X DELETE http://localhost:3000/api/applications/64app111... \
  -b cookies.txt
```

---

### Get Event Applications (University)
**Endpoint:** `GET /api/applications/event/:eventId`
**Access:** Private (University only - must be event owner)
**Description:** Get all applications for a specific event

**Success Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "64app111...",
      "eventId": "64xyz789...",
      "studentId": {
        "_id": "64abc123...",
        "name": "John Doe",
        "email": "student@example.com"
      },
      "status": "pending",
      "createdAt": "2025-12-13T10:00:00.000Z"
    }
  ]
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/applications/event/64xyz789... \
  -b cookies.txt
```

---

### Update Application Status
**Endpoint:** `PATCH /api/applications/:id/status`
**Access:** Private (University only - must own the event)
**Description:** Accept or reject an application

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Allowed Status Values:** `"accepted"`, `"rejected"`, `"pending"`

**Success Response (200):**
```json
{
  "success": true,
  "application": {
    "_id": "64app111...",
    "eventId": "64xyz789...",
    "studentId": "64abc123...",
    "status": "accepted",
    "updatedAt": "2025-12-13T11:00:00.000Z"
  }
}
```

**Test with cURL:**
```bash
curl -X PATCH http://localhost:3000/api/applications/64app111.../status \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"accepted\"}"
```

---

## Health Check

### Check API Health
**Endpoint:** `GET /api/health`
**Access:** Public
**Description:** Check if API is running

**Success Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-12-13T10:00:00.000Z",
  "service": "Event Platform API"
}
```

**Test with cURL:**
```bash
curl -X GET http://localhost:3000/api/health
```

---

## Response Formats

### Success Response
All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

### Error Response
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development mode)"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Invalid credentials or no authentication |
| 403 | Forbidden - Authenticated but not authorized for this resource |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Common Error Scenarios

### Missing Required Fields
**Status:** 400
**Response:**
```json
{
  "success": false,
  "message": "Please provide all required fields: title, description, date, location"
}
```

### Invalid Credentials
**Status:** 401
**Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Unauthorized Access
**Status:** 403
**Response:**
```json
{
  "success": false,
  "message": "Not authorized to update this event"
}
```

### Resource Not Found
**Status:** 404
**Response:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

### Duplicate Email
**Status:** 400
**Response:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Image Upload Limit Exceeded
**Status:** 400
**Response:**
```json
{
  "success": false,
  "message": "Maximum 4 images allowed per event"
}
```

---

## Testing Workflow Examples

### Complete Student Flow
```bash
# 1. Student Signup
curl -X POST http://localhost:3000/api/auth/student/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@test.com\",\"password\":\"Pass123\",\"name\":\"Test Student\"}" \
  -c cookies.txt

# 2. Get All Events
curl -X GET http://localhost:3000/api/events

# 3. Apply to Event
curl -X POST http://localhost:3000/api/applications/EVENT_ID_HERE \
  -b cookies.txt

# 4. Get My Applications
curl -X GET http://localhost:3000/api/applications/my \
  -b cookies.txt

# 5. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Complete University Flow
```bash
# 1. University Signup
curl -X POST http://localhost:3000/api/auth/university/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"uni@test.edu\",\"password\":\"Pass123\",\"name\":\"Test University\"}" \
  -c cookies.txt

# 2. Create Event
curl -X POST http://localhost:3000/api/events \
  -b cookies.txt \
  -F "title=Test Event" \
  -F "description=Test Description" \
  -F "date=2025-12-20T10:00:00.000Z" \
  -F "location=Test Location"

# 3. Get My Events
curl -X GET http://localhost:3000/api/events/my \
  -b cookies.txt

# 4. Get Applications for Event
curl -X GET http://localhost:3000/api/applications/event/EVENT_ID_HERE \
  -b cookies.txt

# 5. Accept Application
curl -X PATCH http://localhost:3000/api/applications/APP_ID_HERE/status \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"accepted\"}"

# 6. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Notes
- All authenticated requests require a valid JWT token in cookies
- Tokens are automatically set in cookies upon login/signup
- Image uploads use multipart/form-data encoding
- Maximum 4 images per event
- Application status can be: `pending`, `accepted`, or `rejected`
- Students can only apply to each event once (enforced by unique index)
