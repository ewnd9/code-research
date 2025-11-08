#!/usr/bin/env python3
"""
Sentry Replays API Client

Fetches session replay data from Sentry's API for analysis and replay testing.
"""

import os
import json
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta


class SentryReplayClient:
    """Client for interacting with Sentry's Replays API."""

    def __init__(self, auth_token: Optional[str] = None, organization_slug: Optional[str] = None):
        """
        Initialize Sentry client.

        Args:
            auth_token: Sentry auth token (or set SENTRY_AUTH_TOKEN env var)
            organization_slug: Organization slug (or set SENTRY_ORG_SLUG env var)
        """
        self.auth_token = auth_token or os.getenv('SENTRY_AUTH_TOKEN')
        self.org_slug = organization_slug or os.getenv('SENTRY_ORG_SLUG')
        self.base_url = 'https://sentry.io/api/0'

        if not self.auth_token:
            raise ValueError("auth_token required (or set SENTRY_AUTH_TOKEN)")
        if not self.org_slug:
            raise ValueError("organization_slug required (or set SENTRY_ORG_SLUG)")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests."""
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }

    def list_replays(
        self,
        project: Optional[List[int]] = None,
        environment: Optional[str] = None,
        stats_period: str = '7d',
        start: Optional[str] = None,
        end: Optional[str] = None,
        query: Optional[str] = None,
        sort: Optional[str] = None,
        per_page: int = 50,
        cursor: Optional[str] = None,
        fields: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        List replays for an organization.

        Args:
            project: List of project IDs to filter by
            environment: Environment name to filter by
            stats_period: Time range (e.g., '1d', '7d', '30d') - used if start/end not provided
            start: Start datetime (ISO8601 or epoch seconds)
            end: End datetime (ISO8601 or epoch seconds)
            query: Query string for filtering (e.g., 'error_count:>0')
            sort: Field to sort by
            per_page: Results per page (max 100)
            cursor: Pagination cursor
            fields: Specific fields to return

        Returns:
            Dict with 'data' (list of replays) and pagination info
        """
        url = f'{self.base_url}/organizations/{self.org_slug}/replays/'

        params = {}

        # Time range
        if start and end:
            params['start'] = start
            params['end'] = end
        else:
            params['statsPeriod'] = stats_period

        # Filters
        if project:
            params['project'] = project
        if environment:
            params['environment'] = environment
        if query:
            params['query'] = query
        if sort:
            params['sort'] = sort

        # Pagination and fields
        params['per_page'] = per_page
        if cursor:
            params['cursor'] = cursor
        if fields:
            params['field'] = fields

        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()

        # Parse Link header for pagination
        link_header = response.headers.get('Link', '')
        pagination = self._parse_link_header(link_header)

        return {
            'data': response.json(),
            'pagination': pagination
        }

    def get_replay_details(self, replay_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific replay.

        Args:
            replay_id: The replay ID

        Returns:
            Replay details
        """
        url = f'{self.base_url}/organizations/{self.org_slug}/replays/{replay_id}/'
        response = requests.get(url, headers=self._get_headers())
        response.raise_for_status()
        return response.json()

    def get_replay_events(self, replay_id: str) -> List[Dict[str, Any]]:
        """
        Get the event stream for a replay (user actions, network requests, etc.).

        Note: This endpoint may vary based on Sentry version. Check API docs.

        Args:
            replay_id: The replay ID

        Returns:
            List of replay events
        """
        # This is a placeholder - actual endpoint may differ
        url = f'{self.base_url}/organizations/{self.org_slug}/replays/{replay_id}/events/'

        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                print(f"Events endpoint not available. Check Sentry API docs for replay event access.")
                return []
            raise

    def _parse_link_header(self, link_header: str) -> Dict[str, Optional[str]]:
        """
        Parse Link header for pagination cursors.

        Args:
            link_header: Raw Link header value

        Returns:
            Dict with 'next' and 'previous' cursors
        """
        pagination = {'next': None, 'previous': None}

        if not link_header:
            return pagination

        # Link header format: <url>; rel="next", <url>; rel="previous"
        links = link_header.split(',')

        for link in links:
            parts = link.split(';')
            if len(parts) != 2:
                continue

            url = parts[0].strip().strip('<>')
            rel = parts[1].strip()

            if 'rel="next"' in rel:
                # Extract cursor from URL
                if 'cursor=' in url:
                    cursor = url.split('cursor=')[1].split('&')[0]
                    pagination['next'] = cursor
            elif 'rel="previous"' in rel:
                if 'cursor=' in url:
                    cursor = url.split('cursor=')[1].split('&')[0]
                    pagination['previous'] = cursor

        return pagination

    def fetch_all_replays(
        self,
        max_pages: int = 10,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Fetch all replays across multiple pages.

        Args:
            max_pages: Maximum number of pages to fetch
            **kwargs: Arguments passed to list_replays()

        Returns:
            List of all replay objects
        """
        all_replays = []
        cursor = None

        for page in range(max_pages):
            result = self.list_replays(cursor=cursor, **kwargs)
            replays = result['data']

            if not replays:
                break

            all_replays.extend(replays)

            # Check for next page
            next_cursor = result['pagination'].get('next')
            if not next_cursor:
                break

            cursor = next_cursor
            print(f"Fetched page {page + 1}, total replays: {len(all_replays)}")

        return all_replays


def main():
    """Example usage of SentryReplayClient."""

    # Initialize client (reads from env vars)
    try:
        client = SentryReplayClient()
    except ValueError as e:
        print(f"Error: {e}")
        print("\nSet environment variables:")
        print("  export SENTRY_AUTH_TOKEN='your-token'")
        print("  export SENTRY_ORG_SLUG='your-org-slug'")
        return

    print(f"Fetching replays for organization: {client.org_slug}")

    # Fetch replays from last 7 days
    result = client.list_replays(
        stats_period='7d',
        per_page=10,
        fields=['id', 'project_id', 'user', 'browser', 'os', 'duration', 'error_count']
    )

    replays = result['data']
    print(f"\nFound {len(replays)} replays")

    # Display summary
    for replay in replays:
        print(f"\nReplay ID: {replay.get('id')}")
        print(f"  Project: {replay.get('project_id')}")
        print(f"  User: {replay.get('user', {})}")
        print(f"  Browser: {replay.get('browser', {}).get('name')} {replay.get('browser', {}).get('version')}")
        print(f"  Duration: {replay.get('duration')}ms")
        print(f"  Errors: {replay.get('error_count')}")

    # Get detailed info for first replay
    if replays:
        first_replay_id = replays[0].get('id')
        if first_replay_id:
            print(f"\n\nFetching details for replay: {first_replay_id}")
            details = client.get_replay_details(first_replay_id)
            print(json.dumps(details, indent=2))


if __name__ == '__main__':
    main()
