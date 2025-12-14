# Conevent API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Login
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "123",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Get Current User
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## Organisations

### Create Organisation
**Endpoint:** `POST /organisations`

**Auth Required:** Yes (Admin only)

**Body:**
```json
{
  "name": "Stanford University",
  "type": "university",
  "description": "Leading research university located in Stanford, California",
  "email": "events@stanford.edu",
  "phone": "+1-650-723-2300",
  "website": "https://www.stanford.edu",
  "socialMedia": {
    "linkedin": "https://linkedin.com/school/stanford-university",
    "twitter": "https://twitter.com/Stanford",
    "instagram": "https://instagram.com/stanford",
    "facebook": "https://facebook.com/stanford"
  },
  "admins": ["USER_ID_1", "USER_ID_2"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "organisation": {
      "_id": "org123",
      "name": "Stanford University",
      "type": "university",
      "email": "events@stanford.edu",
      "admins": ["USER_ID_1", "USER_ID_2"],
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Get All Organisations
**Endpoint:** `GET /organisations`

**Auth Required:** No

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by type (university, company, institution, other)
- `search` - Text search in name and description
- `sort` - Sort by field (e.g., -createdAt, name)
- `fields` - Select specific fields (e.g., name,email,type)

**Examples:**
```
GET /organisations?type=university&page=1&limit=10
GET /organisations?search=stanford&sort=-createdAt
GET /organisations?fields=name,email,type
```

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "data": {
    "organisations": [
      {
        "_id": "org123",
        "name": "Stanford University",
        "type": "university",
        "email": "events@stanford.edu"
      }
    ]
  }
}
```

### Get Single Organisation
**Endpoint:** `GET /organisations/:id`

**Auth Required:** No

