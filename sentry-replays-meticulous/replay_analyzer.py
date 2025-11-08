#!/usr/bin/env python3
"""
Replay Analyzer

Analyzes Sentry replay data to extract patterns suitable for automated testing.
This serves as a bridge between Sentry's replay format and a meticulous.ai-style
testing system.
"""

import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from collections import Counter


@dataclass
class UserAction:
    """Represents a single user action extracted from replay."""
    timestamp: int  # milliseconds since replay start
    action_type: str  # click, input, navigation, etc.
    selector: Optional[str] = None  # CSS selector or XPath
    value: Optional[str] = None  # For input events
    target: Optional[str] = None  # URL for navigation
    coordinates: Optional[Dict[str, int]] = None  # x, y for clicks


@dataclass
class NetworkRequest:
    """Represents a network request during replay."""
    timestamp: int
    method: str
    url: str
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    request_body: Optional[str] = None


@dataclass
class ReplaySession:
    """Analyzed replay session suitable for automated testing."""
    replay_id: str
    duration: int  # milliseconds
    url: str  # Starting URL
    actions: List[UserAction]
    network_requests: List[NetworkRequest]
    errors: List[Dict[str, Any]]
    metadata: Dict[str, Any]

    def to_test_script(self) -> str:
        """Generate a Playwright test script from this session."""
        script_lines = [
            "import { test, expect } from '@playwright/test';",
            "",
            f"test('replay-{self.replay_id[:8]}', async ({{ page }}) => {{",
            f"  // Original session duration: {self.duration}ms",
            f"  // URL: {self.url}",
            "",
            f"  await page.goto('{self.url}');",
            ""
        ]

        for action in self.actions:
            if action.action_type == 'click' and action.selector:
                script_lines.append(f"  await page.click('{action.selector}');")
            elif action.action_type == 'input' and action.selector and action.value:
                script_lines.append(f"  await page.fill('{action.selector}', '{action.value}');")
            elif action.action_type == 'navigation' and action.target:
                script_lines.append(f"  await page.goto('{action.target}');")

            # Add small delay to simulate real user behavior
            script_lines.append("  await page.waitForTimeout(100);")
            script_lines.append("")

        script_lines.append("  // Take final screenshot for comparison")
        script_lines.append(f"  await page.screenshot({{ path: 'screenshots/replay-{self.replay_id[:8]}.png' }});")
        script_lines.append("});")

        return "\n".join(script_lines)


