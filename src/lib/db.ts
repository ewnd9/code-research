import { Database } from 'bun:sqlite';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'cms.db'), { create: true });

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
  )
`);

db.run('CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)');

export interface Page {
  id?: number;
  slug: string;
  title: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Block {
  id?: number;
  page_id?: number;
  type: string;
  data: any;
  position: number;
  created_at?: string;
}

export interface PageWithBlocks extends Page {
  blocks: Block[];
}

// Page operations
export const getPages = (): Page[] => {
  const query = db.query('SELECT * FROM pages ORDER BY created_at DESC');
  return query.all() as Page[];
};

export const getPageBySlug = (slug: string): PageWithBlocks | null => {
  const pageQuery = db.query('SELECT * FROM pages WHERE slug = ?');
  const page = pageQuery.get(slug) as Page | undefined;

  if (!page) return null;

  const blocksQuery = db.query('SELECT * FROM blocks WHERE page_id = ? ORDER BY position ASC');
  const blocks = blocksQuery.all(page.id) as Block[];

  return {
    ...page,
    blocks: blocks.map(block => ({
      ...block,
      data: JSON.parse(block.data as unknown as string)
    }))
  };
};

export const createPage = (page: Page): number => {
  const query = db.query(`
    INSERT INTO pages (slug, title, meta_description)
    VALUES (?, ?, ?)
    RETURNING id
  `);
  const result = query.get(page.slug, page.title, page.meta_description || '') as { id: number };
  return result.id;
};

export const updatePage = (id: number, page: Partial<Page>): void => {
  const query = db.query(`
    UPDATE pages
    SET slug = COALESCE(?, slug),
        title = COALESCE(?, title),
        meta_description = COALESCE(?, meta_description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  query.run(page.slug, page.title, page.meta_description, id);
};

export const deletePage = (id: number): void => {
  const query = db.query('DELETE FROM pages WHERE id = ?');
  query.run(id);
};

// Block operations
export const getBlocksByPageId = (pageId: number): Block[] => {
  const query = db.query('SELECT * FROM blocks WHERE page_id = ? ORDER BY position ASC');
  const blocks = query.all(pageId) as Block[];
  return blocks.map(block => ({
    ...block,
    data: JSON.parse(block.data as unknown as string)
  }));
};

export const createBlock = (block: Block): number => {
  const query = db.query(`
    INSERT INTO blocks (page_id, type, data, position)
    VALUES (?, ?, ?, ?)
    RETURNING id
  `);
  const result = query.get(
    block.page_id,
    block.type,
    JSON.stringify(block.data),
    block.position
  ) as { id: number };
  return result.id;
};

export const updateBlock = (id: number, block: Partial<Block>): void => {
  const query = db.query(`
    UPDATE blocks
    SET type = COALESCE(?, type),
        data = COALESCE(?, data),
        position = COALESCE(?, position)
    WHERE id = ?
  `);
  query.run(
    block.type,
    block.data ? JSON.stringify(block.data) : undefined,
    block.position,
    id
  );
};

export const deleteBlock = (id: number): void => {
  const query = db.query('DELETE FROM blocks WHERE id = ?');
  query.run(id);
};

export const deleteAllBlocksForPage = (pageId: number): void => {
  const query = db.query('DELETE FROM blocks WHERE page_id = ?');
  query.run(pageId);
};

export default db;
