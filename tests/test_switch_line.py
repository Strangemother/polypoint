import json
import tempfile
import unittest
from pathlib import Path

import switch_line


class SwitchLineTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.point_src = self.root / "point_src"
        self.theatre = self.root / "theatre"
        self.point_src.mkdir()
        self.theatre.mkdir()

    def tearDown(self):
        self.temp_dir.cleanup()

    def write_manifest(self, packs):
        path = self.point_src / "files.json"
        path.write_text(json.dumps(packs, indent=2), encoding="utf-8")
        return path

    def test_reseat_replaces_members_at_first_matching_position(self):
        self.write_manifest(
            {
                "point": ["point-pen.js", "pointdraw.js", "point.js"],
                "stage": ["stage.js"],
            }
        )
        theatre_file = self.theatre / "example.js"
        original = """/*
src_dir: ../point_src/
files:
    ../point_src/point-pen.js
    stage
    ../point_src/pointdraw.js
    point.js
---
Description text must not become a files entry.
*/
class Example {}
"""
        theatre_file.write_text(original, encoding="utf-8")

        changed = switch_line.reseat(self.root, "point")

        self.assertEqual(changed, [theatre_file])
        updated = theatre_file.read_text(encoding="utf-8")
        self.assertIn("files:\n    point\n    stage\n---", updated)
        self.assertIn("Description text must not become a files entry.", updated)
        self.assertNotIn("../point_src/point-pen.js", updated)
        self.assertNotIn("../point_src/pointdraw.js", updated)

        switch_line.reseat(self.root, "point")
        self.assertEqual(theatre_file.read_text(encoding="utf-8"), updated)

    def test_reseat_resolves_nested_packs(self):
        self.write_manifest(
            {
                "point-base": ["point-pen.js", "point.js"],
                "point": ["point-base", "pointdraw.js"],
            }
        )
        theatre_file = self.theatre / "example.js"
        theatre_file.write_text(
            """/*
files:
    ../point_src/point-pen.js
    ../point_src/point.js
    ../point_src/pointdraw.js
*/
""",
            encoding="utf-8",
        )

        switch_line.reseat(self.root, "point")

        self.assertIn("files:\n    point\n", theatre_file.read_text(encoding="utf-8"))

    def test_rename_updates_pack_and_full_path_metadata(self):
        self.write_manifest({"pointlist": ["pointlistpen.js", "pointlist.js"]})
        source_metadata = self.point_src / "pointlist.js"
        source_metadata.write_text(
            "/*\nfiles:\n    pointlistpen.js\n*/\n", encoding="utf-8"
        )
        theatre_file = self.theatre / "example.js"
        theatre_file.write_text(
            "/*\nfiles:\n    ../point_src/pointlistpen.js\n*/\n",
            encoding="utf-8",
        )
        (self.point_src / "pointlist-pen.js").write_text("", encoding="utf-8")

        changed = switch_line.rename_references(
            self.root, "pointlistpen.js", "pointlist-pen.js"
        )

        self.assertEqual(
            set(changed),
            {
                self.point_src / "files.json",
                source_metadata,
                theatre_file,
            },
        )
        self.assertIn("pointlist-pen.js", (self.point_src / "files.json").read_text())
        self.assertIn("    pointlist-pen.js", source_metadata.read_text())
        self.assertIn(
            "../point_src/pointlist-pen.js", theatre_file.read_text()
        )

    def test_dry_run_does_not_write(self):
        self.write_manifest({"point": ["point.js"]})
        theatre_file = self.theatre / "example.js"
        original = "/*\nfiles:\n    ../point_src/point.js\n*/\n"
        theatre_file.write_text(original, encoding="utf-8")

        changed = switch_line.reseat(self.root, "point", dry_run=True)

        self.assertEqual(changed, [theatre_file])
        self.assertEqual(theatre_file.read_text(encoding="utf-8"), original)

    def test_rename_requires_moved_asset_when_applying(self):
        self.write_manifest({"point": ["pointpen.js"]})

        with self.assertRaisesRegex(ValueError, "new asset does not exist"):
            switch_line.rename_references(
                self.root, "pointpen.js", "point-pen.js"
            )


if __name__ == "__main__":
    unittest.main()
