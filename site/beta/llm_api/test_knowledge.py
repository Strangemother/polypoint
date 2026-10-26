import json
import re
import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

from examples.theatre import get_source_metadata

from .knowledge.guide import DOCS, EXAMPLES, TOPICS, get_guide, read_header_metadata, validate_source


def example_source(topic):
    content = get_guide(topic)["content"]
    match = re.search(r"```javascript\n([\s\S]*?)\n```", content)
    if match is None:
        raise AssertionError(f"{topic} does not contain a JavaScript source block")
    return match.group(1) + "\n"


class KnowledgeDeckTests(SimpleTestCase):
    def test_every_example_is_complete_and_resolves_its_dependencies(self):
        self.assertEqual(len(EXAMPLES), 20)
        self.assertEqual(len(EXAMPLES), len(set(EXAMPLES)))
        self.assertEqual(len({item[0] for item in EXAMPLES.values()}), 20)
        index = get_guide("examples")["content"]
        for topic, (filename, _, _) in EXAMPLES.items():
            with self.subTest(topic=topic):
                self.assertIn(topic, TOPICS)
                self.assertIn(f"`{topic}`", index)
                result = get_guide(topic)
                self.assertTrue(result["ok"])
                self.assertEqual(result["topic"], topic)
                self.assertEqual(result["format"], "text/markdown")
                self.assertIn(f"theatre/{filename}", result["content"])
                source = example_source(topic)
                self.assertEqual(source, (DOCS / "examples" / filename).read_text(encoding="utf-8").rstrip() + "\n")
                self.assertTrue(validate_source(source)["ok"])
                metadata = get_source_metadata(source)
                self.assertTrue(metadata.get("title"))
                self.assertTrue(metadata["files"])
                parsed = read_header_metadata(source)
                self.assertIsNotNone(parsed)
                self.assertEqual(tuple(filter(None, parsed["files"])), metadata["files"])
                for filepath in metadata["clean_files"]:
                    path = (Path(settings.POLYPOINT_THEATRE_DIR) / filepath).resolve()
                    self.assertTrue(path.is_file(), f"{topic}: missing dependency {filepath}")

    def test_validator_understands_viewer_metadata_and_stage_bundles(self):
        for entry in ("stage", "other", "everything", "../point_src/stage.js"):
            with self.subTest(entry=entry):
                source = (
                    "/*\n---\ntitle: Example\nfiles:\n"
                    f"    head\n    {entry}\n"
                    "---\n*/\nclass MainStage extends Stage { canvas = 'playspace'; }"
                )
                self.assertTrue(validate_source(source)["ok"])

        source = (
            "/*\ntitle: ../point_src/stage.js\nfiles:\n    head\n*/\n"
            "class MainStage extends Stage { canvas = 'playspace'; }"
        )
        result = validate_source(source)
        self.assertFalse(result["ok"])
        self.assertIn("missing_stage_import", [item["code"] for item in result["diagnostics"]])

    def test_tabbed_and_indented_metadata_match_the_viewer(self):
        for header in (
            "title: Tabbed\nfiles:\n\tstage",
            "    ---\n    title: Indented\n    files:\n        stage\n    ---",
            "    title: Windows\r\n    files:\r\n        stage",
        ):
            with self.subTest(header=header):
                source = f"/*\n{header}\n*/\nclass MainStage extends Stage {{ canvas = 'playspace'; }}"
                metadata = read_header_metadata(source)
                self.assertIsNotNone(metadata)
                self.assertEqual(
                    tuple(filter(None, metadata["files"])),
                    get_source_metadata(source)["files"],
                )
                self.assertTrue(validate_source(source)["ok"])

    def test_examples_execute_with_resolved_scripts_in_mocked_dom(self):
        node = shutil.which("node")
        if node is None:
            self.skipTest("Node.js is required for the mocked runtime smoke test")

        sources = [(topic, example_source(topic)) for topic in EXAMPLES]
        starter_blocks = re.findall(r"```javascript\n([\s\S]*?)\n```", get_guide("imports")["content"])
        self.assertEqual(len(starter_blocks), 2)
        sources.append(("guide-imports-starter", starter_blocks[-1] + "\n"))
        examples = []
        for topic, source in sources:
            self.assertTrue(validate_source(source)["ok"], topic)
            metadata = get_source_metadata(source)
            files = [
                {
                    "name": filepath,
                    "path": str((Path(settings.POLYPOINT_THEATRE_DIR) / filepath).resolve()),
                }
                for filepath in metadata["clean_files"]
            ]
            examples.append({"topic": topic, "source": source, "files": files})
        script = Path(settings.SITE_DIR) / "tests" / "theatre-knowledge-runtime.cjs"
        result = subprocess.run(
            [node, str(script)],
            input=json.dumps(examples),
            text=True,
            capture_output=True,
            timeout=60,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(result.stdout.count("PASS "), 21, result.stdout)
