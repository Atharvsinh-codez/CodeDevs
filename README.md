<img width="1751" height="878" alt="image" src="https://github.com/user-attachments/assets/5330e471-e1f0-4404-aa35-d57d995bcea0" />


# CodeDevs

CodeDevs is an AI-powered portfolio generator that automatically creates beautiful developer portfolios from GitHub profiles. It fetches your GitHub data, uses AI to generate professional summaries and highlights, and presents everything in a modern, responsive portfolio website.

## Features

- **Automatic Portfolio Generation**: Enter any GitHub username and get a fully-featured portfolio instantly
- **AI-Powered Content**: Uses Groq AI to generate professional summaries, highlights, and SEO-optimized descriptions
- **GitHub Integration**: Fetches profile data, repositories, contribution graphs, and project statistics via GitHub GraphQL API
- **Custom Share URLs**: Create memorable custom URLs for your portfolio (e.g., `yoursite.com/john-doe` instead of `yoursite.com/github-username`)
- **Smart Caching**: Database-backed caching system for fast portfolio generation and reduced API calls
- **SEO Optimized**: Dynamic metadata generation for better search engine visibility
- **Responsive Design**: Works perfectly on all devices with dark mode support
- **LinkedIn Integration**: Optional LinkedIn profile data fetching
- **Live Project Screenshots**: Automatically captures and displays live screenshots of project homepages using Screenshot API

## How It Works

1. **User Input**: Visit the landing page and enter a GitHub username
2. **Data Fetching**: The system fetches profile, repositories, and contribution data from GitHub
3. **AI Processing**: Groq AI analyzes the profile and generates professional summaries and highlights
4. **Portfolio Generation**: A complete portfolio page is generated with all sections
5. **Custom URLs**: Users can create custom share URLs for easier sharing

## Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Groq API key (get one at [groq.com](https://groq.com))
- GitHub personal access token (optional, for higher rate limits)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Atharvsinh-codez/CodeDevs-final
cd CodeDevs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Required
GROQ_API_KEY=your_groq_api_key_here
API_KEYS=key1,key2,key3
DATABASE_URL=postgresql://user:password@host:port/database

# Optional
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CACHE_ENABLED=true
DEFAULT_CACHE_TTL=3600
DEBUG=false
NODE_ENV=development
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open your browser:
```
http://localhost:3000
```

Enter a GitHub username on the landing page to generate a portfolio.

## Project Structure

```
CodeDevs/
├── app/
│   ├── (portfolio)/
│   │   └── [username]/
│   │       └── page.tsx          # Dynamic portfolio pages
│   ├── api/
│   │   ├── custom-url/           # Custom URL endpoints
│   │   │   ├── check/            # Check URL availability
│   │   │   └── register/         # Register custom URL
│   │   ├── user/
│   │   │   └── [username]/
│   │   │       ├── profile/      # GitHub profile with AI content
│   │   │       ├── projects/    # Featured projects
│   │   │       ├── about/       # About section
│   │   │       └── contributions/ # Contribution graph data
│   │   └── linkedin/
│   │       └── [username]/       # LinkedIn profile data
│   │   └── screenshot/
│   │       └── route.ts          # Screenshot API endpoint
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── portfolio/                 # Portfolio-specific components
│   │   ├── hero-section.tsx
│   │   ├── share-button.tsx      # Share with custom URL creation
│   │   ├── projects-section.tsx
│   │   ├── project-image.tsx     # Project screenshot component with fallback
│   │   └── ...
│   └── ui/                        # Reusable UI components (Shadcn)
├── lib/
│   ├── config/
│   │   └── settings.ts            # Environment configuration
│   ├── modules/
│   │   ├── github/                # GitHub API integration
│   │   │   ├── fetcher.ts        # Profile and data fetching
│   │   │   ├── projects.ts       # Project ranking algorithm
│   │   │   └── contributions.ts  # Contribution graph
│   │   ├── ai/
│   │   │   └── generator.ts      # AI content generation
│   │   └── linkedin/
│   │       └── fetcher.ts        # LinkedIn integration
│   └── utils/
│       ├── cache.ts              # Database-backed caching
│       ├── custom-url.ts         # Custom URL utilities
│       ├── user.ts               # Username validation
│       └── api-client.ts         # API client wrapper
├── prisma/
│   └── schema.prisma              # Database schema
└── types/                         # TypeScript type definitions
```

## API Endpoints

### Portfolio Data

- `GET /api/user/[username]/profile` - Fetch GitHub profile with AI-generated bio and SEO metadata
- `GET /api/user/[username]/projects` - Get featured projects and language statistics
- `GET /api/user/[username]/about` - Get AI-generated about section
- `GET /api/user/[username]/contributions` - Get contribution graph data
- `GET /api/user/[username]/prs-by-org` - Get pull requests grouped by organization

### Custom URLs

- `POST /api/custom-url/check` - Check if a custom URL slug is available
- `POST /api/custom-url/register` - Register a custom URL for a GitHub username

### LinkedIn

- `GET /api/linkedin/[username]` - Fetch LinkedIn profile data

### Screenshot

