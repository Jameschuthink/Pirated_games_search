# Frontend API Specification

## Base Configuration

- **API Base URL**: `http://localhost:8080`
- **Frontend URL**: `http://localhost:3000` (CORS configured)
- **Response Format**: All responses use ServiceResponse wrapper

## ServiceResponse Format

```typescript
interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T | null;
  statusCode: number;
}
```

## Game API Endpoints

### GET /games/search

**Search for games using Meilisearch (traditional providers)**

**Request**:
- Method: GET
- URL: `/games/search?q={searchTerm}`
- Query Param: `q` (string, required, min 1 char)

**Response Data (Game[])**:
```typescript
interface TraditionalGame {
  id: string;
  title: string;
  source: string; // "FitGirl", "DODI", etc.
  webpageUrl: string; // Direct link to the original source webpage
  size: string; // e.g., "65.8 GB"
  uploadDate: Date; // ISO string
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Games found",
  "responseObject": [
    {
      "id": "fitgirl-123",
      "title": "Cyberpunk 2077",
      "source": "FitGirl",
      "webpageUrl": "https://fitgirl-repacks.site/cyberpunk-2077/",
      "size": "65.8 GB",
      "uploadDate": "2023-01-15T10:30:00.000Z"
    }
  ],
  "statusCode": 200
}
```

### GET /games/search/google

**Search for games using Google Directory (live search)**

**Request**:
- Method: GET
- URL: `/games/search/google?q={searchTerm}`
- Query Param: `q` (string, required, min 1 char)

**Response Data (Game[])**:
```typescript
interface GoogleGame {
  title: string;
  webpageUrl: string; // Direct link from Google search results
  source: string; // Domain from Google (e.g., "fitgirl-repacks.site")
  snippet: string; // Description snippet from Google
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Games found from Google Directory",
  "responseObject": [
    {
      "title": "Cyberpunk 2077 Free Download",
      "webpageUrl": "https://fitgirl-repacks.site/cyberpunk-2077/",
      "source": "fitgirl-repacks.site",
      "snippet": "Cyberpunk 2077 is an action role-playing game developed by CD Projekt Red. Free download via FitGirl repack..."
    }
  ],
  "statusCode": 200
}
```

### POST /games/sync

**Trigger database synchronization**

**Request**:
- Method: POST
- URL: `/games/sync`
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

## Error Handling

**Common Error Responses**:
- `400`: Invalid request (e.g., empty search query)
- `404`: No results found
- `500`: Server error
- `503`: Service unavailable

**Error Response Format**:
```json
{
  "success": false,
  "message": "Error description",
  "responseObject": null,
  "statusCode": 404
}
```

## Frontend Requirements

### API Calls
1. **Meilisearch Search**: `GET /games/search?q={userInput}`
2. **Google Search**: `GET /games/search/google?q={userInput}`
3. **Sync Database**: `POST /games/sync`

### Data Handling
- Parse `responseObject` for actual data
- Check `success` boolean for operation status
- Handle errors based on `statusCode`
- Convert ISO date strings to Date objects
- Handle different game structures (traditional vs Google)

### UI Components Needed
1. **Meilisearch Search Bar**: Text field for traditional search
2. **Google Search Bar**: Text field for live Google search
3. **Search Buttons**: Separate buttons for each search type
4. **Results Display**: Show game list with source attribution
5. **Sync Button**: Trigger database sync (admin feature)
6. **Loading States**: Show during API calls
7. **Error Messages**: Display API error messages
8. **Search Type Toggle**: Allow users to switch between search methods

### Example Meilisearch Flow
1. User enters search term in Meilisearch bar
2. Frontend calls `GET /games/search?q={term}`
3. Display results with title, source, size, date
4. Show "Visit Source" buttons using `webpageUrl`

### Example Google Search Flow
1. User enters search term in Google search bar
2. Frontend calls `GET /games/search/google?q={term}`
3. Display results with title, source domain, snippet
4. Show "Visit Source" buttons using `webpageUrl`
5. Include snippet preview from Google

