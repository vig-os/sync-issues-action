#!/usr/bin/env python3
"""Tests for prepare_changelog.py."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from prepare_changelog import (
    prepare_changelog,
    reset_unreleased,
    validate_changelog,
)

SAMPLE_CHANGELOG = """\
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- New feature A

### Fixed

- Bug fix B

## [0.1.0] - 2025-12-01

### Added

- Initial release
"""


def _write_tmp(content):
    f = tempfile.NamedTemporaryFile(
        mode="w", suffix=".md", delete=False, prefix="changelog_"
    )
    f.write(content)
    f.close()
    return f.name


class TestPrepareChangelog(unittest.TestCase):
    def test_prepare_does_not_create_unreleased_section(self):
        """prepare() should NOT add an Unreleased section on the release branch.

        The Unreleased section is only created by the reset command after
        the release is merged back to dev. If prepare leaves an Unreleased
        section, reset_unreleased() will fail with 'already exists'.
        """
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("1.0.0", path)
        content = Path(path).read_text()

        self.assertIn("## [1.0.0] - TBD", content)
        self.assertNotIn(
            "## Unreleased",
            content,
            "prepare() must NOT create an Unreleased section on the release branch; "
            "reset_unreleased() is responsible for that after merge back to dev",
        )

    def test_prepare_then_reset_round_trip(self):
        """Full cycle: prepare removes Unreleased, reset re-creates it."""
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("1.0.0", path)
        content = Path(path).read_text()
        self.assertNotIn("## Unreleased", content)

        reset_unreleased(path)
        content = Path(path).read_text()
        self.assertIn("## Unreleased", content)
        self.assertIn("## [1.0.0] - TBD", content)

    def test_prepare_moves_content_to_version_section(self):
        """Content from Unreleased is moved to the version section."""
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("1.0.0", path)
        content = Path(path).read_text()

        self.assertIn("- New feature A", content)
        self.assertIn("- Bug fix B", content)
        self.assertIn("## [1.0.0] - TBD", content)

    def test_validate_passes_with_content(self):
        path = _write_tmp(SAMPLE_CHANGELOG)
        has_section, has_content = validate_changelog(path)
        self.assertTrue(has_section)
        self.assertTrue(has_content)

    def test_validate_fails_without_unreleased(self):
        changelog_no_unreleased = """\
# Changelog

## [0.1.0] - 2025-12-01

### Added

- Initial release
"""
        path = _write_tmp(changelog_no_unreleased)
        has_section, has_content = validate_changelog(path)
        self.assertFalse(has_section)

    def test_reset_fails_when_unreleased_exists(self):
        """reset_unreleased() should error if Unreleased already exists."""
        path = _write_tmp(SAMPLE_CHANGELOG)
        with self.assertRaises(ValueError) as ctx:
            reset_unreleased(path)
        self.assertIn("already exists", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
