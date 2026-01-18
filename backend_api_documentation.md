# Backend API Documentation for Client-Side Integration

## API Base Information

- **Base URL**: `http://localhost:8080` (development)
- **Port**: 8080
- **CORS Configuration**: Configured to allow `http://localhost:3000`
- **Response Format**: ServiceResponse wrapper pattern
- **Authentication**: None currently implemented (open endpoints)

## Data Models and Schemas

### User Model

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Game Model

```typescript
interface Game {
  id: string;
  title: string;
  source: string;
  uris: string[];
  size: string;
  uploadDate: Date;
  // Additional fields may be present depending on the source
}
```

### ServiceResponse Format

All API responses follow this structure:

```typescript
interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T | null;
  statusCode: number;
}
```

### Zod Validation Schemas

```typescript
// Current UserSchema (for reference)
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Game Schema
const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  uris: z.array(z.string()),
  size: z.string(),
  uploadDate: z.date(),
});

// Search Game Schema
const SearchGameSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query must be at least 1 character")
  })
});

// Input Validation for GET users/:id
const GetUserSchema = z.object({
  params: z.object({ id: z.string()
    .refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
    .transform(Number)
    .refine((num) => num > 0, "ID must be a positive number") })
});
```

## Available API Endpoints

### Game Endpoints

#### GET /games/search

**Description**: Search for games by title

**Request**:
- Method: GET
- URL: `/games/search?q={searchTerm}`
- Headers: None required
- Query Parameters:
  - `q` (required): Search query string (minimum 1 character)

**Response**:
```json
{
  "success": true,
  "message": "Games found",
  "responseObject": [
    {
      "id": "fitgirl-12345",
      "title": "Cyberpunk 2077",
      "source": "FitGirl",
      "uris": ["https://fitgirl-repacks.site/cyberpunk-2077"],
      "size": "65.8 GB",
      "uploadDate": "2023-01-15T10:30:00.000Z"
    },
    {
      "id": "dodi-67890",
      "title": "Cyberpunk 2077",
      "source": "DODI",
      "uris": ["https://dodi-repacks.site/cyberpunk-2077"],
      "size": "68.2 GB",
      "uploadDate": "2023-01-16T14:20:00.000Z"
    }
  ],
  "statusCode": 200
}
```

**Error Responses**:
- 400: Invalid search query (empty or too short)
- 404: No games found matching the search criteria
- 500: Internal server error

#### POST /games/sync

**Description**: Trigger synchronization of game database with external sources

**Request**:
- Method: POST
- URL: `/games/sync`
- Headers: None required
- Body: None

**Response**:
```json
{
  "success": true,
  "message": "Database synced successfully",
  "responseObject": null,
  "statusCode": 200
}
```

**Error Responses**:
- 500: Internal server error during synchronization
- 503: Service unavailable (external sources unreachable)

### GET /users

**Description**: Retrieve all users

**Request**:
- Method: GET
- URL: `/users`
- Headers: None required
- Body: None

**Response**:
```json
{
  "success": true,
  "message": "Users found",
  "responseObject": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "age": 42,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-06T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Robert",
      "email": "Robert@example.com",
      "age": 21,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-06T00:00:00.000Z"
    }
  ],
  "statusCode": 200
}
```

**Error Responses**:
- 404: No users found
- 500: Internal server error

### GET /users/:id

**Description**: Retrieve a specific user by ID

**Request**:
- Method: GET
- URL: `/users/:id` (e.g., `/users/1`)
- Headers: None required
- Body: None

**Parameters**:
- `id` (path parameter): User ID (must be positive number)

**Response**:
```json
{
  "success": true,
  "message": "User found",
  "responseObject": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "age": 42,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-06T00:00:00.000Z"
  },
  "statusCode": 200
}
```

**Error Responses**:
- 400: Invalid ID format
- 404: User not found
- 500: Internal server error

## API Integration Requirements

### CORS Configuration

The backend is configured with:
- Allowed Origin: `http://localhost:3000`
- Credentials: `true`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization

### Request Requirements

1. **Headers**:
   - `Content-Type: application/json` (for all requests)
   - `credentials: 'include'` (for fetch API)

2. **Error Handling**:
   - Check `response.ok` for HTTP success
   - Check `data.success` for business logic success
   - Handle both HTTP errors and ServiceResponse errors

3. **Data Transformation**:
   - Response data is wrapped in `responseObject` property
   - Dates are returned as ISO strings

## Example Data

