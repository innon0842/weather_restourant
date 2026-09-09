# Weather Eat API Specification

This document provides the API specifications for the **Weather Plus** application backend server.

- **Base URL**: `http://localhost:4000` (Default, configurable via `PORT` env variable)
- **Data Format**: JSON (`application/json`)
- **Authentication**: JWT Bearer Token inside HTTP headers (`Authorization: Bearer <token>`)

---

## 1. Authentication Module (`/auth`)

Endpoints used for user registration, login, and profile validation.

### POST `/auth/register`
Creates a new user account.

- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123",
    "nickname": "홍길동"
  }
  ```
- **Response** (Success - `201 Created`):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "createdAt": "2026-07-24T15:20:00.000Z"
  }
  ```

### POST `/auth/login`
Authenticates user credentials and returns a JWT access token.

- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response** (Success - `201 Created`):
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "홍길동"
    }
  }
  ```

### GET `/auth/profile`
Retrieves details of the currently logged-in user.
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response** (Success - `200 OK`):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동"
  }
  ```

---

## 2. User Module (`/users`)

Endpoints for managing user-specific settings.

### GET `/users/me`
Retrieves details of the authenticated user (excluding password).
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response** (Success - `200 OK`):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "lat": 37.5665,
    "lon": 126.9780,
    "createdAt": "2026-07-24T15:20:00.000Z"
  }
  ```

### PATCH `/users/nickname`
Updates the authenticated user's nickname.
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "nickname": "새로운닉네임"
  }
  ```
- **Response** (Success - `200 OK`):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "새로운닉네임",
    "lat": 37.5665,
    "lon": 126.9780
  }
  ```

### POST `/users/location`
Updates the authenticated user's cached GPS location.
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "lat": 37.5665,
    "lon": 126.9780
  }
  ```
- **Response** (Success - `201 Created`):
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "nickname": "새로운닉네임",
    "lat": 37.5665,
    "lon": 126.9780
  }
  ```

---

## 3. Restaurant Module (`/restaurants`)

Endpoints for restaurant recommendation matching and interaction analytics logs.

### GET `/restaurants/recommendations`
Fetches a list of recommended restaurants matching the current coordinates, search radius, and weather parameters.

- **Query Parameters**:
  - `lat` (string, **Required**): Latitude of search center.
  - `lon` (string, **Required**): Longitude of search center.
  - `radius` (string, Optional): Search radius in kilometers (default: `2.0`).
  - `sky` (string, Optional): Cloud cover condition (`1`: Clear, `3`: Cloudy, `4`: Overcast).
  - `pty` (string, Optional): Precipitation type (`0`: None, `1`: Rain, `2`: Rain/Snow, `3`: Snow, `4`: Shower).
  - `temp` (string, Optional): Current temperature in Celsius.
  - `category` (string, Optional): Food category filter (e.g. `한식`, `양식`, `중식`, `일식`, `카페`).
  - `timeOfDay` (string, Optional): Time category (`morning`, `afternoon`, `evening`).

- **Response** (Success - `200 OK`):
  ```json
  [
    {
      "id": 12,
      "apiPlaceId": "kakao_18274910",
      "name": "돈까스 하우스",
      "category": "일식",
      "categoryName": "일식 > 돈까스",
      "address": "울산 울주군 범서읍 구영리 123",
      "lat": 35.5623,
      "lon": 129.2134,
      "imageUrl": "/placeholders/japanese_food.png",
      "distance": 0.42,
      "matchScore": 85,
      "matchReason": "비 오는 서늘한 오후에 즐기는 바삭하고 든든한 돈까스 매칭 ☔",
      "weatherTags": [
        "RAINY_FOOD",
        "AFTERNOON_FOOD"
      ]
    }
  ]
  ```

### POST `/restaurants/:id/click`
Logs user interaction details on selecting/clicking a restaurant recommendation (used for smart analytics logging).

- **URL Parameters**:
  - `id` (integer, **Required**): Restaurant Database ID.
- **Request Body**:
  ```json
  {
    "userId": 1,         // Optional: Authenticated User ID
    "temp": 24,          // Optional: Temperature in Celsius
    "sky": "1",          // Optional: Sky cover code
    "pty": "0",          // Optional: Precipitation code
    "timeOfDay": "afternoon" // Optional: Time of day
  }
  ```
- **Response** (Success - `201 Created`):
  ```json
  {
    "success": true
  }
  ```

---

## 4. Reservation Module (`/reservations`)

Endpoints for creating and retrieving table reservations.

### POST `/reservations`
Submits a table reservation for a restaurant.
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "restaurantId": 12,
    "reservationTime": "2026-07-25T18:30:00.000Z",
    "partySize": 4
  }
  ```
- **Response** (Success - `201 Created`):
  ```json
  {
    "id": 3,
    "userId": 1,
    "restaurantId": 12,
    "reservationTime": "2026-07-25T18:30:00.000Z",
    "partySize": 4,
    "createdAt": "2026-07-24T15:25:00.000Z"
  }
  ```

### GET `/reservations/me`
Retrieves a list of reservations scheduled by the currently logged-in user.
- **Guard**: `JwtAuthGuard` (JWT Token Required)
- **Headers**:
  `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response** (Success - `200 OK`):
  ```json
  [
    {
      "id": 3,
      "userId": 1,
      "restaurantId": 12,
      "reservationTime": "2026-07-25T18:30:00.000Z",
      "partySize": 4,
      "createdAt": "2026-07-24T15:25:00.000Z",
      "restaurant": {
        "id": 12,
        "name": "돈까스 하우스",
        "category": "일식",
        "address": "울산 울주군 범서읍 구영리 123"
      }
    }
  ]
  ```

---

## 5. Root Module (`/`)

### GET `/`
Utility health-check route returning greeting text.

- **Response** (Success - `200 OK`):
  ```text
  Hello World!
  ```
