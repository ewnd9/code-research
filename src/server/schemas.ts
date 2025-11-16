import { z } from 'zod';

// Page schemas
export const PageSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  meta_description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreatePageSchema = PageSchema.omit({ id: true, created_at: true, updated_at: true });
export const UpdatePageSchema = PageSchema.omit({ id: true, created_at: true, updated_at: true }).partial();

// Block schemas
export const BlockSchema = z.object({
  id: z.number().optional(),
  page_id: z.number().optional(),
  type: z.enum(['jumbotron', 'cta', 'seo-listing', 'gallery']),
  data: z.record(z.string(), z.unknown()),
  position: z.number(),
  created_at: z.string().optional(),
});

export const CreateBlockSchema = BlockSchema.omit({ id: true, created_at: true });
export const UpdateBlockSchema = BlockSchema.omit({ id: true, page_id: true, created_at: true }).partial();

// Update page blocks schema (array of blocks without IDs)
export const UpdatePageBlocksSchema = z.array(
  z.object({
    type: z.enum(['jumbotron', 'cta', 'seo-listing', 'gallery']),
    data: z.record(z.string(), z.unknown()),
    position: z.number(),
  })
);

// Page with blocks schema
export const PageWithBlocksSchema = PageSchema.extend({
  blocks: z.array(BlockSchema),
});

// API Response schemas
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema]);

// Export types
export type Page = z.infer<typeof PageSchema>;
export type CreatePage = z.infer<typeof CreatePageSchema>;
export type UpdatePage = z.infer<typeof UpdatePageSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type CreateBlock = z.infer<typeof CreateBlockSchema>;
export type UpdateBlock = z.infer<typeof UpdateBlockSchema>;
export type PageWithBlocks = z.infer<typeof PageWithBlocksSchema>;
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
