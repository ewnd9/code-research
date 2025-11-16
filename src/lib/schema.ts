import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  meta_description: text('meta_description'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugIdx: index('idx_pages_slug').on(table.slug),
}));

export const blocks = sqliteTable('blocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  page_id: integer('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  data: text('data', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  position: integer('position').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  pageIdIdx: index('idx_blocks_page_id').on(table.page_id),
}));

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;
