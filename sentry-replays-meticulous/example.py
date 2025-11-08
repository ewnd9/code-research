#!/usr/bin/env python3
"""
End-to-end example: Fetch Sentry replays and generate test scripts

This demonstrates the complete workflow:
1. Fetch replays from Sentry API
2. Analyze replay data
3. Generate Playwright test scripts
4. Export for testing

Usage:
    export SENTRY_AUTH_TOKEN='your-token'
    export SENTRY_ORG_SLUG='your-org'
    python example.py
"""

import os
import json
from sentry_client import SentryReplayClient
from replay_analyzer import ReplayAnalyzer


def main():
    print("=== Sentry Replays → Meticulous.ai Clone Demo ===\n")

    # Step 1: Initialize Sentry client
    print("Step 1: Connecting to Sentry...")
    try:
        client = SentryReplayClient()
        print(f"✓ Connected to organization: {client.org_slug}\n")
    except ValueError as e:
        print(f"✗ Error: {e}\n")
        print("Please set environment variables:")
        print("  export SENTRY_AUTH_TOKEN='your-token'")
        print("  export SENTRY_ORG_SLUG='your-org-slug'\n")
        print("To get a Sentry auth token:")
        print("  1. Go to https://sentry.io/settings/account/api/auth-tokens/")
        print("  2. Create a new token with 'org:read' scope")
        print("  3. Copy the token and set it as SENTRY_AUTH_TOKEN")
        return

    # Step 2: Fetch replays
    print("Step 2: Fetching replays from last 7 days...")

    try:
        # Fetch with error filtering to prioritize problematic sessions
        result = client.list_replays(
            stats_period='7d',
            query='error_count:>0',  # Only sessions with errors
            per_page=20,
            fields=[
                'id', 'project_id', 'duration', 'finished_at',
                'user', 'browser', 'os', 'error_count', 'urls'
            ]
        )

        replays = result['data']
        print(f"✓ Found {len(replays)} replays with errors\n")

        if not replays:
            print("No replays found. Try:")
            print("  - Removing the error_count filter")
            print("  - Increasing the time range (e.g., stats_period='30d')")
            print("  - Checking that your Sentry project has session replay enabled")
            return

    except Exception as e:
        print(f"✗ Error fetching replays: {e}\n")
        return

    # Step 3: Analyze replays
    print("Step 3: Analyzing replay sessions...")
    analyzer = ReplayAnalyzer()

    for replay in replays:
        session = analyzer.analyze_replay(replay)
        print(f"  • Replay {session.replay_id[:8]}: {session.duration}ms, "
              f"{len(session.errors)} errors")

    print(f"✓ Analyzed {len(analyzer.sessions)} sessions\n")

    # Step 4: Coverage analysis
    print("Step 4: Analyzing test coverage...")
    coverage = analyzer.analyze_coverage()

    print(f"  • Total sessions: {coverage['total_sessions']}")
    print(f"  • Unique URLs: {coverage['unique_urls']}")
    print(f"  • Total errors: {coverage['total_errors']}")
    print(f"  • Browser distribution:")

    for browser, count in coverage['browser_distribution'].items():
        if browser:  # Skip None values
            print(f"    - {browser}: {count}")

    print()

    # Step 5: Select sessions for testing
    print("Step 5: Selecting sessions for automated testing...")
    selected = analyzer.select_sessions_for_testing(
        max_sessions=5,
        prioritize_errors=True,
        min_duration=1000  # At least 1 second
    )

    print(f"✓ Selected {len(selected)} sessions for testing\n")

    for i, session in enumerate(selected, 1):
        print(f"  {i}. {session.replay_id[:8]} - {session.duration}ms, "
              f"{len(session.errors)} errors, {len(session.actions)} actions")

    print()

    # Step 6: Export test scripts
    print("Step 6: Generating Playwright test scripts...")
    output_dir = './generated-tests'

    try:
        analyzer.export_for_testing(output_dir)
        print(f"✓ Tests exported to {output_dir}/\n")

        # Show example test
        if selected:
            example_session = selected[0]
            print("Example generated test:\n")
            print("-" * 60)
            print(example_session.to_test_script())
            print("-" * 60)

    except Exception as e:
        print(f"✗ Error exporting tests: {e}\n")
        return

    # Step 7: Summary and next steps
    print("\n=== Summary ===\n")
    print("This proof-of-concept demonstrates:")
    print("  ✓ Fetching session replays from Sentry API")
    print("  ✓ Analyzing replay data for test generation")
    print("  ✓ Generating Playwright test scripts")
    print("  ✓ Prioritizing sessions with errors")
    print()
    print("Next steps to build a full meticulous.ai clone:")
    print("  1. Parse actual Sentry replay events (rrweb format)")
    print("  2. Extract precise user actions (clicks, inputs, etc.)")
    print("  3. Mock network requests from replay data")
    print("  4. Implement visual regression testing")
    print("  5. Run tests on both base and head commits")
    print("  6. Compare screenshots and report differences")
    print()
    print("To run the generated tests:")
    print("  1. npm install -D @playwright/test")
    print("  2. npx playwright test generated-tests/")
    print()


if __name__ == '__main__':
    main()
