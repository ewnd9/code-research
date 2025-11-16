# Block CMS

A modern block-level CMS built with React Router, Bun, SQLite, and Vite. Create beautiful pages using pre-built blocks with a visual page builder.

## Features

- **Visual Page Builder**: Build pages with a live preview - see changes in real-time
- **Pre-built Blocks**:
  - Jumbotron (Hero section)
  - Call to Action
  - SEO Listing (Card grid)
  - Gallery
- **JSON Schema Forms**: Edit block content with auto-generated forms
- **SQLite Storage**: Fast and reliable database storage
- **Bun Runtime**: Lightning-fast JavaScript runtime
- **React Router**: Client-side routing for smooth navigation

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── blocks/          # Block components (Jumbotron, CTA, etc.)
│   │   └── admin/           # Admin components (PageBuilder, PagesList)
│   ├── pages/               # Page views
│   ├── lib/                 # Database utilities
│   └── server/              # API server
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
# Terminal 1: Start the API server
bun run server

# Terminal 2: Start the Vite dev server
bun run dev
```

Or run both concurrently:
```bash
bun run start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Server**: http://localhost:3001
- **Sample Page**: http://localhost:3000/home

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

- **Frontend**: React 19, React Router 7, Vite
- **Backend**: Bun, better-sqlite3
- **Styling**: Tailwind CSS
- **Forms**: React JSON Schema Form
- **Database**: SQLite

## Development

### Adding New Blocks

1. Create a new block component in `src/components/blocks/`
2. Define the block's TypeScript interface
3. Create a JSON schema for the block's properties
4. Export the component and schema
5. Register the block in `src/components/blocks/index.tsx`

Example:
```typescript
// MyBlock.tsx
export interface MyBlockData {
  title: string;
}

export const myBlockSchema = {
  title: 'My Block',
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Title' }
  }
};

export const MyBlock: React.FC<{ data: MyBlockData }> = ({ data }) => {
  return <div>{data.title}</div>;
};
```

Then add to the block registry in `index.tsx`.

## Building for Production

```bash
bun run build
bun run preview
```

## License

MIT
