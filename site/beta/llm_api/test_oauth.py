import base64
import hashlib
import json
from datetime import timedelta
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import parse_qs, urlencode, urlsplit

from django.contrib.auth import get_user_model
from django.core.management import call_command, CommandError
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone
from examples.models import TheatreFile
from oauth2_provider.models import Grant, get_access_token_model, get_application_model

from .models import TheatreExample
from .oauth import resource_identifier


CALLBACK = "https://chatgpt.com/connector/oauth/yRaE1roUUgwO"
HOST = "www.polypoint.xyz"


class TheatreOAuthTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="oauth-owner", password="test-password")
        self.client = Client(enforce_csrf_checks=True, HTTP_HOST=HOST)
        call_command("register_theatre_oauth_client", redirect_uri=CALLBACK, stdout=StringIO())
        self.app = get_application_model().objects.get(client_id="polypoint-chatgpt")
        self.verifier = "a" * 64
        self.challenge = base64.urlsafe_b64encode(hashlib.sha256(self.verifier.encode()).digest()).rstrip(b"=").decode()
        self.authorize_url = reverse("oauth2_provider:authorize")
        self.token_url = reverse("oauth2_provider:token")

    def auth_params(self, **changes):
        return {"client_id": self.app.client_id, "response_type": "code", "redirect_uri": CALLBACK,
                "scope": "theatre", "state": "test-state", "resource": resource_identifier(),
                "code_challenge": self.challenge, "code_challenge_method": "S256"} | changes

    def grant(self, **changes):
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(**changes), secure=True)
        self.assertEqual(response.status_code, 200)
        form = response.context["form"]
        fields = {field.name: field.value() for field in form if field.is_hidden and field.value() is not None}
        fields["allow"] = "Authorize"
        fields["csrfmiddlewaretoken"] = self.client.cookies["csrftoken"].value
        response = self.client.post(self.authorize_url, fields, secure=True, HTTP_ORIGIN="https://" + HOST)
        self.assertEqual(response.status_code, 302)
        result = parse_qs(urlsplit(response["Location"]).query)
        return result

    def exchange(self, code, **changes):
        fields = {"grant_type": "authorization_code", "client_id": self.app.client_id,
                  "code": code, "redirect_uri": CALLBACK, "code_verifier": self.verifier,
                  "resource": resource_identifier()} | changes
        return self.client.post(self.token_url, urlencode(fields), secure=True,
                                content_type="application/x-www-form-urlencoded")

    def issue(self):
        result = self.grant()
        self.assertEqual(result["state"], ["test-state"])
        self.assertIn("code", result)
        response = self.exchange(result["code"][0])
        self.assertEqual(response.status_code, 200, response.content)
        return response.json()

    def rpc(self, token, tool="read_theatre", arguments=None):
        return self.client.post(reverse("llm_api:mcp"), json.dumps({"jsonrpc": "2.0", "id": 1,
            "method": "tools/call", "params": {"name": tool, "arguments": arguments or {"name": "missing"}}}),
            secure=True, content_type="application/json", HTTP_AUTHORIZATION="Bearer " + token,
            HTTP_ACCEPT="application/json, text/event-stream", HTTP_MCP_PROTOCOL_VERSION="2025-06-18")

    def test_discovery_and_challenge(self):
        metadata = self.client.get("/.well-known/oauth-authorization-server", secure=True).json()
        self.assertEqual(metadata["issuer"], "https://" + HOST)
        self.assertEqual(metadata["authorization_endpoint"], "https://" + HOST + self.authorize_url)
        self.assertEqual(metadata["token_endpoint_auth_methods_supported"], ["none"])
        self.assertEqual(metadata["code_challenge_methods_supported"], ["S256"])
        self.assertNotIn("registration_endpoint", metadata)
        self.assertFalse(metadata["client_id_metadata_document_supported"])
        protected = self.client.get("/.well-known/oauth-protected-resource/llm_api/mcp/", secure=True).json()
        self.assertEqual(protected["resource"], resource_identifier())
        self.assertEqual(protected["scopes_supported"], ["theatre"])
        response = self.rpc("invalid")
        self.assertEqual(response.status_code, 401)
        self.assertIn("resource_metadata=", response["WWW-Authenticate"])

    def test_pkce_flow_all_three_tools_and_token_hashing(self):
        issued = self.issue()
        token = issued["access_token"]
        stored = get_access_token_model().objects.get(user=self.user)
        self.assertNotEqual(stored.token, token)
        self.assertEqual(stored.resource, [resource_identifier()])
        created = self.rpc(token, "store_theatre", {"name": "oauth-example", "theatre_file_content": "hello"}).json()
        example = json.loads(created["result"]["content"][0]["text"])
        read = self.rpc(token, arguments={"id": example["id"]}).json()
        self.assertFalse(read["result"]["isError"])
        removed = self.rpc(token, "remove_theatre", {"id": example["id"], "revision": 1}).json()
        self.assertFalse(removed["result"]["isError"])
        self.assertTrue(TheatreExample.objects.get(pk=example["id"]).is_deleted)

    def test_oauth_can_search_and_read_indexed_theatre_files(self):
        token = self.issue()["access_token"]
        with TemporaryDirectory() as directory, self.settings(POLYPOINT_THEATRE_DIR=Path(directory)):
            source = "/*\ntitle: OAuth Catalogue\n*/\nconst example = true;\n"
            (Path(directory) / "example.js").write_text(source, encoding="utf-8")
            theatre = TheatreFile.objects.create(filepath="example.js", name="example", crc="0")
            listed = self.rpc(token, "list_theatre_files", {"query": "OAuth Catalogue"}).json()
            results = json.loads(listed["result"]["content"][0]["text"])
            self.assertEqual([item["id"] for item in results["theatres"]], [theatre.pk])
            read = self.rpc(token, "read_theatre_file", {"id": theatre.pk}).json()
            result = json.loads(read["result"]["content"][0]["text"])
            self.assertEqual(result["theatre_file_content"], source)

    def test_code_replay_wrong_verifier_and_wrong_resource(self):
        code = self.grant()["code"][0]
        self.assertEqual(self.exchange(code, code_verifier="b" * 64).status_code, 400)
        code = self.grant()["code"][0]
        self.assertEqual(self.exchange(code, resource="https://other.example/mcp").status_code, 400)
        code = self.grant()["code"][0]
        self.assertEqual(self.exchange(code).status_code, 200)
        self.assertEqual(self.exchange(code).status_code, 400)

    def test_missing_pkce_plain_pkce_redirect_and_resource_rejected(self):
        self.client.force_login(self.user)
        params = self.auth_params()
        params.pop("code_challenge")
        params.pop("code_challenge_method")
        response = self.client.get(self.authorize_url, params, secure=True)
        self.assertEqual(response.status_code, 302)
        self.assertIn("error", parse_qs(urlsplit(response["Location"]).query))
        self.assertFalse(Grant.objects.exists())
        result = self.grant(code_challenge_method="plain")
        self.assertIn("error", result)
        result = self.grant(resource="https://other.example/mcp")
        self.assertEqual(result.get("error"), ["invalid_target"])
        response = self.client.get(self.authorize_url, self.auth_params(redirect_uri="https://evil.example"), secure=True)
        self.assertNotEqual(response.status_code, 302)

    def test_scope_audience_expiration_and_user_status_enforced(self):
        for field, value in (("scope", ""), ("resource", []),
                             ("resource", ["https://other.example/mcp"]),
                             ("expires", timezone.now() - timedelta(seconds=1))):
            issued = self.issue()
            stored = get_access_token_model().objects.get(token_checksum=hashlib.sha256(issued["access_token"].encode()).hexdigest())
            setattr(stored, field, value)
            stored.save()
            self.assertEqual(self.rpc(issued["access_token"]).status_code, 401)
        issued = self.issue()
        self.user.is_active = False
        self.user.save()
        self.assertEqual(self.rpc(issued["access_token"]).status_code, 401)

    def test_refresh_rotation_and_revocation(self):
        issued = self.issue()
        response = self.client.post(self.token_url, urlencode({"grant_type": "refresh_token",
            "refresh_token": issued["refresh_token"], "client_id": self.app.client_id,
            "resource": resource_identifier()}), secure=True, content_type="application/x-www-form-urlencoded")
        self.assertEqual(response.status_code, 200, response.content)
        renewed = response.json()
        self.assertNotEqual(issued["refresh_token"], renewed["refresh_token"])
        self.assertEqual(self.rpc(issued["access_token"]).status_code, 401)
        self.assertEqual(self.rpc(renewed["access_token"]).status_code, 200)
        response = self.client.post(reverse("oauth2_provider:revoke-token"), urlencode({
            "client_id": self.app.client_id, "token": renewed["access_token"]}),
            secure=True, content_type="application/x-www-form-urlencoded")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.rpc(renewed["access_token"]).status_code, 401)

    def test_login_nonstaff_consent_and_csrf(self):
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("oauth2_provider:login"), response["Location"])
        response = self.client.get(response["Location"], secure=True)
        self.assertContains(response, "Sign in to Polypoint")
        self.client.force_login(self.user)
        response = self.client.post(self.authorize_url, self.auth_params() | {"allow": "Authorize"}, secure=True)
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.user.is_staff)
        self.assertIn("code", self.grant())

    def test_registration_is_idempotent_and_does_not_change_callbacks(self):
        call_command("register_theatre_oauth_client", redirect_uri=CALLBACK, stdout=StringIO())
        self.assertEqual(get_application_model().objects.count(), 1)
        with self.assertRaises(CommandError):
            call_command("register_theatre_oauth_client", redirect_uri=CALLBACK + "other", stdout=StringIO())
        for callback in ("https://evil.example/connector/oauth/id", CALLBACK + "#fragment", CALLBACK + " extra"):
            with self.assertRaises(CommandError):
                call_command("register_theatre_oauth_client", redirect_uri=callback, stdout=StringIO())
