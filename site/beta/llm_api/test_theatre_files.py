import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from examples.models import TheatreFile

from .models import TheatreAPIKey


class TheatreFileMCPTests(TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name) / "theatre"
        self.root.mkdir()
        override = override_settings(POLYPOINT_THEATRE_DIR=self.root)
        override.enable()
        self.addCleanup(override.disable)
        user = get_user_model().objects.create_user(username="catalogue-user")
        _, self.token = TheatreAPIKey.issue_for(user)
        self.endpoint = reverse("llm_api:mcp")
        self.alpha = self.create_file(
            "alpha.js",
            "/*\ntitle: Celestial Orbit\nfiles:\n    stage\n*/\nconst star = 'café';\n",
        )
        self.beta = self.create_file(
            "nested/Beta.js",
            "/*\n---\ntitle: Another Orbit\n---\n*/\nconst beta = 1;\n",
        )
        self.plain = self.create_file("plain.txt", "plain source\n", name="Plain fallback")

    def create_file(self, filepath, source, name=None):
        target = self.root / filepath
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(source.encode("utf-8"))
        return TheatreFile.objects.create(
            filepath=filepath,
            name=name or target.stem,
            description="A catalogue description",
            crc="0",
        )

    def call(self, name, arguments, authenticated=True):
        message = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments},
        }
        return self.client.post(
            self.endpoint,
            data=json.dumps(message),
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer " + self.token if authenticated else "",
            HTTP_ACCEPT="application/json, text/event-stream",
            HTTP_MCP_PROTOCOL_VERSION="2025-06-18",
        )

    def payload(self, response):
        result = response.json()["result"]
        return result, json.loads(result["content"][0]["text"])

    def test_lists_and_filters_metadata_title_or_filename(self):
        _, result = self.payload(self.call("list_theatre_files", {"query": "cElEsTiAl"}))
        self.assertEqual([item["id"] for item in result["theatres"]], [self.alpha.pk])
        self.assertEqual(result["theatres"][0]["title"], "Celestial Orbit")
        self.assertEqual(result["theatres"][0]["filepath"], "alpha.js")
        _, result = self.payload(self.call("list_theatre_files", {"query": "bEtA"}))
        self.assertEqual([item["id"] for item in result["theatres"]], [self.beta.pk])
        _, result = self.payload(self.call("list_theatre_files", {"query": "plain fallback"}))
        self.assertEqual([item["id"] for item in result["theatres"]], [self.plain.pk])

    def test_pagination_applies_after_title_filtering(self):
        pages = []
        offset = 0
        while offset is not None:
            _, result = self.payload(
                self.call(
                    "list_theatre_files",
                    {
                        "query": "orbit",
                        "limit": 1,
                        "offset": offset,
                    },
                )
            )
            self.assertEqual(result["count"], 1)
            pages.extend(item["id"] for item in result["theatres"])
            offset = result["next_offset"]
        self.assertEqual(pages, [self.alpha.pk, self.beta.pk])
        _, page = self.payload(self.call("list_theatre_files", {"limit": 1, "offset": 2}))
        self.assertEqual([item["id"] for item in page["theatres"]], [self.plain.pk])
        self.assertIsNone(page["next_offset"])
        _, page = self.payload(self.call("list_theatre_files", {"offset": 2**63 - 1}))
        self.assertEqual(page["count"], 0)
        self.assertIsNone(page["next_offset"])

    def test_reads_by_id_or_filepath_and_preserves_complete_source(self):
        source = "/*\r\ntitle: Large Example\r\n*/\r\n" + "x" * 1_049_000
        theatre = self.create_file("large.js", source)
        for arguments in ({"id": theatre.pk}, {"filepath": "large.js"}):
            with self.subTest(arguments=arguments):
                result, payload = self.payload(self.call("read_theatre_file", arguments))
                self.assertFalse(result["isError"])
                self.assertEqual(payload["id"], theatre.pk)
                self.assertEqual(payload["title"], "Large Example")
                self.assertEqual(payload["filepath"], "large.js")
                self.assertEqual(payload["theatre_file_content"], source)
        _, payload = self.payload(self.call("read_theatre_file", {"id": self.plain.pk}))
        self.assertEqual(payload["theatre_file_content"], "plain source\n")

    def test_title_search_uses_current_source_not_a_stale_cache(self):
        (self.root / "alpha.js").write_text("/*\ntitle: Updated Title\n*/\n", encoding="utf-8")
        _, result = self.payload(self.call("list_theatre_files", {"query": "updated title"}))
        self.assertEqual([item["id"] for item in result["theatres"]], [self.alpha.pk])

    def test_missing_and_unreadable_files_are_explicit(self):
        missing = TheatreFile.objects.create(filepath="missing.js", name="missing", crc="0")
        broken = self.root / "invalid.js"
        broken.write_bytes(b"/*\ntitle: Bad\n*/\n\xff")
        invalid = TheatreFile.objects.create(filepath="invalid.js", name="invalid", crc="0")
        with self.assertLogs("llm_api.theatre_catalogue", level="WARNING"):
            for record, code in ((missing, "source_not_found"), (invalid, "invalid_encoding")):
                with self.subTest(record=record.pk):
                    result, payload = self.payload(
                        self.call("read_theatre_file", {"id": record.pk})
                    )
                    self.assertTrue(result["isError"])
                    self.assertEqual(payload["error"]["code"], code)
            _, listing = self.payload(self.call("list_theatre_files", {"query": "missing.js"}))
        self.assertEqual(listing["theatres"][0]["source_error"]["code"], "source_not_found")
        self.assertEqual(listing["warnings"][0]["code"], "title_search_incomplete")
        self.assertEqual(listing["warnings"][0]["affected_count"], 2)

    def test_rejects_unsafe_indexed_paths_and_unindexed_files(self):
        secret = Path(self.directory.name) / "secret.js"
        secret.write_text("outside-secret", encoding="utf-8")
        traversal = TheatreFile.objects.create(filepath="../secret.js", name="escape", crc="0")
        absolute = TheatreFile.objects.create(filepath=str(secret), name="absolute", crc="0")
        symlink = self.root / "escape.js"
        symlink.symlink_to(secret)
        link = TheatreFile.objects.create(filepath="escape.js", name="link", crc="0")
        for record in (traversal, absolute, link):
            with self.subTest(record=record.pk):
                result, payload = self.payload(self.call("read_theatre_file", {"id": record.pk}))
                self.assertTrue(result["isError"])
                self.assertEqual(payload["error"]["code"], "invalid_path")
                self.assertNotIn("outside-secret", str(payload))
        result, payload = self.payload(
            self.call("read_theatre_file", {"filepath": "../secret-other.js"})
        )
        self.assertTrue(result["isError"])
        self.assertEqual(payload["error"]["code"], "not_found")
        (self.root / "unindexed.js").write_text("unindexed", encoding="utf-8")
        result, payload = self.payload(self.call("read_theatre_file", {"filepath": "unindexed.js"}))
        self.assertTrue(result["isError"])
        self.assertEqual(payload["error"]["code"], "not_found")

    def test_allows_symlinks_that_stay_in_the_theatre_directory(self):
        (self.root / "alias.js").symlink_to(self.root / "alpha.js")
        alias = TheatreFile.objects.create(filepath="alias.js", name="alias", crc="0")
        result, payload = self.payload(self.call("read_theatre_file", {"id": alias.pk}))
        self.assertFalse(result["isError"])
        self.assertEqual(payload["title"], "Celestial Orbit")

    def test_permission_errors_are_reported(self):
        with (
            patch("llm_api.theatre_catalogue.Path.open", side_effect=PermissionError("denied")),
            self.assertLogs("llm_api.theatre_catalogue", level="WARNING"),
        ):
            result, payload = self.payload(self.call("read_theatre_file", {"id": self.alpha.pk}))
        self.assertTrue(result["isError"])
        self.assertEqual(payload["error"]["code"], "source_unreadable")

    def test_duplicate_filepaths_require_id(self):
        duplicate = TheatreFile.objects.create(filepath="alpha.js", name="duplicate", crc="0")
        result, payload = self.payload(self.call("read_theatre_file", {"filepath": "alpha.js"}))
        self.assertTrue(result["isError"])
        self.assertEqual(payload["error"]["code"], "ambiguous_filepath")
        _, payload = self.payload(self.call("read_theatre_file", {"id": duplicate.pk}))
        self.assertEqual(payload["theatre_file_content"], (self.root / "alpha.js").read_text())

    def test_invalid_arguments_and_authentication(self):
        for name, arguments in (
            ("list_theatre_files", {"query": 2}),
            ("list_theatre_files", {"query": "x" * 101}),
            ("list_theatre_files", {"limit": 0}),
            ("list_theatre_files", {"offset": -1}),
            ("list_theatre_files", {"offset": True}),
            ("list_theatre_files", {"offset": 2**63}),
            ("list_theatre_files", {"unknown": "x"}),
            ("read_theatre_file", {}),
            ("read_theatre_file", {"id": True}),
            ("read_theatre_file", {"id": 0}),
            ("read_theatre_file", {"id": 2**63}),
            ("read_theatre_file", {"filepath": ""}),
            ("read_theatre_file", {"filepath": "x" * 256}),
            ("read_theatre_file", {"id": self.alpha.pk, "filepath": "alpha.js"}),
        ):
            with self.subTest(name=name, arguments=arguments):
                self.assertEqual(self.call(name, arguments).json()["error"]["code"], -32602)
        response = self.call("list_theatre_files", {}, authenticated=False)
        self.assertEqual(response.status_code, 401)
        response = self.call("read_theatre_file", {"id": self.alpha.pk}, authenticated=False)
        self.assertEqual(response.status_code, 401)