class ReplayAnalyzer:
    """Analyzes Sentry replays to extract testable patterns."""

    def __init__(self):
        self.sessions: List[ReplaySession] = []

    def analyze_replay(self, replay_data: Dict[str, Any]) -> ReplaySession:
        """
        Analyze a single replay and extract actionable test data.

        Args:
            replay_data: Raw replay data from Sentry API

        Returns:
            Analyzed ReplaySession object
        """
        replay_id = replay_data.get('id', 'unknown')
        duration = replay_data.get('duration', 0)

        # Extract starting URL (may be in various fields)
        url = self._extract_url(replay_data)

        # Parse events (if available in the replay data)
        # Note: Actual event structure depends on Sentry's replay format
        actions = self._extract_actions(replay_data)
        network_requests = self._extract_network_requests(replay_data)
        errors = self._extract_errors(replay_data)

        metadata = {
            'user': replay_data.get('user', {}),
            'browser': replay_data.get('browser', {}),
            'os': replay_data.get('os', {}),
            'device': replay_data.get('device', {}),
            'started_at': replay_data.get('started_at'),
            'finished_at': replay_data.get('finished_at'),
            'error_count': replay_data.get('error_count', 0),
            'project_id': replay_data.get('project_id')
        }

        session = ReplaySession(
            replay_id=replay_id,
            duration=duration,
            url=url,
            actions=actions,
            network_requests=network_requests,
            errors=errors,
            metadata=metadata
        )

        self.sessions.append(session)
        return session

    def _extract_url(self, replay_data: Dict[str, Any]) -> str:
        """Extract starting URL from replay data."""
        # Check various possible fields
        if 'urls' in replay_data and replay_data['urls']:
            return replay_data['urls'][0]
        if 'url' in replay_data:
            return replay_data['url']
        if 'tags' in replay_data:
            for tag in replay_data['tags']:
                if tag.get('key') == 'url':
                    return tag.get('value', '')

        return 'https://example.com'  # Fallback

    def _extract_actions(self, replay_data: Dict[str, Any]) -> List[UserAction]:
        """
        Extract user actions from replay data.

        Note: This is a placeholder. Actual implementation depends on
        Sentry's replay event format, which may require fetching
        additional data via the events endpoint.
        """
        actions = []

        # Placeholder: In a real implementation, you'd parse the
        # rrweb events or Sentry's specific format
        # Example structure we might see:
        # {
        #   "type": 3,  # IncrementalSnapshot
        #   "data": {
        #     "source": 2,  # MouseInteraction
        #     "type": 2,  # Click
        #     "id": 123,
        #     "x": 100,
        #     "y": 200
        #   }
        # }

        return actions

    def _extract_network_requests(self, replay_data: Dict[str, Any]) -> List[NetworkRequest]:
        """Extract network requests from replay data."""
        requests = []

        # Placeholder: Parse network activity from replay
        # Sentry may include this in breadcrumbs or separate events

        return requests

    def _extract_errors(self, replay_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract errors from replay data."""
        errors = []

        if 'errors' in replay_data:
            errors = replay_data['errors']
        elif 'error_ids' in replay_data:
            # Would need to fetch error details separately
            errors = [{'id': eid} for eid in replay_data['error_ids']]

        return errors

    def analyze_coverage(self) -> Dict[str, Any]:
        """
        Analyze test coverage across all sessions.

        Returns:
            Coverage statistics
        """
        all_urls = []
        all_selectors = []
        all_browsers = []

        for session in self.sessions:
            all_urls.append(session.url)
            all_browsers.append(session.metadata.get('browser', {}).get('name'))

            for action in session.actions:
                if action.selector:
                    all_selectors.append(action.selector)

        return {
            'total_sessions': len(self.sessions),
            'unique_urls': len(set(all_urls)),
            'unique_selectors': len(set(all_selectors)),
            'url_distribution': dict(Counter(all_urls)),
            'browser_distribution': dict(Counter(all_browsers)),
            'total_actions': sum(len(s.actions) for s in self.sessions),
            'total_errors': sum(len(s.errors) for s in self.sessions)
        }

    def select_sessions_for_testing(
        self,
        max_sessions: int = 10,
        prioritize_errors: bool = True,
        min_duration: int = 1000  # milliseconds
    ) -> List[ReplaySession]:
        """
        Select most valuable sessions for automated testing.

        Args:
            max_sessions: Maximum number of sessions to select
            prioritize_errors: Prioritize sessions with errors
            min_duration: Minimum session duration in ms

        Returns:
            List of selected sessions
        """
        # Filter by minimum duration
        candidates = [s for s in self.sessions if s.duration >= min_duration]

        if prioritize_errors:
            # Sort by error count (descending) then by duration
            candidates.sort(
                key=lambda s: (len(s.errors), s.duration),
                reverse=True
            )
        else:
            # Sort by duration (longer sessions = more coverage)
            candidates.sort(key=lambda s: s.duration, reverse=True)

        return candidates[:max_sessions]

    def export_for_testing(self, output_dir: str = './tests'):
        """
        Export selected sessions as Playwright test scripts.

        Args:
            output_dir: Directory to write test files
        """
        import os

        os.makedirs(output_dir, exist_ok=True)
        selected = self.select_sessions_for_testing()

        for i, session in enumerate(selected):
            test_script = session.to_test_script()
            filename = f"{output_dir}/replay-{session.replay_id[:8]}.spec.ts"

            with open(filename, 'w') as f:
                f.write(test_script)

            print(f"Generated test: {filename}")

        # Generate a summary file
        summary = {
            'generated_at': datetime.utcnow().isoformat(),
            'total_tests': len(selected),
            'coverage': self.analyze_coverage(),
            'tests': [
                {
                    'replay_id': s.replay_id,
                    'duration': s.duration,
                    'url': s.url,
                    'action_count': len(s.actions),
                    'error_count': len(s.errors)
                }
                for s in selected
            ]
        }

        with open(f"{output_dir}/test-summary.json", 'w') as f:
            json.dump(summary, f, indent=2)

        print(f"\nGenerated {len(selected)} tests in {output_dir}/")
        print(f"Summary written to {output_dir}/test-summary.json")


def main():
    """Example usage of ReplayAnalyzer."""

    # Example replay data (simplified)
    sample_replay = {
        'id': 'abc123def456',
        'duration': 45000,  # 45 seconds
        'url': 'https://example.com/app',
        'user': {'email': 'user@example.com'},
        'browser': {'name': 'Chrome', 'version': '120.0'},
        'os': {'name': 'macOS', 'version': '14.0'},
        'error_count': 2,
        'errors': [
            {'message': 'TypeError: Cannot read property X'},
            {'message': 'NetworkError: Failed to fetch'}
        ]
    }

    analyzer = ReplayAnalyzer()

    # Analyze replay
    session = analyzer.analyze_replay(sample_replay)

    print("Analyzed Replay Session:")
    print(f"  ID: {session.replay_id}")
    print(f"  Duration: {session.duration}ms")
    print(f"  URL: {session.url}")
    print(f"  Errors: {len(session.errors)}")

    # Generate test script
    print("\nGenerated Test Script:")
    print(session.to_test_script())

    # Coverage analysis
    print("\nCoverage Analysis:")
    coverage = analyzer.analyze_coverage()
    print(json.dumps(coverage, indent=2))


if __name__ == '__main__':
    main()
