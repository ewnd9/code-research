import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  createBlock,
  updateBlock,
  deleteBlock,
  deleteAllBlocksForPage,
  type Page,
  type Block,
  type PageWithBlocks
} from '../lib/db';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Page handlers
export const handleGetPages = (): ApiResponse<Page[]> => {
  try {
    const pages = getPages();
    return { success: true, data: pages };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleGetPage = (slug: string): ApiResponse<PageWithBlocks> => {
  try {
    const page = getPageBySlug(slug);
    if (!page) {
      return { success: false, error: 'Page not found' };
    }
    return { success: true, data: page };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleCreatePage = (page: Page): ApiResponse<{ id: number }> => {
  try {
    const id = createPage(page);
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleUpdatePage = (id: number, page: Partial<Page>): ApiResponse => {
  try {
    updatePage(id, page);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleDeletePage = (id: number): ApiResponse => {
  try {
    deletePage(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// Block handlers
export const handleCreateBlock = (block: Block): ApiResponse<{ id: number }> => {
  try {
    const id = createBlock(block);
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleUpdateBlock = (id: number, block: Partial<Block>): ApiResponse => {
  try {
    updateBlock(id, block);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleDeleteBlock = (id: number): ApiResponse => {
  try {
    deleteBlock(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const handleUpdatePageBlocks = (
  pageId: number,
  blocks: Omit<Block, 'id' | 'page_id' | 'created_at'>[]
): ApiResponse => {
  try {
    // Delete all existing blocks for the page
    deleteAllBlocksForPage(pageId);

    // Create new blocks
    blocks.forEach((block) => {
      createBlock({
        ...block,
        page_id: pageId
      });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
