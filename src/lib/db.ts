import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { join } from 'path';
import { eq, desc } from 'drizzle-orm';
import { pages, blocks, type Page, type Block, type InsertPage, type InsertBlock } from './schema';

// Initialize SQLite database
const sqlite = new Database(join(process.cwd(), 'cms.db'), { create: true });

// Enable foreign keys
sqlite.run('PRAGMA foreign_keys = ON');

// Initialize Drizzle ORM
export const db = drizzle(sqlite);

// Create tables (for initial setup)
sqlite.run(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
  )
`);

sqlite.run('CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id)');
sqlite.run('CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)');

// Re-export types
export type { Page, Block, InsertPage, InsertBlock };

export interface PageWithBlocks extends Page {
  blocks: Block[];
}

// Page operations
export const getPages = (): Page[] => {
  return db.select().from(pages).orderBy(desc(pages.created_at)).all();
};

export const getPageBySlug = (slug: string): PageWithBlocks | null => {
  const page = db.select().from(pages).where(eq(pages.slug, slug)).get();

  if (!page) return null;

  const pageBlocks = db
    .select()
    .from(blocks)
    .where(eq(blocks.page_id, page.id))
    .orderBy(blocks.position)
    .all();

  return {
    ...page,
    blocks: pageBlocks,
  };
};

export const createPage = (page: InsertPage): number => {
  const result = db
    .insert(pages)
    .values({
      slug: page.slug,
      title: page.title,
      meta_description: page.meta_description || '',
    })
    .returning({ id: pages.id })
    .get();

  return result.id;
};

export const updatePage = (id: number, page: Partial<InsertPage>): void => {
  db
    .update(pages)
    .set({
      ...page,
      updated_at: new Date().toISOString(),
    })
    .where(eq(pages.id, id))
    .run();
};

export const deletePage = (id: number): void => {
  db.delete(pages).where(eq(pages.id, id)).run();
};

// Block operations
export const getBlocksByPageId = (pageId: number): Block[] => {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.page_id, pageId))
    .orderBy(blocks.position)
    .all();
};

export const createBlock = (block: InsertBlock): number => {
  const result = db
    .insert(blocks)
    .values(block)
    .returning({ id: blocks.id })
    .get();

  return result.id;
};

export const updateBlock = (id: number, block: Partial<InsertBlock>): void => {
  db
    .update(blocks)
    .set(block)
    .where(eq(blocks.id, id))
    .run();
};

export const deleteBlock = (id: number): void => {
  db.delete(blocks).where(eq(blocks.id, id)).run();
};

export const deleteAllBlocksForPage = (pageId: number): void => {
  db.delete(blocks).where(eq(blocks.page_id, pageId)).run();
};

export default db;
