/**
 * Sentry Replays API Client
 *
 * Fetches session replay data from Sentry's API for analysis and replay testing.
 */

import axios, { AxiosInstance } from 'axios';

interface SentryReplay {
  id: string;
  project_id: number;
  duration: number;
  finished_at: string;
  started_at: string;
  user?: {
    email?: string;
    id?: string;
    username?: string;
  };
  browser?: {
    name: string;
    version: string;
  };
  os?: {
    name: string;
    version: string;
  };
  device?: {
    name: string;
    brand: string;
    model: string;
  };
  error_count: number;
  urls?: string[];
  [key: string]: any;
}

interface PaginationInfo {
  next: string | null;
  previous: string | null;
}

interface ListReplaysResult {
  data: SentryReplay[];
  pagination: PaginationInfo;
}

interface ListReplaysOptions {
  project?: number[];
  environment?: string;
  statsPeriod?: string;
  start?: string;
  end?: string;
  query?: string;
  sort?: string;
  perPage?: number;
  cursor?: string;
  fields?: string[];
}

interface FetchAllReplaysOptions extends Omit<ListReplaysOptions, 'cursor'> {
  maxPages?: number;
}

export class SentryReplayClient {
  private authToken: string;
  private orgSlug: string;
  private baseUrl: string = 'https://sentry.io/api/0';
  private client: AxiosInstance;

  constructor(authToken?: string, organizationSlug?: string) {
    this.authToken = authToken || process.env.SENTRY_AUTH_TOKEN || '';
    this.orgSlug = organizationSlug || process.env.SENTRY_ORG_SLUG || '';

    if (!this.authToken) {
      throw new Error('authToken required (or set SENTRY_AUTH_TOKEN env var)');
    }
    if (!this.orgSlug) {
      throw new Error('organizationSlug required (or set SENTRY_ORG_SLUG env var)');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * List replays for an organization.
   */
  async listReplays(options: ListReplaysOptions = {}): Promise<ListReplaysResult> {
    const {
      project,
      environment,
      statsPeriod = '7d',
      start,
      end,
      query,
      sort,
      perPage = 50,
      cursor,
      fields,
    } = options;

    const params: Record<string, any> = {};

    // Time range
    if (start && end) {
      params.start = start;
      params.end = end;
    } else {
      params.statsPeriod = statsPeriod;
    }

    // Filters
    if (project) params.project = project;
    if (environment) params.environment = environment;
    if (query) params.query = query;
    if (sort) params.sort = sort;

    // Pagination and fields
    params.per_page = perPage;
    if (cursor) params.cursor = cursor;
    if (fields) params.field = fields;

    const response = await this.client.get(
      `/organizations/${this.orgSlug}/replays/`,
      { params }
    );

    // Parse Link header for pagination
    const linkHeader = response.headers.link || '';
    const pagination = this.parseLinkHeader(linkHeader);

    return {
      data: response.data,
      pagination,
    };
  }

  /**
   * Get detailed information about a specific replay.
   */
  async getReplayDetails(replayId: string): Promise<SentryReplay> {
    const response = await this.client.get(
      `/organizations/${this.orgSlug}/replays/${replayId}/`
    );
    return response.data;
  }

  /**
   * Get the event stream for a replay (user actions, network requests, etc.).
   *
   * Note: This endpoint may vary based on Sentry version.
   */
  async getReplayEvents(replayId: string): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/organizations/${this.orgSlug}/replays/${replayId}/events/`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Events endpoint not available. Check Sentry API docs for replay event access.');
        return [];
      }
      throw error;
    }
  }

  /**
   * Parse Link header for pagination cursors.
   */
  private parseLinkHeader(linkHeader: string): PaginationInfo {
    const pagination: PaginationInfo = {
      next: null,
      previous: null,
    };

    if (!linkHeader) {
      return pagination;
    }

    // Link header format: <url>; rel="next", <url>; rel="previous"
    const links = linkHeader.split(',');

    for (const link of links) {
      const parts = link.split(';');
      if (parts.length !== 2) continue;

      const url = parts[0].trim().replace(/^<|>$/g, '');
      const rel = parts[1].trim();

      if (rel.includes('rel="next"') && url.includes('cursor=')) {
        const cursorMatch = url.match(/cursor=([^&]+)/);
        if (cursorMatch) pagination.next = cursorMatch[1];
      } else if (rel.includes('rel="previous"') && url.includes('cursor=')) {
        const cursorMatch = url.match(/cursor=([^&]+)/);
        if (cursorMatch) pagination.previous = cursorMatch[1];
      }
    }

    return pagination;
  }

  /**
   * Fetch all replays across multiple pages.
   */
  async fetchAllReplays(options: FetchAllReplaysOptions = {}): Promise<SentryReplay[]> {
    const { maxPages = 10, ...listOptions } = options;
    const allReplays: SentryReplay[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < maxPages; page++) {
      const result = await this.listReplays({ ...listOptions, cursor: cursor || undefined });
      const replays = result.data;

      if (replays.length === 0) break;

      allReplays.push(...replays);

      // Check for next page
      const nextCursor = result.pagination.next;
      if (!nextCursor) break;

      cursor = nextCursor;
      console.log(`Fetched page ${page + 1}, total replays: ${allReplays.length}`);
    }

    return allReplays;
  }
}

/**
 * Example usage of SentryReplayClient
 */
async function main() {
  try {
    const client = new SentryReplayClient();

    console.log(`Fetching replays for organization: ${(client as any).orgSlug}`);

    // Fetch replays from last 7 days
    const result = await client.listReplays({
      statsPeriod: '7d',
      perPage: 10,
      fields: ['id', 'project_id', 'user', 'browser', 'os', 'duration', 'error_count'],
    });

    const replays = result.data;
    console.log(`\nFound ${replays.length} replays`);

    // Display summary
    for (const replay of replays) {
      console.log(`\nReplay ID: ${replay.id}`);
      console.log(`  Project: ${replay.project_id}`);
      console.log(`  User: ${JSON.stringify(replay.user)}`);
      console.log(`  Browser: ${replay.browser?.name} ${replay.browser?.version}`);
      console.log(`  Duration: ${replay.duration}ms`);
      console.log(`  Errors: ${replay.error_count}`);
    }

    // Get detailed info for first replay
    if (replays.length > 0 && replays[0].id) {
      const firstReplayId = replays[0].id;
      console.log(`\n\nFetching details for replay: ${firstReplayId}`);
      const details = await client.getReplayDetails(firstReplayId);
      console.log(JSON.stringify(details, null, 2));
    }
  } catch (error: any) {
    if (error.message.includes('required')) {
      console.error(`Error: ${error.message}\n`);
      console.log('Set environment variables:');
      console.log("  export SENTRY_AUTH_TOKEN='your-token'");
      console.log("  export SENTRY_ORG_SLUG='your-org-slug'");
    } else {
      throw error;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
