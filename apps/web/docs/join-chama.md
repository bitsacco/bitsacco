# Join Chama Feature

## Overview
The Join Chama feature allows users to join existing chamas through a shareable invite link. It handles authentication redirects and provides a seamless user experience.

## User Flow

### 1. Unauthenticated User
When an unauthenticated user clicks on a join chama link:
1. User visits `/chamas/join/[chamaId]`
2. System detects they're not logged in
3. Redirects to `/login?callbackUrl=/chamas/join/[chamaId]`
4. After successful login, redirects back to the join chama page
5. User sees the join chama invitation screen

### 2. Authenticated User
When an authenticated user clicks on a join chama link:
1. User visits `/chamas/join/[chamaId]`
2. System fetches chama details
3. Checks if user is already a member
4. If not a member: Shows join invitation with chama details
5. If already a member: Shows success screen with option to view chama

## Components

### Page Component
- **Location**: `app/(dashboard)/chamas/join/[id]/page.tsx`
- **Features**:
  - Authentication check with redirect
  - Chama details fetching
  - Membership status verification
  - Join chama action
  - Success and error states

### Share Button
- **Location**: `components/chama/ShareChamaButton.tsx`
- **Features**:
  - Generates shareable join link
  - Uses Web Share API on mobile
  - Falls back to clipboard copy
  - Visual feedback on copy

## API Endpoints

### Join Chama
- **Endpoint**: `POST /api/chama/join`
- **Request Body**:
  ```json
  {
    "chamaId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully joined chama"
  }
  ```

## Routes

### Frontend Routes
- `Routes.JOIN_CHAMA(id)` → `/chamas/join/[id]`
- Used for shareable invite links

### API Routes
- `Routes.API.CHAMA.JOIN` → `/api/chama/join`
- Handles join chama requests

## Middleware Protection

The join chama route is protected by the dashboard middleware:
- Unauthenticated users are redirected to login with callback URL
- After login, users are automatically redirected back to the join page

## Usage Example

### Sharing a Chama
```tsx
import { ShareChamaButton } from "@/components/chama/ShareChamaButton";

<ShareChamaButton
  chamaId={chama.id}
  chamaName={chama.name}
  variant="tealOutline"
  size="sm"
/>
```

### Direct Link
```
https://app.bitsacco.com/chamas/join/abc123xyz
```

## Security Considerations

1. **Authentication Required**: Users must be logged in to join a chama
2. **Authorization**: Backend validates user permissions
3. **Duplicate Prevention**: Checks if user is already a member
4. **Session Management**: Preserves join intent through login flow

## Future Enhancements

- [ ] Add invite codes for additional security
- [ ] Track invite analytics (who shared, who joined)
- [ ] Email/SMS invite option alongside shareable link
- [ ] Custom invite messages
- [ ] Expiring invite links