### Example Sync Flow
1. User clicks "Sync Database" button
2. Frontend calls `POST /games/sync`
3. Show loading indicator
4. Display success/error message
5. Optionally refresh Meilisearch results

## Implementation Notes

- Use `fetch` or `axios` for API calls
- Set `Content-Type: application/json` header
- Handle CORS properly (frontend on port 3000)
- Implement debouncing for both search inputs
- Show loading states during API calls
- Display user-friendly error messages
- **Hybrid Search**: Support both Meilisearch and Google search simultaneously
- **Webpage Redirects**: Use `webpageUrl` to redirect users to original source sites
- **No Direct Downloads**: Frontend should not provide direct download links
- **Source Attribution**: Clearly display source (FitGirl, DODI, or domain)
- **Data Structure Handling**: Handle different response formats gracefully
- **Error Differentiation**: Show different messages for Meilisearch vs Google errors

## Hybrid Search UI Implementation

### Two Search Bars Example

```jsx
import { useState } from 'react';

function HybridGameSearch() {
  const [meiliQuery, setMeiliQuery] = useState('');
  const [googleQuery, setGoogleQuery] = useState('');
  const [meiliResults, setMeiliResults] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [loading, setLoading] = useState({ meili: false, google: false });
  const [error, setError] = useState({ meili: null, google: null });
  const [activeTab, setActiveTab] = useState('meili'); // 'meili' or 'google'

  // Meilisearch search
  const searchMeili = async () => {
    if (!meiliQuery.trim()) return;
    
    setLoading({ ...loading, meili: true });
    setError({ ...error, meili: null });
    
    try {
      const response = await fetch(`http://localhost:8080/games/search?q=${encodeURIComponent(meiliQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setMeiliResults(data.responseObject);
        setActiveTab('meili');
      } else {
        setError({ ...error, meili: data.message });
      }
    } catch (err) {
      setError({ ...error, meili: 'Meilisearch failed to respond' });
    } finally {
      setLoading({ ...loading, meili: false });
    }
  };

  // Google search
  const searchGoogle = async () => {
    if (!googleQuery.trim()) return;
    
    setLoading({ ...loading, google: true });
    setError({ ...error, google: null });
    
    try {
      const response = await fetch(`http://localhost:8080/games/search/google?q=${encodeURIComponent(googleQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        setGoogleResults(data.responseObject);
        setActiveTab('google');
      } else {
        setError({ ...error, google: data.message });
      }
    } catch (err) {
      setError({ ...error, google: 'Google search failed' });
    } finally {
      setLoading({ ...loading, google: false });
    }
  };

  // Handle game click (works for both types)
  const handleGameClick = (game) => {
    if (game.webpageUrl) {
      window.open(game.webpageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Render game card (handles both traditional and Google games)
  const renderGameCard = (game) => (
    <div key={game.id || game.title} className="game-card">
      <h3>{game.title}</h3>
      <p>Source: {game.source}</p>
      {game.snippet && <p className="snippet">{game.snippet}</p>}
      {game.size && <p>Size: {game.size}</p>}
      {game.uploadDate && <p>Date: {new Date(game.uploadDate).toLocaleDateString()}</p>}
      <button onClick={() => handleGameClick(game)}>
        Visit Source
      </button>
    </div>
  );

  return (
    <div className="hybrid-search">
      <h2>Game Search</h2>
      
      {/* Search Bars */}
      <div className="search-bars">
        <div className="search-bar meili">
          <input
            type="text"
            value={meiliQuery}
            onChange={(e) => setMeiliQuery(e.target.value)}
            placeholder="Search Meilisearch..."
            disabled={loading.meili}
          />
          <button onClick={searchMeili} disabled={loading.meili || !meiliQuery.trim()}>
            {loading.meili ? 'Searching...' : 'Search Meili'}
          </button>
          {error.meili && <div className="error">{error.meili}</div>}
        </div>
        
        <div className="search-bar google">
          <input
            type="text"
            value={googleQuery}
            onChange={(e) => setGoogleQuery(e.target.value)}
            placeholder="Search Google..."
            disabled={loading.google}
          />
          <button onClick={searchGoogle} disabled={loading.google || !googleQuery.trim()}>
            {loading.google ? 'Searching...' : 'Search Google'}
          </button>
          {error.google && <div className="error">{error.google}</div>}
        </div>
      </div>
      
      {/* Results Tabs */}
      <div className="results-tabs">
        <button 
          className={activeTab === 'meili' ? 'active' : ''}
          onClick={() => setActiveTab('meili')}
          disabled={meiliResults.length === 0}
        >
          Meilisearch Results ({meiliResults.length})
        </button>
        <button 
          className={activeTab === 'google' ? 'active' : ''}
          onClick={() => setActiveTab('google')}
          disabled={googleResults.length === 0}
        >
          Google Results ({googleResults.length})
        </button>
      </div>
      
      {/* Results Display */}
      <div className="results">
        {activeTab === 'meili' && (
          meiliResults.length > 0 ? (
            meiliResults.map(renderGameCard)
          ) : (
            <p>No Meilisearch results. Try searching or syncing the database.</p>
          )
        )}
        
        {activeTab === 'google' && (
          googleResults.length > 0 ? (
            googleResults.map(renderGameCard)
          ) : (
            <p>No Google results. Try searching with different terms.</p>
          )
        )}
      </div>
    </div>
  );
}
```

## Webpage Redirect Strategy

### Key Principle
The frontend must **redirect users to original source webpages** instead of providing direct download links. This ensures:
- Users get proper instructions and safety information
- Source sites receive appropriate traffic and attribution
- Compliance with source site policies

### Implementation Requirements
1. **Use webpageUrl**: All game results contain a `webpageUrl` field
2. **Redirect Behavior**: When users click on a game, open `webpageUrl` in a new tab
3. **Source Display**: Show the source (FitGirl, DODI, or domain) prominently
4. **No Direct Links**: Do not extract or display direct download links
5. **Fallback Handling**: If `webpageUrl` is invalid, show error to user
6. **Hybrid Support**: Handle both traditional and Google game structures

### Example Redirect Implementation
```javascript
// Universal redirect handler (works for both game types)
const handleGameClick = (game) => {
  if (game.webpageUrl) {
    window.open(game.webpageUrl, '_blank', 'noopener,noreferrer');
  } else {
    showError('Invalid source URL');
  }
};
```

## Quickstart Guide

For a concise implementation guide, see [frontend_api_quickstart.md](frontend_api_quickstart.md) which provides:
- Simple API call examples
- JavaScript and React code snippets
- Quick checklist for implementation

## Quick Checklist

### Hybrid Search Implementation
1. **Two Search Bars**: Create separate inputs for Meilisearch and Google
2. **Separate API Calls**: Call different endpoints for each search type
3. **Result Tabs**: Implement tabbed interface to switch between results
4. **Universal Game Card**: Handle both traditional and Google game structures
5. **Loading States**: Show separate loading indicators for each search
6. **Error Handling**: Display specific errors for each search method

### Core Requirements
1. **API Calls**: Use `fetch` or `axios` with proper error handling
2. **CORS**: Ensure frontend runs on `http://localhost:3000`
3. **Redirects**: Open `webpageUrl` in new tab with `window.open()`
4. **Debouncing**: Implement for both search inputs
5. **Display**: Show game title, source, and redirect button
6. **Sync**: Provide admin button for database sync
7. **Data Handling**: Parse different response structures gracefully

## Detailed Specification

This specification provides comprehensive information for building a functional frontend that implements the **hybrid search system** with both Meilisearch and Google Directory APIs.