#!/usr/bin/env python3
"""Tests for prepare_changelog.py."""

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from prepare_changelog import (
    extract_release_notes,
    finalize_release_date,
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


class TestFinalizeReleaseDate(unittest.TestCase):
    def test_replaces_tbd_with_date(self):
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("1.0.0", path)
        finalize_release_date("1.0.0", "2026-02-22", path)
        content = Path(path).read_text()
        self.assertIn("## [1.0.0] - 2026-02-22", content)
        self.assertNotIn("TBD", content)

    def test_rejects_invalid_version(self):
        path = _write_tmp(SAMPLE_CHANGELOG)
        with self.assertRaises(ValueError):
            finalize_release_date("bad", "2026-02-22", path)

    def test_rejects_invalid_date(self):
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("1.0.0", path)
        with self.assertRaises(ValueError):
            finalize_release_date("1.0.0", "22-02-2026", path)

    def test_raises_when_tbd_section_missing(self):
        path = _write_tmp(SAMPLE_CHANGELOG)
        with self.assertRaises(ValueError):
            finalize_release_date("9.9.9", "2026-02-22", path)

    def test_raises_when_file_missing(self):
        with self.assertRaises(FileNotFoundError):
            finalize_release_date("1.0.0", "2026-02-22", "/nonexistent.md")


class TestExtractReleaseNotes(unittest.TestCase):
    """Tests for extract_release_notes()."""

    PREPARED_CHANGELOG = """\
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - TBD

### Added

- New feature A

### Fixed

- Bug fix B

## [0.1.0] - 2025-12-01

### Added

- Initial release
"""

    def test_extracts_notes_for_existing_version(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        notes = extract_release_notes("1.0.0", path)
        self.assertIn("- New feature A", notes)
        self.assertIn("- Bug fix B", notes)

    def test_does_not_include_header_line(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        notes = extract_release_notes("1.0.0", path)
        self.assertNotIn("## [1.0.0]", notes)

    def test_does_not_include_next_version(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        notes = extract_release_notes("1.0.0", path)
        self.assertNotIn("Initial release", notes)
        self.assertNotIn("0.1.0", notes)

    def test_extracts_last_version(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        notes = extract_release_notes("0.1.0", path)
        self.assertIn("- Initial release", notes)

    def test_returns_empty_for_nonexistent_version(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        notes = extract_release_notes("9.9.9", path)
        self.assertEqual(notes, "")

    def test_rejects_invalid_version(self):
        path = _write_tmp(self.PREPARED_CHANGELOG)
        with self.assertRaises(ValueError):
            extract_release_notes("bad", path)

    def test_raises_when_file_missing(self):
        with self.assertRaises(FileNotFoundError):
            extract_release_notes("1.0.0", "/nonexistent.md")

    def test_round_trip_prepare_then_extract(self):
        """extract_release_notes works on the output of prepare_changelog."""
        path = _write_tmp(SAMPLE_CHANGELOG)
        prepare_changelog("2.0.0", path)
        notes = extract_release_notes("2.0.0", path)
        self.assertIn("- New feature A", notes)
        self.assertIn("- Bug fix B", notes)


if __name__ == "__main__":
    unittest.main()
