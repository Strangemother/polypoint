import hashlib
import json
import re
from datetime import timedelta
from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import TheatreAPIKey, TheatreExample


class TheatreAPIKeyCreateViewTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.staff_user = user_model.objects.create_user(
            username="staff",
            password="password",
            is_staff=True,
        )
        self.target_user = user_model.objects.create_user(
            username="api-user",
            password="password",
        )
        self.client.force_login(self.staff_user)
        self.url = reverse("llm_api:create_api_key")

    def test_staff_can_select_user_and_see_key_once_after_post(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.target_user.username)
        self.assertEqual(response["Cache-Control"], "no-store")
        self.assertFalse(TheatreAPIKey.objects.exists())

        response = self.client.post(
            self.url,
            {"user": str(self.target_user.pk)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "no-store")
        token_match = re.search(
            r"thk_[A-Za-z0-9_-]+",
            response.content.decode(),
        )
        self.assertIsNotNone(token_match)
        token = token_match.group()

        api_key = TheatreAPIKey.objects.get(user=self.target_user)
        self.assertEqual(
            api_key.key_hash,
            hashlib.sha256(token.encode("ascii")).hexdigest(),
        )
        self.assertNotEqual(api_key.key_hash, token)
        self.assertNotContains(self.client.get(self.url), token)

        api_response = self.client.post(
            reverse("llm_api:theatres"),
            data=urlencode({"action": "read", "name": "missing"}),
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=token,
        )
        self.assertEqual(api_response.status_code, 404)

    def test_only_staff_users_can_access_key_creation_view(self):
        non_staff = get_user_model().objects.create_user(
            username="regular",
            password="password",
        )
        client = Client()
        client.force_login(non_staff)

        response = client.get(self.url)

        self.assertEqual(response.status_code, 403)
        self.assertFalse(TheatreAPIKey.objects.exists())

    def test_anonymous_users_are_sent_to_admin_login(self):
        response = Client().get(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/django-admin/login/", response["Location"])


class TheatreAPIViewTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="owner",
            password="password",
        )
        self.api_key, self.token = TheatreAPIKey.issue_for(self.user)
        self.endpoint = reverse("llm_api:theatres")

    def post_fields(self, fields, token=None):
        return self.client.post(
            self.endpoint,
            data=urlencode(fields),
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=token or self.token,
        )

    def create_example(self, name="example", source="const example = true;"):
        return self.post_fields(
            {
                "action": "store",
                "name": name,
                "theatre_file_content": source,
            }
        )

    def test_create_and_read_preserves_form_encoded_source(self):
        source = 'const text = "café + & =";\nconsole.log(text);\n'
        created = self.create_example(source=source)

        self.assertEqual(created.status_code, 201)
        result = created.json()
        self.assertEqual(result["revision"], 1)
        self.assertTrue(result["created"])
        self.assertIn(result["id"], result["url"])
        self.assertEqual(created["Cache-Control"], "no-store")
        self.assertEqual(created["Content-Type"], "application/json; charset=utf-8")

        by_id = self.post_fields({"action": "read", "id": result["id"]})
        by_name = self.post_fields({"action": "read", "name": "example"})
        self.assertEqual(by_id.status_code, 200)
        self.assertEqual(by_id.json()["theatre_file_content"], source)
        self.assertEqual(by_name.json(), by_id.json())
        self.assertEqual(by_id.json()["visibility"], TheatreExample.Visibility.UNLISTED)
        self.assertTrue(by_id.json()["owned"])

    def test_store_requires_revisions_for_existing_examples(self):
        self.create_example()

        missing = self.post_fields(
            {
                "action": "store",
                "name": "example",
                "theatre_file_content": "changed",
            }
        )
        stale = self.post_fields(
            {
                "action": "store",
                "name": "example",
                "theatre_file_content": "changed",
                "revision": "2",
            }
        )
        self.assertEqual(missing.json()["error"]["code"], "revision_required")
        self.assertEqual(missing.json()["error"]["current_revision"], 1)
        self.assertEqual(stale.json()["error"]["code"], "revision_conflict")

        updated = self.post_fields(
            {
                "action": "store",
                "name": "example",
                "theatre_file_content": "changed",
                "revision": "1",
            }
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["revision"], 2)

        unchanged_source = self.post_fields(
            {
                "action": "store",
                "name": "example",
                "theatre_file_content": "changed",
                "revision": "2",
            }
        )
        self.assertEqual(unchanged_source.json()["revision"], 3)

    def test_revision_supplied_for_new_name_does_not_create(self):
        response = self.post_fields(
            {
                "action": "store",
                "name": "new-example",
                "theatre_file_content": "",
                "revision": "1",
            }
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["error"]["code"], "revision_conflict")
        self.assertFalse(TheatreExample.objects.exists())

    def test_remove_is_revision_checked_and_name_can_be_reused(self):
        created = self.create_example()
        example_id = created.json()["id"]

        missing_revision = self.post_fields(
            {"action": "remove", "id": example_id}
        )
        stale_revision = self.post_fields(
            {"action": "remove", "id": example_id, "revision": "2"}
        )
        self.assertEqual(
            missing_revision.json()["error"]["code"],
            "revision_required",
        )
        self.assertEqual(stale_revision.json()["error"]["code"], "revision_conflict")

        removed = self.post_fields(
            {"action": "remove", "id": example_id, "revision": "1"}
        )
        self.assertEqual(removed.status_code, 200)
        self.assertEqual(removed.json()["revision"], 1)
        self.assertTrue(
            TheatreExample.objects.get(pk=example_id).is_deleted
        )
        self.assertEqual(
            self.post_fields({"action": "read", "id": example_id}).status_code,
            404,
        )
        self.assertEqual(
            self.post_fields(
                {"action": "remove", "id": example_id, "revision": "1"}
            ).status_code,
            404,
        )

        recreated = self.create_example()
        self.assertEqual(recreated.status_code, 201)
        self.assertNotEqual(recreated.json()["id"], example_id)
        self.assertEqual(recreated.json()["revision"], 1)

    def test_unknown_or_foreign_ids_are_not_store_targets(self):
        foreign = TheatreExample.objects.create(
            owner=get_user_model().objects.create_user(username="other"),
            name="private-example",
            source="private",
        )

        for example_id in ("th_missing", foreign.pk):
            response = self.post_fields(
                {
                    "action": "store",
                    "id": example_id,
                    "theatre_file_content": "overwrite",
                    "revision": "1",
                }
            )
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json()["error"]["code"], "not_found")
        self.assertEqual(foreign.source, "private")

    def test_public_reads_and_name_collisions(self):
        other = get_user_model().objects.create_user(username="other")
        first = TheatreExample.objects.create(
            owner=other,
            name="shared",
            source="public one",
            visibility=TheatreExample.Visibility.PUBLIC,
        )
        second_user = get_user_model().objects.create_user(username="third")
        second = TheatreExample.objects.create(
            owner=second_user,
            name="shared",
            source="public two",
            visibility=TheatreExample.Visibility.PUBLIC,
        )
        private = TheatreExample.objects.create(
            owner=other,
            name="hidden",
            source="private",
        )

        collision = self.post_fields(
            {"action": "read", "name": "shared", "scope": "public"}
        )
        public_by_id = self.post_fields({"action": "read", "id": first.pk})
        private_by_id = self.post_fields({"action": "read", "id": private.pk})

        self.assertEqual(collision.status_code, 409)
        self.assertEqual(collision.json()["error"]["code"], "ambiguous_name")
        self.assertEqual(public_by_id.status_code, 200)
        self.assertFalse(public_by_id.json()["owned"])
        self.assertEqual(public_by_id.json()["theatre_file_content"], "public one")
        self.assertEqual(private_by_id.status_code, 404)
        self.assertNotEqual(first.pk, second.pk)

    def test_viewer_is_authenticated_visibility_checked_and_non_executing(self):
        public = TheatreExample.objects.create(
            owner=self.user,
            name="public",
            source="<script>not executed</script>",
            visibility=TheatreExample.Visibility.PUBLIC,
        )
        viewer_url = reverse(
            "llm_api:theatre_source_view",
            kwargs={"example_id": public.pk},
        )

        response = self.client.get(viewer_url, HTTP_AUTHORIZATION=self.token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/javascript; charset=utf-8")
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response.content.decode(), public.source)

        another_user = get_user_model().objects.create_user(username="another")
        another_key, another_token = TheatreAPIKey.issue_for(another_user)
        private = TheatreExample.objects.create(
            owner=self.user,
            name="private",
            source="secret",
            visibility=TheatreExample.Visibility.PRIVATE,
        )
        private_url = reverse(
            "llm_api:theatre_source_view",
            kwargs={"example_id": private.pk},
        )
        forbidden = self.client.get(
            private_url,
            HTTP_AUTHORIZATION=another_token,
        )
        self.assertEqual(forbidden.status_code, 404)
        self.assertTrue(another_key.pk)

    def test_invalid_or_missing_credentials_return_401(self):
        missing = self.client.post(
            self.endpoint,
            data=urlencode({"action": "read", "name": "example"}),
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(missing.status_code, 401)
        self.assertEqual(missing.json()["error"]["code"], "unauthorized")

        self.api_key.revoked_at = timezone.now()
        self.api_key.save(update_fields=("revoked_at",))
        revoked = self.post_fields({"action": "read", "name": "example"})
        self.assertEqual(revoked.status_code, 401)

        expired_key, expired_token = TheatreAPIKey.issue_for(
            self.user,
            expires_at=timezone.now() - timedelta(seconds=1),
        )
        expired = self.post_fields(
            {"action": "read", "name": "example"},
            token=expired_token,
        )
        self.assertEqual(expired.status_code, 401)
        self.assertTrue(expired_key.pk)

    def test_invalid_fields_and_duplicate_fields_return_400(self):
        invalid_name = self.post_fields(
            {
                "action": "store",
                "name": "has space",
                "theatre_file_content": "",
            }
        )
        unknown_field = self.post_fields(
            {"action": "read", "name": "example", "owner": "someone"}
        )
        scope_with_id = self.post_fields(
            {"action": "read", "id": "th_example", "scope": "public"}
        )
        duplicate = self.client.post(
            self.endpoint,
            data="action=read&name=first&name=second",
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=self.token,
        )
        malformed = self.client.post(
            self.endpoint,
            data="action=read&name=%",
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=self.token,
        )

        for response in (
            invalid_name,
            unknown_field,
            scope_with_id,
            duplicate,
            malformed,
        ):
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json()["error"]["code"], "invalid_request")

    def test_content_type_method_and_oversized_source_errors(self):
        unsupported = self.client.post(
            self.endpoint,
            data='{"action":"read"}',
            content_type="application/json",
            HTTP_AUTHORIZATION=self.token,
        )
        method = self.client.get(self.endpoint)
        oversized = self.create_example(source="&" * (1_048_576 + 1))

        self.assertEqual(unsupported.status_code, 415)
        self.assertEqual(unsupported.json()["error"]["code"], "unsupported_media_type")
        self.assertEqual(method.status_code, 405)
        self.assertEqual(method["Allow"], "POST")
        self.assertEqual(method.json()["error"]["code"], "method_not_allowed")
        self.assertEqual(oversized.status_code, 413)
        self.assertEqual(oversized.json()["error"]["code"], "content_too_large")


class UserTheatreViewerLatestChangeViewTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="viewer-owner")
        self.endpoint = reverse(
            "llm_api:user_theatre_latest_change",
            kwargs={"username": self.user.username},
        )

    def test_returns_newest_example_updated_after_stamp(self):
        stamp = timezone.now() - timedelta(days=1)
        earlier = TheatreExample.objects.create(
            owner=self.user,
            name="earlier",
            source="",
        )
        newest = TheatreExample.objects.create(
            owner=self.user,
            name="newest",
            source="",
        )
        earlier_change = stamp + timedelta(seconds=1)
        newest_change = stamp + timedelta(seconds=2)
        TheatreExample.objects.filter(pk=earlier.pk).update(
            updated_at=earlier_change
        )
        TheatreExample.objects.filter(pk=newest.pk).update(
            updated_at=newest_change
        )

        response = self.client.get(
            self.endpoint,
            {"stamp": stamp.timestamp()},
        )

        self.assertEqual(response.status_code, 200)
        self.assertAlmostEqual(
            response.json()["latest_change"],
            newest_change.timestamp(),
        )
        self.assertTrue(
            response.json()["url"].endswith(
                reverse("llm_api:theatre_view", kwargs={"example_id": newest.pk})
            )
        )

    def test_returns_stamp_when_there_is_no_newer_example(self):
        stamp = timezone.now()
        old_example = TheatreExample.objects.create(
            owner=self.user,
            name="old",
            source="",
        )
        TheatreExample.objects.filter(pk=old_example.pk).update(
            updated_at=stamp - timedelta(seconds=1)
        )

        response = self.client.get(
            self.endpoint,
            {"stamp": stamp.timestamp()},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"latest_change": stamp.timestamp(), "url": None, "navigation": None},
        )

    def test_invalid_stamp_returns_bad_request(self):
        response = self.client.get(self.endpoint, {"stamp": "not-a-timestamp"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["code"], "invalid_stamp")


class TheatreMCPTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="mcp-owner")
        self.key, self.token = TheatreAPIKey.issue_for(self.user)
        self.endpoint = reverse("llm_api:mcp")

    def rpc(self, method, params=None, request_id=1, **headers):
        message = {"jsonrpc": "2.0", "method": method}
        if request_id is not None:
            message["id"] = request_id
        if params is not None:
            message["params"] = params
        return self.client.post(
            self.endpoint, data=json.dumps(message),
            content_type="application/json",
            **({"HTTP_AUTHORIZATION": "Bearer " + self.token,
                "HTTP_ACCEPT": "application/json, text/event-stream",
                "HTTP_MCP_PROTOCOL_VERSION": "2025-06-18"} | headers),
        )

    def tool(self, name, arguments):
        return self.rpc("tools/call", {"name": name, "arguments": arguments}).json()

    def payload(self, result):
        return json.loads(result["result"]["content"][0]["text"])

    def test_tool_registry_matches_discovery_and_dispatch(self):
        from .mcp_tools import HANDLERS, TOOL_MODULES, TOOLS

        discovered = self.rpc("tools/list").json()["result"]["tools"]
        self.assertEqual(discovered, TOOLS)
        self.assertEqual(len(HANDLERS), len(TOOLS))
        for module in TOOL_MODULES:
            self.assertIs(HANDLERS[module.TOOL["name"]], module.handle)

        invalid_arguments = {
            "store_theatre": {},
            "read_theatre": {},
            "remove_theatre": {},
            "list_public_theatres": {"limit": True},
            "list_theatre_files": {"limit": True},
            "read_theatre_file": {},
            "request_view_action": {},
            "get_knowledge": {"topic": "unknown"},
            "validate_theatre": {},
        }
        self.assertEqual(set(invalid_arguments), set(HANDLERS))
        for name, arguments in invalid_arguments.items():
            with self.subTest(tool=name):
                self.assertEqual(self.tool(name, arguments)["error"]["code"], -32602)
        self.assertFalse(TheatreExample.objects.exists())

    def test_form_and_mcp_share_theatre_operations(self):
        endpoint = reverse("llm_api:theatres")
        created = self.client.post(
            endpoint,
            data=urlencode({
                "action": "store", "name": "shared-operation",
                "theatre_file_content": "const first = true;",
            }),
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=self.token,
        )
        self.assertEqual(created.status_code, 201)
        theatre_id = created.json()["id"]
        read = self.payload(self.tool("read_theatre", {"id": theatre_id}))
        self.assertEqual(read["theatre_file_content"], "const first = true;")
        updated = self.payload(self.tool("store_theatre", {
            "id": theatre_id, "revision": read["revision"],
            "theatre_file_content": "const second = true;",
        }))
        form_read = self.client.post(
            endpoint,
            data=urlencode({"action": "read", "id": theatre_id}),
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=self.token,
        )
        self.assertEqual(form_read.json()["theatre_file_content"], "const second = true;")
        removed = self.client.post(
            endpoint,
            data=urlencode({"action": "remove", "id": theatre_id, "revision": updated["revision"]}),
            content_type="application/x-www-form-urlencoded",
            HTTP_AUTHORIZATION=self.token,
        )
        self.assertEqual(removed.status_code, 200)
        missing = self.tool("read_theatre", {"id": theatre_id})
        self.assertTrue(missing["result"]["isError"])
        self.assertEqual(self.payload(missing)["error"]["code"], "not_found")


    def test_public_theatre_discovery_filters_private_and_pages(self):
        TheatreExample.objects.create(
            owner=self.user, name="secret", source="private",
            visibility=TheatreExample.Visibility.PRIVATE,
        )
        for name in ("atlas-one", "atlas-two"):
            TheatreExample.objects.create(
                owner=self.user, name=name,
                source="/*\ntitle: Atlas\ndescription: A mapped example\n*/",
                visibility=TheatreExample.Visibility.PUBLIC,
            )
        tools = self.rpc("tools/list").json()["result"]["tools"]
        self.assertIn("list_public_theatres", [t["name"] for t in tools])
        first = self.payload(self.tool("list_public_theatres", {"query": "atlas", "limit": 1}))
        self.assertEqual(first["count"], 1)
        self.assertEqual(first["next_offset"], 1)
        self.assertEqual(first["theatres"][0]["description"], "A mapped example")
        self.assertIn("/llm_api/theatres/", first["theatres"][0]["url"])
        second = self.payload(self.tool("list_public_theatres", {"limit": 1, "offset": 1}))
        self.assertEqual(second["count"], 1)
        self.assertNotEqual(first["theatres"][0]["id"], second["theatres"][0]["id"])
        self.assertEqual(self.payload(self.tool("list_public_theatres", {"query": "secret"}))["count"], 0)
        bad = self.rpc("tools/call", {"name": "list_public_theatres", "arguments": {"limit": 0}}).json()
        self.assertEqual(bad["error"]["code"], -32602)

    def test_public_discovery_uses_only_leading_metadata(self):
        for name, source in (
            ("summary-example", "/*\ntitle: Summary\nsummary: A short summary\n*/"),
            ("not-metadata", "const x = 1;\n/*\ndescription: Not a header\n*/"),
            ("long-description", "/*\ndescription: " + "a" * 260 + "\n*/"),
            ("long-header", "/*\ndescription: Beyond the limit\n" + "x" * 4096 + "\n*/"),
        ):
            TheatreExample.objects.create(
                owner=self.user, name=name, source=source,
                visibility=TheatreExample.Visibility.PUBLIC,
            )
        results = self.payload(self.tool("list_public_theatres", {}))["theatres"]
        descriptions = {item["name"]: item["description"] for item in results}
        self.assertEqual(descriptions["summary-example"], "A short summary")
        self.assertEqual(descriptions["not-metadata"], "")
        self.assertEqual(descriptions["long-description"], "a" * 240)
        self.assertEqual(descriptions["long-header"], "")

    def test_request_view_navigation_is_owner_scoped(self):
        owner_theatre = TheatreExample.objects.create(
            owner=self.user, name="private-navigation", source="const ok=true;"
        )
        other = get_user_model().objects.create_user(username="different-user")
        another = TheatreExample.objects.create(
            owner=other, name="foreign-private", source="secret",
            visibility=TheatreExample.Visibility.PRIVATE,
        )
        result = self.payload(self.tool("request_view_action", {"id": owner_theatre.pk}))
        self.assertTrue(result["ok"])
        self.assertIn(owner_theatre.pk, result["url"])
        polling_url = reverse("llm_api:user_theatre_latest_change", kwargs={"username": self.user.username})
        anonymous = self.client.get(polling_url, {"stamp": "0"}).json()
        self.assertIsNone(anonymous["navigation"])
        self.client.force_login(other)
        unauthorized = self.client.get(polling_url, {"stamp": "0"}).json()
        self.assertIsNone(unauthorized["navigation"])
        self.client.force_login(self.user)
        allowed = self.client.get(polling_url, {"stamp": "0"}).json()
        self.assertEqual(allowed["navigation"]["id"], result["command_id"])
        self.assertIn(owner_theatre.pk, allowed["navigation"]["url"])
        failed = self.payload(self.tool("request_view_action", {"id": another.pk}))
        self.assertFalse(failed["ok"])
        self.assertEqual(failed["error"]["code"], "not_found")

    def test_authoring_knowledge_and_validation_tools(self):
        names = [item["name"] for item in self.rpc("tools/list").json()["result"]["tools"]]
        self.assertIn("get_knowledge", names)
        self.assertIn("validate_theatre", names)
        result = self.payload(self.tool("get_knowledge", {"topic": "imports"}))
        self.assertTrue(result["ok"])
        self.assertIn("../point_src/stage.js", result["content"])
        self.assertEqual(self.rpc("tools/call", {"name": "get_knowledge", "arguments": {"topic": "../secret"}}).json()["error"]["code"], -32602)
        invalid = self.payload(self.tool("validate_theatre", {"theatre_file_content": "class MainStage extends Stage {}"}))
        self.assertFalse(invalid["ok"])
        self.assertIn("missing_header", [d["code"] for d in invalid["diagnostics"]])
        valid = self.payload(self.tool("validate_theatre", {"theatre_file_content": "/*\ntitle: Test\nfiles:\n    ../point_src/stage.js\n*/\nclass MainStage extends Stage { canvas = 'playspace'; }"}))
        self.assertTrue(valid["ok"])
        self.assertEqual(valid["diagnostics"], [])

    def test_bundled_examples_are_retrievable_and_copyable_via_mcp(self):
        from .knowledge.guide import EXAMPLES

        tools = self.rpc("tools/list").json()["result"]["tools"]
        schema = next(item for item in tools if item["name"] == "get_knowledge")["inputSchema"]
        topics = schema["properties"]["topic"]["enum"]
        index = self.payload(self.tool("get_knowledge", {"topic": "examples"}))
        self.assertEqual(len(EXAMPLES), 20)
        self.assertEqual({topic for topic in topics if topic.startswith("example-")}, set(EXAMPLES))
        starter = None
        for topic in EXAMPLES:
            with self.subTest(topic=topic):
                self.assertIn(topic, topics)
                self.assertIn(topic, index["content"])
                result = self.payload(self.tool("get_knowledge", {"topic": topic}))
                self.assertTrue(result["ok"])
                match = re.search(r"```javascript\n([\s\S]*?)\n```", result["content"])
                self.assertIsNotNone(match)
                source = match.group(1) + "\n"
                checked = self.payload(self.tool("validate_theatre", {"theatre_file_content": source}))
                self.assertTrue(checked["ok"], checked["diagnostics"])
                if topic == "example-line":
                    starter = source

        self.assertIsNotNone(starter)
        stored = self.payload(self.tool("store_theatre", {
            "name": "bundled-line", "theatre_file_content": starter,
        }))
        read = self.payload(self.tool("read_theatre", {"id": stored["id"]}))
        self.assertEqual(read["theatre_file_content"], starter)
        with self.settings(STORAGES={
            "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
        }):
            viewer = self.client.get(stored["url"])
        self.assertEqual(viewer.status_code, 200)
        self.assertContains(viewer, "point_src")

    def test_initialize_discover_notify_and_ping(self):
        response = self.rpc("initialize", {
            "protocolVersion": "2099-01-01", "capabilities": {},
            "clientInfo": {"name": "test", "version": "1"},
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["result"]["protocolVersion"], "2025-06-18")
        self.assertEqual(response["Cache-Control"], "no-store")
        self.assertNotIn("Mcp-Session-Id", response)
        notify = self.rpc("notifications/initialized", request_id=None)
        self.assertEqual(notify.status_code, 202)
        self.assertEqual(notify.content, b"")
        tools = self.rpc("tools/list").json()["result"]["tools"]
        self.assertEqual({t["name"] for t in tools}, {
            "store_theatre", "read_theatre", "remove_theatre",
            "list_public_theatres", "list_theatre_files", "read_theatre_file",
            "request_view_action", "get_knowledge", "validate_theatre"})
        self.assertTrue(next(t for t in tools if t["name"] == "read_theatre")["annotations"]["readOnlyHint"])
        for name in ("list_theatre_files", "read_theatre_file"):
            tool = next(item for item in tools if item["name"] == name)
            self.assertTrue(tool["annotations"]["readOnlyHint"])
            self.assertFalse(tool["annotations"]["destructiveHint"])
        self.assertEqual(self.rpc("ping").json()["result"], {})

    def test_full_lifecycle_and_revision_conflict(self):
        source = 'const text = "café + & =";\r\n'
        created = self.payload(self.tool("store_theatre", {
            "name": "mcp-example", "theatre_file_content": source}))
        self.assertEqual(created["revision"], 1)
        read = self.payload(self.tool("read_theatre", {"id": created["id"]}))
        self.assertEqual(read["theatre_file_content"], source)
        conflict = self.tool("store_theatre", {
            "id": created["id"], "theatre_file_content": "changed"})
        self.assertTrue(conflict["result"]["isError"])
        self.assertEqual(self.payload(conflict)["error"]["code"], "revision_required")
        updated = self.payload(self.tool("store_theatre", {
            "id": created["id"], "theatre_file_content": "changed", "revision": 1}))
        self.assertEqual(updated["revision"], 2)
        stale = self.payload(self.tool("remove_theatre", {"id": created["id"], "revision": 1}))
        self.assertEqual(stale["error"]["code"], "revision_conflict")
        removed = self.payload(self.tool("remove_theatre", {"id": created["id"], "revision": 2}))
        self.assertTrue(removed["removed"])
        self.assertEqual(self.payload(self.tool("read_theatre", {"id": created["id"]}))["error"]["code"], "not_found")

    def test_ownership_and_public_reads(self):
        other = get_user_model().objects.create_user(username="other-mcp")
        example = TheatreExample.objects.create(owner=other, name="other", source="other")
        for name, args in (
            ("read_theatre", {"id": example.pk}),
            ("store_theatre", {"id": example.pk, "revision": 1, "theatre_file_content": "oops"}),
            ("remove_theatre", {"id": example.pk, "revision": 1}),
        ):
            self.assertEqual(self.payload(self.tool(name, args))["error"]["code"], "not_found")
        example.visibility = "public"
        example.save()
        result = self.payload(self.tool("read_theatre", {"name": "other", "scope": "public"}))
        self.assertEqual(result["theatre_file_content"], "other")
        self.assertFalse(result["owned"])

    def test_authentication_origin_and_http_transport(self):
        self.assertEqual(self.rpc("tools/list", HTTP_AUTHORIZATION="").status_code, 401)
        self.assertEqual(self.rpc("tools/list", HTTP_ORIGIN="https://evil.example").status_code, 403)
        self.assertEqual(self.rpc("tools/list", HTTP_ORIGIN="http://testserver").status_code, 200)
        self.assertEqual(self.rpc("tools/list", HTTP_ACCEPT="application/json").status_code, 406)
        self.assertEqual(self.rpc("tools/list", HTTP_MCP_PROTOCOL_VERSION="invalid").status_code, 400)
        for method in (self.client.get, self.client.delete):
            response = method(self.endpoint, HTTP_AUTHORIZATION="Bearer " + self.token)
            self.assertEqual(response.status_code, 405)
            self.assertEqual(response["Allow"], "POST")
        self.key.revoked_at = timezone.now()
        self.key.save()
        self.assertEqual(self.rpc("tools/list").status_code, 401)

    def test_invalid_arguments_do_not_mutate(self):
        for arguments in (
            {"name": "one", "id": "two", "theatre_file_content": "x"},
            {"name": "../escape", "theatre_file_content": "x"},
            {"name": "one", "theatre_file_content": "x", "owner": "other"},
            {"name": "one", "theatre_file_content": "x", "revision": True},
            {"name": "one", "theatre_file_content": "x", "revision": "1"},
            {"name": "one", "theatre_file_content": "x" * 1_048_577},
        ):
            self.assertEqual(self.tool("store_theatre", arguments)["error"]["code"], -32602)
        self.assertEqual(self.tool("remove_theatre", {"name": "one"})["error"]["code"], -32602)
        self.assertEqual(self.tool("read_theatre", {"id": "one", "scope": "public"})["error"]["code"], -32602)
        self.assertEqual(self.tool("unknown", {})["error"]["code"], -32602)
        self.assertFalse(TheatreExample.objects.exists())

    def test_malformed_messages_and_notification_cannot_execute_tool(self):
        for body in ('{', '[]', '{"jsonrpc":"2.0","id":1,"id":2,"method":"ping"}',
                     '{"jsonrpc":"2.0","id":true,"method":"ping"}'):
            response = self.client.post(self.endpoint, body, content_type="application/json",
                HTTP_AUTHORIZATION="Bearer " + self.token,
                HTTP_ACCEPT="application/json, text/event-stream")
            self.assertEqual(response.status_code, 400)
        self.assertEqual(self.rpc("unknown").json()["error"]["code"], -32601)
        response = self.rpc("tools/call", {"name": "store_theatre", "arguments": {
            "name": "nope", "theatre_file_content": "x"}}, request_id=None)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(TheatreExample.objects.exists())

    def test_form_api_accepts_bearer_and_legacy_raw_key(self):
        for token in (self.token, "Bearer " + self.token):
            response = self.client.post(reverse("llm_api:theatres"),
                urlencode({"action": "read", "name": "missing"}),
                content_type="application/x-www-form-urlencoded", HTTP_AUTHORIZATION=token)
            self.assertEqual(response.status_code, 404)


class AnonymousTheatreVisibilityTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(username="sharing-owner")
        self.poll_url = reverse(
            "llm_api:user_theatre_latest_change",
            kwargs={"username": self.owner.username},
        )

    @override_settings(STORAGES={
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    })
    def test_unlisted_default_is_link_viewable_but_private_is_not(self):
        unlisted = TheatreExample.objects.create(
            owner=self.owner, name="shared", source="const visible = true;"
        )
        private = TheatreExample.objects.create(
            owner=self.owner, name="secret", source="const secret = true;",
            visibility=TheatreExample.Visibility.PRIVATE,
        )
        self.assertEqual(unlisted.visibility, TheatreExample.Visibility.UNLISTED)
        for theatre, expected in ((unlisted, 200), (private, 404)):
            url = reverse("llm_api:theatre_view", kwargs={"example_id": theatre.pk})
            self.assertEqual(Client().get(url).status_code, expected)
            source_url = reverse("llm_api:theatre_source_view", kwargs={"example_id": theatre.pk})
            response = Client().get(source_url)
            self.assertEqual(response.status_code, expected)
            if expected == 200:
                self.assertIn(b"const visible", response.content)

    def test_anonymous_watcher_only_tracks_nonprivate_active_theatres(self):
        unlisted = TheatreExample.objects.create(
            owner=self.owner, name="unlisted", source="hello"
        )
        private = TheatreExample.objects.create(
            owner=self.owner, name="private", source="secret",
            visibility=TheatreExample.Visibility.PRIVATE,
        )
        now = timezone.now()
        TheatreExample.objects.filter(pk=unlisted.pk).update(
            updated_at=now - timedelta(seconds=2)
        )
        TheatreExample.objects.filter(pk=private.pk).update(
            updated_at=now - timedelta(seconds=1)
        )
        result = Client().get(
            self.poll_url, {"stamp": (now - timedelta(seconds=10)).timestamp()}
        )
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()["url"].endswith(
            reverse("llm_api:theatre_view", kwargs={"example_id": unlisted.pk})
        ))
        self.assertIsNone(result.json()["navigation"])
