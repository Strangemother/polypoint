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
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from account.models import UserProfile
from examples.models import TheatreFile
from oauth2_provider.models import Grant, get_access_token_model, get_application_model

from .models import TheatreExample
from .oauth import resource_identifier


CALLBACK = "https://chatgpt.com/connector/oauth/yRaE1roUUgwO"
HOST = "www.polypoint.xyz"


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
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

    def authorization_fields(self, response):
        form = response.context["form"]
        fields = {field.name: field.value() for field in form if field.is_hidden and field.value() is not None}
        fields["allow"] = "Authorize"
        fields["csrfmiddlewaretoken"] = self.client.cookies["csrftoken"].value
        return fields

    def create_sub_account(self, username="ghostly", owner=None, **kwargs):
        user = get_user_model().objects.create_user(username=username, **kwargs)
        UserProfile.objects.create(user=user, owner=owner or self.user, sub_account=True)
        return user

    def grant(self, sub_account=None, **changes):
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(**changes), secure=True)
        self.assertEqual(response.status_code, 200)
        fields = self.authorization_fields(response)
        if sub_account is not None:
            fields["sub_account"] = sub_account.pk
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

    def issue(self, **changes):
        result = self.grant(**changes)
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

    def test_consent_lists_only_active_owned_sub_accounts(self):
        child = self.create_sub_account()
        other_owner = get_user_model().objects.create_user(username="other-owner")
        self.create_sub_account(username="other-child", owner=other_owner)
        self.create_sub_account(username="disabled-child", is_active=False)
        regular_user = get_user_model().objects.create_user(username="normal-user")
        UserProfile.objects.create(user=regular_user, owner=self.user)
        self.client.force_login(self.user)

        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)

        self.assertContains(response, "Current account (oauth-owner)")
        self.assertContains(response, "ghostly")
        self.assertNotContains(response, "other-child")
        self.assertNotContains(response, "disabled-child")
        self.assertNotContains(response, "normal-user")
        self.assertQuerySetEqual(
            response.context["form"].fields["sub_account"].queryset, [child]
        )
        self.assertTemplateUsed(response, "docs/doc-base.html")
        self.assertContains(response, "Create a sub-account")
        self.assertFalse(Grant.objects.exists())

    def test_selected_account_owns_grant_token_and_mcp_workspace(self):
        child = self.create_sub_account()
        private_example = TheatreExample.objects.create(
            owner=self.user, name="owner-private", source="private", visibility="private"
        )
        result = self.grant(sub_account=child)
        self.assertEqual(result["state"], ["test-state"])
        self.assertEqual(Grant.objects.get(code=result["code"][0]).user, child)
        response = self.exchange(result["code"][0])
        self.assertEqual(response.status_code, 200, response.content)
        issued = response.json()
        self.assertEqual(get_access_token_model().objects.get().user, child)
        self.assertEqual(self.client.session["_auth_user_id"], str(self.user.pk))
        created = self.rpc(issued["access_token"], "store_theatre", {
            "name": "child-example", "theatre_file_content": "hello",
        }).json()
        example = json.loads(created["result"]["content"][0]["text"])
        self.assertEqual(TheatreExample.objects.get(pk=example["id"]).owner, child)
        read = self.rpc(issued["access_token"], arguments={"id": example["id"]}).json()
        self.assertFalse(read["result"]["isError"])
        removed = self.rpc(issued["access_token"], "remove_theatre", {
            "id": example["id"], "revision": 1,
        }).json()
        self.assertFalse(removed["result"]["isError"])
        self.assertTrue(TheatreExample.objects.get(pk=example["id"]).is_deleted)
        denied = self.rpc(issued["access_token"], arguments={"id": private_example.pk}).json()
        self.assertTrue(denied["result"]["isError"])
        self.client.logout()
        response = self.client.post(self.token_url, urlencode({
            "grant_type": "refresh_token",
            "refresh_token": issued["refresh_token"],
            "client_id": self.app.client_id,
            "resource": resource_identifier(),
        }), secure=True, content_type="application/x-www-form-urlencoded")
        self.assertEqual(response.status_code, 200, response.content)
        renewed = response.json()
        stored = get_access_token_model().objects.get(
            token_checksum=hashlib.sha256(renewed["access_token"].encode()).hexdigest()
        )
        self.assertEqual(stored.user, child)
        self.assertEqual(self.rpc(renewed["access_token"]).status_code, 200)
        child.is_active = False
        child.save()
        self.assertEqual(self.rpc(renewed["access_token"]).status_code, 401)

    def test_invalid_account_selection_is_rejected_on_post(self):
        other_owner = get_user_model().objects.create_user(username="other-owner")
        other_child = self.create_sub_account(username="other-child", owner=other_owner)
        disabled = self.create_sub_account(username="disabled-child", is_active=False)
        regular = get_user_model().objects.create_user(username="regular-user")
        UserProfile.objects.create(user=regular, owner=self.user)
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        fields = self.authorization_fields(response)
        for pk in (other_child.pk, disabled.pk, regular.pk, self.user.pk, 99999):
            with self.subTest(pk=pk):
                response = self.client.post(
                    self.authorize_url, fields | {"sub_account": pk},
                    secure=True, HTTP_ORIGIN="https://" + HOST,
                )
                self.assertEqual(response.status_code, 200)
                self.assertIn("sub_account", response.context["form"].errors)
                self.assertFalse(Grant.objects.exists())
        self.assertEqual(self.client.session["_auth_user_id"], str(self.user.pk))

    def test_account_must_still_be_owned_when_consent_is_submitted(self):
        child = self.create_sub_account()
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        fields = self.authorization_fields(response) | {"sub_account": child.pk}
        UserProfile.objects.filter(user=child).update(owner=None)
        response = self.client.post(
            self.authorize_url, fields, secure=True, HTTP_ORIGIN="https://" + HOST,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("sub_account", response.context["form"].errors)
        self.assertFalse(Grant.objects.exists())

    def test_cancel_and_csrf_do_not_issue_sub_account_grants(self):
        child = self.create_sub_account()
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        fields = self.authorization_fields(response) | {"sub_account": child.pk}
        without_csrf = fields.copy()
        without_csrf.pop("csrfmiddlewaretoken")
        self.assertEqual(self.client.post(
            self.authorize_url, without_csrf, secure=True,
        ).status_code, 403)
        fields.pop("allow")
        response = self.client.post(
            self.authorize_url, fields, secure=True, HTTP_ORIGIN="https://" + HOST,
        )
        self.assertEqual(response.status_code, 302)
        result = parse_qs(urlsplit(response["Location"]).query)
        self.assertEqual(result["error"], ["access_denied"])
        self.assertEqual(result["state"], ["test-state"])
        self.assertFalse(Grant.objects.exists())
        self.assertFalse(get_access_token_model().objects.exists())

    def test_prior_authorization_does_not_skip_account_selection(self):
        self.issue()
        response = self.client.get(
            self.authorize_url, self.auth_params(approval_prompt="auto"), secure=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "MCP account")
        self.assertFalse(Grant.objects.exists())

    def test_login_create_and_select_preserves_oauth_request(self):
        self.user.set_password("owner-sign-in-harbor-937")
        self.user.save()
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        login_url = response["Location"]
        response = self.client.get(login_url, secure=True)
        self.assertTemplateUsed(response, "account/login.html")
        self.assertTemplateUsed(response, "docs/doc-base.html")
        response = self.client.post(reverse("oauth2_provider:login"), {
            "username": self.user.username,
            "password": "owner-sign-in-harbor-937",
            "next": response.context["next"],
            "csrfmiddlewaretoken": self.client.cookies["csrftoken"].value,
        }, secure=True, HTTP_ORIGIN="https://" + HOST)
        response = self.client.get(response["Location"], secure=True)
        create_url = response.context["create_sub_account_url"]
        response = self.client.get(create_url, secure=True)
        self.assertTemplateUsed(response, "account/sub_account_form.html")
        self.assertTemplateUsed(response, "docs/doc-base.html")
        data = {
            "username": "new-ghostly",
            "password1": "child-olive-harbor-937",
            "password2": "child-olive-harbor-937",
            "csrfmiddlewaretoken": self.client.cookies["csrftoken"].value,
        }
        invalid = self.client.post(
            create_url, data | {"password2": "different-password"},
            secure=True, HTTP_ORIGIN="https://" + HOST,
        )
        self.assertEqual(invalid.status_code, 200)
        self.assertFalse(get_user_model().objects.filter(username="new-ghostly").exists())
        response = self.client.post(
            create_url, data, secure=True, HTTP_ORIGIN="https://" + HOST,
        )
        self.assertEqual(response.status_code, 302)
        resumed_url = response["Location"]
        self.assertEqual(urlsplit(resumed_url).path, self.authorize_url)
        resumed_params = parse_qs(urlsplit(resumed_url).query)
        for key, value in self.auth_params().items():
            self.assertEqual(resumed_params[key], [value])
        child = get_user_model().objects.get(username="new-ghostly")
        self.assertEqual(child.account_profile.owner, self.user)
        self.assertTrue(child.account_profile.sub_account)
        response = self.client.get(resumed_url, secure=True)
        self.assertContains(response, "new-ghostly")
        fields = self.authorization_fields(response) | {"sub_account": child.pk}
        response = self.client.post(
            self.authorize_url, fields, secure=True, HTTP_ORIGIN="https://" + HOST,
        )
        result = parse_qs(urlsplit(response["Location"]).query)
        self.assertEqual(result["state"], ["test-state"])
        response = self.exchange(result["code"][0])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(get_access_token_model().objects.get().user, child)
        self.assertEqual(self.client.session["_auth_user_id"], str(self.user.pk))

    def test_sub_account_can_connect_itself_but_cannot_create(self):
        self.user = self.create_sub_account()
        response = self.client.get(reverse("oauth2_provider:create"), secure=True)
        self.assertEqual(response.status_code, 302)
        self.client.force_login(self.user)
        response = self.client.get(self.authorize_url, self.auth_params(), secure=True)
        self.assertNotContains(response, "Create a sub-account")
        self.assertEqual(self.client.get(
            reverse("oauth2_provider:create"), secure=True,
        ).status_code, 403)
        self.assertEqual(self.client.post(
            reverse("oauth2_provider:create"), secure=True,
            HTTP_ORIGIN="https://" + HOST,
            data={"csrfmiddlewaretoken": self.client.cookies["csrftoken"].value},
        ).status_code, 403)
        self.issue()
        self.assertEqual(get_access_token_model().objects.get().user, self.user)

    def test_registration_is_idempotent_and_does_not_change_callbacks(self):
        call_command("register_theatre_oauth_client", redirect_uri=CALLBACK, stdout=StringIO())
        self.assertEqual(get_application_model().objects.count(), 1)
        with self.assertRaises(CommandError):
            call_command("register_theatre_oauth_client", redirect_uri=CALLBACK + "other", stdout=StringIO())
        for callback in ("https://evil.example/connector/oauth/id", CALLBACK + "#fragment", CALLBACK + " extra"):
            with self.assertRaises(CommandError):
                call_command("register_theatre_oauth_client", redirect_uri=callback, stdout=StringIO())