- `GET /api/screenshot` - Capture screenshots of websites for project previews
  - Query parameters:
    - `url` (required): The URL to capture
    - `width` (optional): Viewport width in pixels (default: 1280)
    - `height` (optional): Viewport height in pixels (default: 800)
    - `format` (optional): Output format - png, jpeg, or pdf (default: png)
    - `quality` (optional): Image quality for JPEG, 1-100 (default: 80)
    - `fullPage` (optional): Capture full page height (default: false)

All API endpoints require an `X-API-Key` header (except when `DEBUG=true`). The API key must match one of the keys in the `API_KEYS` environment variable.

## Custom Share URLs

Users can create custom URLs for their portfolios instead of using their GitHub username. For example, instead of `yoursite.com/github-username`, they can use `yoursite.com/john-doe`.

### How It Works

1. User clicks the Share button on their portfolio
2. They can enter a custom slug (e.g., "john-doe")
3. The system validates the slug format and checks availability
4. If available, the user can register it
5. The custom URL is stored in the database and mapped to their GitHub username
6. Visiting the custom URL resolves to the GitHub username and displays the portfolio

### Validation Rules

- 3-40 characters
- Lowercase letters, numbers, and hyphens only
- Cannot start or end with a hyphen
- Reserved words are blocked (api, admin, www, etc.)
- Must be unique

## Database Schema

The application uses PostgreSQL with Prisma ORM. The main models are:

- **Cache**: Stores cached API responses with expiration times
- **CustomUrl**: Maps custom URL slugs to GitHub usernames

Run migrations to set up the database:
```bash
npx prisma migrate dev
```

## Environment Variables

### Required

- `GROQ_API_KEY`: Your Groq API key for AI generation
- `API_KEYS`: Comma-separated list of API keys for authentication
- `DATABASE_URL`: PostgreSQL connection string

### Optional

- `GITHUB_TOKEN`: GitHub personal access token (increases rate limits and enables private repository access)
- `CACHE_ENABLED`: Enable/disable caching (default: true)
- `DEFAULT_CACHE_TTL`: Cache time-to-live in seconds (default: 3600)
- `DEBUG`: Bypass API key authentication (default: false)
- `NODE_ENV`: Environment mode (development/production/test)
- `SCREENSHOT_API_URL`: URL of the Screenshot API service (e.g., `https://your-worker.workers.dev`) - Required for live project screenshots

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS + Shadcn/ui components
- **AI**: Vercel AI SDK with Groq provider (Llama 3.1 8B)
- **Database**: PostgreSQL with Prisma ORM
- **API**: GitHub GraphQL API
- **Caching**: Database-backed caching with Prisma
- **Authentication**: API key-based middleware

## Caching Strategy

The application uses a database-backed caching system for most endpoints:

- Cache entries are stored in PostgreSQL with expiration times
- Default TTL is 3600 seconds (1 hour)
- Automatic cleanup of expired entries (1% chance on each write)
- Tag-based cache organization for easy invalidation
- Cache is checked before making external API calls
- Most portfolio endpoints use caching to reduce API calls and improve performance


### Other Platforms

The application can be deployed to any platform that supports Next.js:

1. Set up a PostgreSQL database
2. Configure all environment variables
3. Run `npm run build` to build the application
4. Run `npx prisma migrate deploy` to apply migrations
5. Start the application with `npm start`

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

Apply migrations in production:
```bash
npx prisma migrate deploy
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Environment Validation Failed

Ensure all required environment variables are set in `.env.local` and that `GROQ_API_KEY`, `API_KEYS`, and `DATABASE_URL` are not empty.

### Invalid API Key

Verify that the `X-API-Key` header matches one of the keys in the `API_KEYS` environment variable. Set `DEBUG=true` to bypass authentication during development.

### GitHub User Not Found

Check the username spelling and ensure the GitHub user exists and is public. If you're rate-limited, add a `GITHUB_TOKEN` to increase your rate limit.

### Private Repository Access with GitHub OAuth

To enable users to access their private repositories:

1. **Create a GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Set Application name: "CodeDevs" (or your app name)
   - Set Homepage URL: `http://localhost:3000` (or your production URL)
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github` (or your production callback URL)
   - Click "Register application"
   - Copy the **Client ID** and generate a **Client Secret**

2. **Set OAuth credentials in your environment**:
   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **How it works**:
   - Users can click "Sign in with GitHub" on the landing page
   - After authentication, their GitHub access token is securely stored
   - When viewing their own portfolio, private repositories are automatically included
   - The system uses the user's token to fetch both public and private repos
   - Other users' portfolios will only show public repositories (as expected)

4. **Server-side token (optional)**:
   - You can still set `GITHUB_TOKEN` for server-side operations
   - This is used as a fallback when no user is authenticated
   - Useful for public portfolio generation without user login

### Database Connection Issues

Verify your `DATABASE_URL` is correct and that the database is accessible. Ensure migrations have been run with `npx prisma migrate dev`.

## Documentation

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detailed architecture and implementation details
- [LICENSE](./LICENSE) - GNU General Public License v3.0

## Contributing
<iframe style="width:100%;height:auto;min-width:600px;min-height:400px;" src="https://www.star-history.com/embed?secret=#Atharvsinh-codez/CodeDevs&type=date&legend=top-left" frameBorder="0"></iframe>



Contributions are welcome. Please feel free to submit a Pull Request.

## License

GNU General Public License v3.0 - see LICENSE file for details