### Sample User Data

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "age": 42,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-06T00:00:00.000Z"
}
```

### Sample Game Data

```json
{
  "id": "fitgirl-cyberpunk-2077-v1.63",
  "title": "Cyberpunk 2077 v1.63 + Phantom Liberty DLC + All Updates",
  "source": "FitGirl",
  "uris": [
    "https://fitgirl-repacks.site/cyberpunk-2077-v1-63-phantom-liberty-dlc-all-updates/"
  ],
  "size": "65.8 GB",
  "uploadDate": "2023-11-15T14:30:00.000Z"
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "User not found",
  "responseObject": null,
  "statusCode": 404
}
```

## Validation Rules

### User ID Validation

- Must be a positive number
- Must be numeric (no letters or special characters)
- Must be greater than 0

### Email Validation

- Must be valid email format
- Uses Zod's built-in email validation

### Game Search Validation

- Search query (`q` parameter) must be at least 1 character long
- Query string is automatically trimmed
- Empty or whitespace-only queries are rejected

## Technical Stack Information

### Backend Technologies

- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **Documentation**: OpenAPI (Swagger)
- **Logging**: Pino
- **Security**: Helmet, Rate Limiting

### Development Environment

- **Port**: 8080
- **Environment**: Node.js
- **Build Tool**: Vite

## API Design Patterns

### ServiceResponse Pattern

All API responses follow the ServiceResponse pattern:
- `success`: Boolean indicating operation success
- `message`: Human-readable message
- `responseObject`: Actual data payload (or null)
- `statusCode`: HTTP status code

### Error Handling

- HTTP errors (4xx, 5xx) are returned with appropriate status codes
- Business logic errors are wrapped in ServiceResponse with `success: false`
- Validation errors include detailed error messages

## Future API Extensions (Reference)

### Potential Future Endpoints

```typescript
// POST /users - Create new user
// PUT /users/:id - Update existing user
// DELETE /users/:id - Delete user
// POST /users/:id/inquiries - Submit user inquiry

// Game-related future endpoints
// GET /games/:id - Get specific game by ID
// GET /games/sources - Get available game sources
// POST /games - Add new game manually
// PUT /games/:id - Update game information
// DELETE /games/:id - Remove game from database
// GET /games/filter - Filter games by source, size, date, etc.
```

### Extended User Model (Future)

```typescript
interface ExtendedUser {
  // ... existing fields
  address?: string;
  phone?: string;
  company?: string;
  inquiryDetails?: {
    inquiryType: 'support' | 'sales' | 'feedback' | 'other';
    inquirySubject: string;
    inquiryMessage: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}
```

### Extended Game Model (Future)

```typescript
interface ExtendedGame {
  // ... existing fields
  description?: string;
  version?: string;
  language?: string;
  requirements?: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  tags?: string[];
  categories?: string[];
  releaseDate?: Date;
  lastUpdated?: Date;
  downloadCount?: number;
  rating?: number;
  screenshots?: string[];
  additionalSources?: Array<{
    source: string;
    uri: string;
    size: string;
  }>;
}
```

## Integration Checklist for Client-Side AI

1. **API Base URL**: Use `http://localhost:8080` for development
2. **CORS**: Ensure frontend is running on `http://localhost:3000`
3. **Response Handling**: Parse ServiceResponse format
4. **Error Handling**: Handle both HTTP and business logic errors
5. **Data Types**: Convert ISO date strings to Date objects as needed
6. **Validation**: Validate user input before sending to API
7. **Loading States**: Implement proper loading states for API calls
8. **Game Search**: Use URL-encoded query parameters for search terms
9. **Pagination**: Be prepared for paginated responses (limit: 50 items per request)
10. **Source Filtering**: Understand different game sources (FitGirl, DODI, etc.)

## Notes for Client-Side Implementation

- The backend uses Zod for validation - client should implement similar validation
- All dates are in ISO format and should be converted to Date objects
- The API is designed to be extended with additional endpoints
- CORS is strictly configured - ensure frontend origin matches exactly
- No authentication is currently required, but this may change in future
- Game search uses Meilisearch for fast, typo-tolerant search results
- The `/games/sync` endpoint may take significant time to complete as it fetches data from external sources
- Game data is sourced from multiple repack providers (FitGirl, DODI, etc.)
- Consider implementing debouncing for search input to avoid excessive API calls
- Search results are limited to 50 items per request for performance

This documentation provides all the necessary information for the client-side AI to generate appropriate frontend code without making implementation recommendations.