**Response:**
```json
{
  "status": "success",
  "data": {
    "organisation": {
      "_id": "org123",
      "name": "Stanford University",
      "type": "university",
      "description": "Leading research university...",
      "email": "events@stanford.edu",
      "phone": "+1-650-723-2300",
      "website": "https://www.stanford.edu",
      "socialMedia": {
        "linkedin": "https://linkedin.com/school/stanford-university"
      },
      "admins": ["USER_ID_1"],
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Delete Organisation
**Endpoint:** `DELETE /organisations/:id`

**Auth Required:** Yes (Admin only)

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

---

## Events

### Create Event
**Endpoint:** `POST /events`

**Auth Required:** Yes (Admin or Organisation Admin)

**Permissions:**
- Global admins can create events for any organisation
- Users in the organisation's `admins` array can create events for that organisation

**Body:**
```json
{
  "title": "AI & Machine Learning Workshop",
  "description": "Hands-on workshop covering the fundamentals of artificial intelligence and machine learning. Learn from industry experts and build real-world projects.",
  "organisationId": "org123",
  "category": "workshop",
  "eventType": "hybrid",
  "coverImage": "https://example.com/images/ai-workshop.jpg",
  "images": [
    "https://example.com/images/img1.jpg",
    "https://example.com/images/img2.jpg"
  ],
  "onlineLink": "https://zoom.us/j/123456789",
  "street": "450 Serra Mall",
  "address": "Main Quad",
  "city": "Stanford",
  "startDate": "2025-03-15T09:00:00.000Z",
  "endDate": "2025-03-15T17:00:00.000Z",
  "registrationStartDate": "2025-02-01T00:00:00.000Z",
  "registrationEndDate": "2025-03-14T23:59:00.000Z",
  "capacity": 100,
  "isFree": false,
  "price": 50,
  "currency": "USD",
  "tags": ["AI", "Machine Learning", "Workshop", "Tech"],
  "status": "published",
  "requirements": "Basic programming knowledge in Python",
  "contactEmail": "workshop@stanford.edu",
  "contactPhone": "+1-650-123-4567"
}
```

**Field Descriptions:**
- `category`: workshop, seminar, conference, webinar, hackathon, career-fair, networking, competition, cultural, sports, other
- `eventType`: online, offline, hybrid
- `status`: draft, published, ongoing, completed, cancelled
- `capacity`: Minimum 5 attendees

**Response:**
```json
{
  "status": "success",
  "data": {
    "event": {
      "_id": "event123",
      "title": "AI & Machine Learning Workshop",
      "organisationId": "org123",
      "category": "workshop",
      "eventType": "hybrid",
      "startDate": "2025-03-15T09:00:00.000Z",
      "capacity": 100,
      "registeredCount": 0,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Get All Events
**Endpoint:** `GET /events`

**Auth Required:** No

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `eventType` - Filter by event type (online, offline, hybrid)
- `status` - Filter by status (draft, published, ongoing, completed, cancelled)
- `organisationId` - Filter by organisation
- `isFree` - Filter free events (true/false)
- `search` - Text search in title, description, and tags
- `sort` - Sort by field (e.g., -startDate, price)
- `fields` - Select specific fields

**Examples:**
```
GET /events?category=workshop&eventType=online
GET /events?isFree=true&status=published
GET /events?organisationId=org123&sort=-startDate
GET /events?search=AI&page=1&limit=20
GET /events?price[lte]=100&category=workshop
```

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "data": {
    "events": [
      {
        "_id": "event123",
        "title": "AI & Machine Learning Workshop",
        "organisationId": {
          "_id": "org123",
          "name": "Stanford University",
          "type": "university",
          "logo": "https://example.com/logo.png"
        },
        "category": "workshop",
        "eventType": "hybrid",
        "startDate": "2025-03-15T09:00:00.000Z",
        "capacity": 100,
        "registeredCount": 25,
        "isFree": false,
        "price": 50
      }
    ]
  }
}
```

### Get Single Event
**Endpoint:** `GET /events/:id`

**Auth Required:** No

**Response:**
```json
{
  "status": "success",
  "data": {
    "event": {
      "_id": "event123",
      "title": "AI & Machine Learning Workshop",
      "description": "Hands-on workshop covering...",
      "organisationId": {
        "_id": "org123",
        "name": "Stanford University",
        "type": "university",
        "logo": "https://example.com/logo.png",
        "email": "events@stanford.edu",
        "phone": "+1-650-723-2300",
        "website": "https://www.stanford.edu"
      },
      "category": "workshop",
      "eventType": "hybrid",
      "coverImage": "https://example.com/images/ai-workshop.jpg",
      "onlineLink": "https://zoom.us/j/123456789",
      "street": "450 Serra Mall",
      "address": "Main Quad",
      "city": "Stanford",
      "startDate": "2025-03-15T09:00:00.000Z",
      "endDate": "2025-03-15T17:00:00.000Z",
      "registrationEndDate": "2025-03-14T23:59:00.000Z",
      "capacity": 100,
      "registeredCount": 25,
      "isFree": false,
      "price": 50,
      "currency": "USD",
      "tags": ["AI", "Machine Learning", "Workshop", "Tech"],
      "status": "published",
      "requirements": "Basic programming knowledge in Python",
      "contactEmail": "workshop@stanford.edu",
      "contactPhone": "+1-650-123-4567",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Update Event
**Endpoint:** `PUT /events/:id`

**Auth Required:** Yes (Admin or Organisation Admin)

**Permissions:**
- Global admins can update any event
- Users in the organisation's `admins` array can update events for that organisation

**Body:** (Partial update - send only fields to update)
```json
{
  "title": "Advanced AI & Machine Learning Workshop",
  "capacity": 150,
  "price": 75,
  "status": "published"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "event": {
      "_id": "event123",
      "title": "Advanced AI & Machine Learning Workshop",
      "capacity": 150,
      "price": 75,
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  }
}
```

### Delete Event
**Endpoint:** `DELETE /events/:id`

**Auth Required:** Yes (Admin or Organisation Admin)

**Permissions:**
- Global admins can delete any event
- Users in the organisation's `admins` array can delete events for that organisation

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role(s): admin"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing Flow

1. **Login** to get authentication token
   ```
   POST /auth/login
   ```

2. **Create Organisation** (as admin)
   ```
   POST /organisations
   ```

3. **Add yourself to organisation admins** (when creating)
   ```json
   {
     "admins": ["YOUR_USER_ID"]
   }
   ```

4. **Create Event** for the organisation
   ```
   POST /events
   ```

5. **View all events**
   ```
   GET /events
   ```

6. **Update Event**
   ```
   PUT /events/:id
   ```

7. **Delete Event**
   ```
   DELETE /events/:id
   ```

---

## Advanced Query Examples

### Filter Events
```
# Upcoming workshops
GET /events?category=workshop&status=published&sort=startDate

# Free online events
GET /events?isFree=true&eventType=online

# Events by specific organisation
GET /events?organisationId=org123&sort=-startDate

# Search AI events under $100
GET /events?search=AI&price[lte]=100

# Paginated results
GET /events?page=2&limit=20
```

### Filter Organisations
```
# Universities only
GET /organisations?type=university

# Search organisations
GET /organisations?search=stanford

# Sort by name
GET /organisations?sort=name
```

---

## Notes

- All timestamps are in ISO 8601 format
- Pagination starts at page 1
- Default limit is 10 items per page
- Text search is case-insensitive
- Organisation admins can only manage events for their organisations
- Global admins (role: 'admin') have full access to all resources
