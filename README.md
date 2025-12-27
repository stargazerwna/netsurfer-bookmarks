# NetSurfer Bookmarks Service

A modern, fast bookmarking service built with Next.js, NextAuth, Prisma, and SQLite. Features multi-user authentication, per-user bookmark storage, and SiteBar compatibility for legacy clients.

## Features

- **Multi-user Authentication** - Sign in with GitHub or Google accounts
- **Per-user Bookmark Storage** - Each user has their own private bookmark library
- **Tag-based Organization** - Organize bookmarks with custom tags
- **Public Sharing** - Share individual bookmarks via public links
- **SiteBar Compatibility** - Compatible with legacy SiteBar clients
- **Modern UI** - Clean, responsive interface built with Tailwind CSS
- **SQLite Database** - Lightweight, file-based database for easy deployment

## Tech Stack

- **Framework**: Next.js 16.1.1 with Turbopack
- **Authentication**: NextAuth.js v4
- **Database**: Prisma ORM with SQLite
- **Styling**: Tailwind CSS v4
- **Deployment**: Ready for Vercel, Netlify, or self-hosting

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/netsurfer-bookmarks-service.git
cd netsurfer-bookmarks-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Usage

### Authentication

1. Navigate to `/login` or click "Log in" button in the navbar
2. Choose to sign in with GitHub or Google
3. Complete the OAuth flow to authenticate

### Managing Bookmarks

1. After logging in, navigate to `/bookmarks`
2. Click "New bookmark" to add a new link
3. Fill in the title, URL, description, and tags
4. Use the search bar to filter bookmarks
5. Click on tags in the sidebar to filter by tag

### Sharing Bookmarks

1. Toggle the "Public" switch when creating/editing a bookmark
2. Copy the share link from the bookmark card
3. Public bookmarks are accessible via `/b/[id]`

### SiteBar Compatibility

The service provides compatibility with legacy SiteBar clients through URL rewrites:

- `/command.php` → `/api/sitebar/command`
- `/search.php` → `/api/sitebar/search`
- `/sitebar.php` → `/`

#### Supported Commands

- **Log In**: Redirects to the login page
- **Add Link**: Displays a form to add new bookmarks

Example usage:
```
http://localhost:3000/command.php?command=Add%20Link&url=https://example.com&name=Example%20Site
```

## API Endpoints

### Authenticated Endpoints (requires login)

#### GET /api/bookmarks
Retrieve all bookmarks for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Example Site",
    "url": "https://example.com",
    "description": "An example website",
    "tags": ["example", "demo"],
    "isPublic": true,
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
]
```

#### POST /api/bookmarks
Create a new bookmark.

**Request:**
```json
{
  "title": "Example Site",
  "url": "https://example.com",
  "description": "An example website",
  "tags": ["example", "demo"],
  "isPublic": true
}
```

#### DELETE /api/bookmarks?id={id}
Delete a bookmark by ID.

### Public Endpoints

#### GET /api/public/bookmarks?id={id}
Retrieve a public bookmark by ID (no authentication required).

**Response:**
```json
{
  "id": 1,
  "title": "Example Site",
  "url": "https://example.com",
  "description": "An example website",
  "tags": ["example", "demo"],
  "isPublic": true,
  "createdAt": "2023-12-01T00:00:00.000Z",
  "updatedAt": "2023-12-01T00:00:00.000Z"
}
```

### SiteBar Endpoints

#### GET/POST /api/sitebar/command
Handle SiteBar commands (Log In, Add Link).

#### GET /api/sitebar/search
Redirects to bookmarks page with search query.

## Database Schema

The application uses Prisma with SQLite. The schema includes:

- **User** - Authentication and user information
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification tokens
- **Bookmark** - User bookmarks with tags and visibility

View the full schema in `prisma/schema.prisma`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database connection string |
| `NEXTAUTH_URL` | Yes | Base URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | Yes | Secret for session encryption |
| `GITHUB_ID` | No | GitHub OAuth client ID |
| `GITHUB_SECRET` | No | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Self-hosting

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Use a reverse proxy (nginx, Apache) for SSL termination

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Adding OAuth Providers

1. Update `pages/api/auth/[...nextauth].js`
2. Add provider configuration
3. Set environment variables
4. Restart the development server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the [Issues](https://github.com/your-username/netsurfer-bookmarks-service/issues) page
2. Create a new issue with detailed information
3. Include error logs and environment details

## Roadmap

- [ ] Import/Export bookmarks (JSON, HTML)
- [ ] Bookmark collections/folders
- [ ] Full-text search
- [ ] Browser extension
- [ ] API rate limiting
- [ ] Bookmark analytics
- [ ] Team/shared collections
