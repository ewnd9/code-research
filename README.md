# Block CMS with React Server Components

A modern block-level CMS built with React 19 Server Components, Bun, SQLite, and Vite. Create beautiful pages using pre-built blocks with a visual page builder and enjoy server-side rendering for optimal SEO and performance.

## Features

- **React Server Components (Experimental)**: Public pages are server-rendered for optimal SEO and initial load performance
- **Visual Page Builder**: Build pages with a live preview - see changes in real-time
- **Pre-built Blocks**:
  - Jumbotron (Hero section)
  - Call to Action
  - SEO Listing (Card grid)
  - Gallery
- **JSON Schema Forms**: Edit block content with auto-generated forms
- **SQLite Storage**: Fast and reliable database storage via bun:sqlite
- **Bun Runtime**: Lightning-fast JavaScript runtime
- **Hybrid Architecture**: SSR for public pages, CSR for admin interface

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── blocks/          # Client-side block components
│   │   │   └── server/      # Server component versions (RSC)
│   │   └── admin/           # Admin components (PageBuilder, PagesList)
│   ├── pages/               # Page views
│   │   ├── PageView.tsx     # Client-side page view
│   │   └── PageViewServer.tsx  # Server component for SSR
│   ├── lib/                 # Database utilities (bun:sqlite)
│   └── server/
│       ├── index.ts         # Original API server
│       ├── unified.tsx      # Unified server (API + SSR)
│       ├── api.ts           # API handlers
│       └── ssr.tsx          # Server-side rendering utilities
├── public/                  # Static assets
└── cms.db                   # SQLite database
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Install dependencies:
```bash
bun install
```

2. Seed the database with sample data:
```bash
bun run seed.ts
```

3. Start the development servers:
```bash
# Recommended: Start both servers concurrently
bun run start

# Or run manually in separate terminals:
# Terminal 1: Start the unified server (API + SSR)
bun run server:rsc

# Terminal 2: Start the Vite dev server (for admin interface)
bun run dev
```

### Access the Application

- **Admin Panel** (CSR): http://localhost:3000/admin
- **Public Pages** (SSR): http://localhost:3002/:slug
- **API Endpoints**: http://localhost:3002/api/*
- **Sample Page**: http://localhost:3002/home

## Usage

### Creating a Page

1. Go to the admin panel at `/admin`
2. Click "Create New Page"
3. Fill in the page details (title, slug, meta description)
4. Add blocks using the "Add Block" buttons
5. Configure each block by clicking on it in the preview
6. Use the JSON schema form on the left to edit block properties
7. Click "Save Page" when done

### Editing a Page

1. Go to `/admin`
2. Click "Edit" on any page
3. Modify blocks or add/remove blocks
4. Save changes

### Available Blocks

#### Jumbotron
Hero section with:
- Title
- Subtitle
- Background image
- Optional CTA button

#### Call to Action
Prominent call-to-action section with:
- Heading
- Description
- Button with link
- Customizable colors

#### SEO Listing
Grid of cards perfect for services or products:
- Section heading
- Multiple items with title, description, image, and link

#### Gallery
Image gallery with:
- Section heading
- Configurable columns (2, 3, or 4)
- Images with captions

## API Endpoints

### Pages

- `GET /api/pages` - Get all pages
- `GET /api/pages/:slug` - Get a page by slug
- `POST /api/pages` - Create a new page
- `PUT /api/pages/:id` - Update a page
- `DELETE /api/pages/:id` - Delete a page

### Blocks

- `PUT /api/pages/:id/blocks` - Update all blocks for a page

## Tech Stack

- **Frontend**: React 19 with Server Components, React Router 7, Vite
- **Backend**: Bun runtime with bun:sqlite
- **Styling**: Tailwind CSS
- **Forms**: React JSON Schema Form
- **Database**: SQLite via bun:sqlite
- **Rendering**: Hybrid SSR (public) + CSR (admin)

## Architecture

### React Server Components Implementation

This project uses an **experimental** RSC implementation with the following architecture:

#### Server-Side (RSC)
- **Public pages** (`/:slug`) are server-rendered using async React Server Components
- Each block type has a server component version in `src/components/blocks/server/`
- Pages are rendered to HTML using `renderToReadableStream` from `react-dom/server`
- Full HTML is streamed to the client for optimal SEO and initial load performance

#### Client-Side (CSR)
- **Admin interface** (`/admin/*`) uses traditional client-side rendering via Vite
- Rich interactivity for the page builder, forms, and preview
- Communicates with the API server for CRUD operations

#### Unified Server
The `src/server/unified.tsx` server handles:
- **API routes** (`/api/*`): RESTful endpoints for page/block management
- **SSR routes** (`/:slug`): Server-rendered public pages
- **Admin redirect**: Redirects to Vite dev server for admin interface

### Benefits of This Approach
- **SEO-friendly**: Public pages are fully rendered HTML
- **Fast initial load**: No client-side JavaScript needed for content
- **Optimal DX**: Admin interface remains highly interactive
- **Flexible**: Easy to extend with more server components

## Development

### Adding New Blocks

1. Create a **client-side block** component in `src/components/blocks/`
2. Create a **server component** version in `src/components/blocks/server/`
3. Define the block's TypeScript interface
4. Create a JSON schema for the block's properties
5. Export the component and schema
6. Register the block in `src/components/blocks/index.tsx`
7. Add to the server renderer in `src/components/blocks/server/BlockRendererServer.tsx`

Example:

**Client component** (`src/components/blocks/MyBlock.tsx`):
```typescript
export interface MyBlockData {
  title: string;
  description: string;
}

export const myBlockSchema = {
  title: 'My Block',
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Title' },
    description: { type: 'string', title: 'Description' }
  }
};

export const MyBlock: React.FC<{ data: MyBlockData }> = ({ data }) => {
  return (
    <div className="p-8">
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
};
```

**Server component** (`src/components/blocks/server/MyBlockServer.tsx`):
```typescript
import type { MyBlockData } from '../MyBlock';

export async function MyBlockServer({ data }: { data: MyBlockData }) {
  return (
    <div className="p-8">
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
}
```

Then add to both registries (`index.tsx` and `BlockRendererServer.tsx`).

## Building for Production

```bash
bun run build
bun run preview
```

## License

MIT
