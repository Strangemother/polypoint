from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from .models import UserProfile


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class AccountTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.owner = self.user_model.objects.create_user(
            username="owner", password="owner-long-password"
        )
        self.other_owner = self.user_model.objects.create_user(
            username="other-owner", password="other-long-password"
        )
        self.index_url = reverse("account:index")
        self.create_url = reverse("account:create")
        self.login_url = reverse("account:login")
        self.client.force_login(self.owner)

    def test_index_displays_only_the_owners_sub_accounts(self):
        child = self.user_model.objects.create_user(username="child")
        other_child = self.user_model.objects.create_user(username="other-child")
        UserProfile.objects.create(user=child, owner=self.owner, sub_account=True)
        UserProfile.objects.create(
            user=other_child, owner=self.other_owner, sub_account=True
        )

        response = self.client.get(self.index_url)

        self.assertEqual(self.index_url, "/account/")
        self.assertContains(response, "<title>Account Page</title>")
        self.assertRegex(response.content.decode(), r"<h1\b[^>]*>\s*Account Page\s*</h1>")
        self.assertContains(response, "Signed in as owner.")
        self.assertContains(response, f'<a href="{self.index_url}">owner</a>', html=True)
        self.assertContains(response, "child")
        child_url = reverse("llm_api:user_theatre_view", args=(child.username,))
        self.assertEqual(child_url, "/llm_api/u/child/")
        self.assertContains(response, f'<a href="{child_url}">child</a>', html=True)
        self.assertNotContains(response, "other-child")
        self.assertContains(response, self.create_url)
        self.assertTemplateUsed(response, "account/index.html")
        self.assertTemplateUsed(response, "docs/doc-base.html")

    def test_anonymous_users_are_redirected_and_can_sign_in(self):
        client = Client()
        for url in (self.index_url, self.create_url):
            with self.subTest(url=url):
                self.assertRedirects(
                    client.get(url),
                    f"{self.login_url}?next={url}",
                    fetch_redirect_response=False,
                )
                self.assertRedirects(
                    client.post(url),
                    f"{self.login_url}?next={url}",
                    fetch_redirect_response=False,
                )

        response = client.post(
            self.login_url,
            {"username": "owner", "password": "owner-long-password", "next": self.create_url},
        )
        self.assertRedirects(response, self.create_url)

    def test_owner_creates_normal_user_and_profile(self):
        response = self.client.post(self.create_url, {
            "username": "assistant-user",
            "password1": "unusual-olive-harbor-937",
            "password2": "unusual-olive-harbor-937",
            "owner": self.other_owner.pk,
            "is_staff": True,
            "is_superuser": True,
        })

        self.assertRedirects(response, self.index_url)
        user = self.user_model.objects.get(username="assistant-user")
        self.assertTrue(user.check_password("unusual-olive-harbor-937"))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.groups.exists())
        profile = UserProfile.objects.get(user=user)
        self.assertTrue(profile.sub_account)
        self.assertEqual(profile.owner, self.owner)
        self.assertContains(self.client.get(self.index_url), "assistant-user")
        self.client.logout()
        response = self.client.post(reverse("oauth2_provider:login"), {
            "username": "assistant-user",
            "password": "unusual-olive-harbor-937",
            "next": self.index_url,
        })
        self.assertRedirects(response, self.index_url)
        self.assertContains(self.client.get(self.index_url), "Signed in as assistant-user.")

    def test_invalid_sub_account_forms_do_not_create_users(self):
        for data in (
            {"username": "owner", "password1": "unusual-olive-harbor-937", "password2": "unusual-olive-harbor-937"},
            {"username": "new-user", "password1": "short", "password2": "short"},
            {"username": "new-user", "password1": "unusual-olive-harbor-937", "password2": "different-password"},
        ):
            with self.subTest(data=data):
                response = self.client.post(self.create_url, data)
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.context["form"].errors)
                self.assertEqual(self.user_model.objects.count(), 2)
                self.assertFalse(UserProfile.objects.exists())

    def test_sub_accounts_cannot_create_accounts(self):
        child = self.user_model.objects.create_user(
            username="child", password="child-long-password"
        )
        UserProfile.objects.create(user=child, owner=self.owner, sub_account=True)
        self.client.logout()
        self.assertTrue(self.client.login(username="child", password="child-long-password"))

        response = self.client.get(self.index_url)
        self.assertContains(response, "Signed in as child.")
        self.assertNotContains(response, self.create_url)
        self.assertEqual(self.client.get(self.create_url).status_code, 403)
        self.assertEqual(self.client.post(self.create_url, {
            "username": "grandchild",
            "password1": "unusual-olive-harbor-937",
            "password2": "unusual-olive-harbor-937",
        }).status_code, 403)
        self.assertFalse(self.user_model.objects.filter(username="grandchild").exists())

    def test_owner_deletion_preserves_sub_account_marker(self):
        child = self.user_model.objects.create_user(username="child")
        profile = UserProfile.objects.create(
            user=child, owner=self.owner, sub_account=True
        )
        self.owner.delete()
        profile.refresh_from_db()
        self.assertIsNone(profile.owner)
        self.assertTrue(profile.sub_account)
        self.client.force_login(child)
        self.assertEqual(self.client.get(self.create_url).status_code, 403)

    def test_creation_requires_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.owner)
        response = client.post(self.create_url, {
            "username": "child",
            "password1": "unusual-olive-harbor-937",
            "password2": "unusual-olive-harbor-937",
        })
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.user_model.objects.filter(username="child").exists())

    def test_logout_requires_post_and_csrf(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.owner)
        url = reverse("account:logout")
        response = client.get(self.index_url)
        self.assertContains(response, f'action="{url}"')
        self.assertEqual(client.get(url).status_code, 405)
        self.assertEqual(client.post(url).status_code, 403)
        self.assertContains(client.get(self.index_url), "Signed in as owner.")
        response = client.post(url, {
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertRedirects(response, self.login_url)
        self.assertRedirects(
            client.get(self.index_url), f"{self.login_url}?next={self.index_url}",
            fetch_redirect_response=False,
        )

    def test_delete_confirmation_and_post_delete_user_and_profile(self):
        child, _ = self.create_password_target()
        url = reverse("account:delete", args=(child.pk,))
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.owner)
        self.assertContains(client.get(self.index_url), url)
        response = client.get(url)
        self.assertContains(response, "Delete password-child?")
        self.assertContains(response, f'<a href="{self.index_url}">Cancel</a>', html=True)
        self.assertTemplateUsed(response, "docs/doc-base.html")
        self.assertTrue(self.user_model.objects.filter(pk=child.pk).exists())
        self.assertEqual(client.post(url).status_code, 403)
        self.assertTrue(self.user_model.objects.filter(pk=child.pk).exists())
        response = client.post(url, {
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertRedirects(response, self.index_url)
        self.assertFalse(self.user_model.objects.filter(pk=child.pk).exists())
        self.assertFalse(UserProfile.objects.filter(user_id=child.pk).exists())
        self.assertContains(client.get(self.index_url), "Signed in as owner.")
        self.assertEqual(client.post(url, {
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        }).status_code, 404)

    def test_delete_requires_sign_in_and_ownership(self):
        child, _ = self.create_password_target()
        url = reverse("account:delete", args=(child.pk,))
        client = Client()
        for method in (client.get, client.post):
            self.assertRedirects(
                method(url), f"{self.login_url}?next={url}",
                fetch_redirect_response=False,
            )
        for user in (self.other_owner, child):
            client.force_login(user)
            for method in (client.get, client.post):
                self.assertEqual(method(url).status_code, 404)
        self.assertTrue(self.user_model.objects.filter(pk=child.pk).exists())

    def test_delete_excludes_normal_users_and_missing_users(self):
        UserProfile.objects.create(user=self.other_owner, owner=self.owner)
        for pk in (self.owner.pk, self.other_owner.pk, self.other_owner.pk + 1000):
            url = reverse("account:delete", args=(pk,))
            self.assertEqual(self.client.get(url).status_code, 404)
            self.assertEqual(self.client.post(url).status_code, 404)
        self.assertEqual(self.user_model.objects.count(), 2)

    def create_password_target(self):
        child = self.user_model.objects.create_user(
            username="password-child", password="original-harbor-password-937"
        )
        profile = UserProfile.objects.create(
            user=child, owner=self.owner, sub_account=True
        )
        return child, reverse("account:password", args=(profile.pk,))

    def test_owner_changes_sub_account_password_with_csrf(self):
        child, url = self.create_password_target()
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.owner)
        self.assertContains(client.get(self.index_url), url)
        response = client.get(url)
        self.assertContains(response, "Set a new password for password-child.")
        self.assertTemplateUsed(response, "docs/doc-base.html")
        self.assertNotIn("old_password", response.context["form"].fields)
        old_session = Client()
        old_session.force_login(child)

        response = client.post(url, {
            "new_password1": "updated-olive-harbor-938",
            "new_password2": "updated-olive-harbor-938",
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })

        self.assertRedirects(response, self.index_url)
        child.refresh_from_db()
        self.assertTrue(child.check_password("updated-olive-harbor-938"))
        self.assertFalse(child.check_password("original-harbor-password-937"))
        self.assertContains(client.get(self.index_url), "Signed in as owner.")
        self.assertRedirects(
            old_session.get(self.index_url),
            f"{self.login_url}?next={self.index_url}",
            fetch_redirect_response=False,
        )
        self.assertTrue(Client().login(
            username=child.username, password="updated-olive-harbor-938"
        ))

    def test_password_change_requires_sign_in_and_ownership(self):
        child, url = self.create_password_target()
        client = Client()
        for method in (client.get, client.post):
            self.assertRedirects(
                method(url), f"{self.login_url}?next={url}",
                fetch_redirect_response=False,
            )
        for user in (self.other_owner, child):
            client.force_login(user)
            for method in (client.get, client.post):
                self.assertEqual(method(url).status_code, 404)
        child.refresh_from_db()
        self.assertTrue(child.check_password("original-harbor-password-937"))

    def test_password_change_excludes_normal_and_missing_profiles(self):
        profile = UserProfile.objects.create(user=self.other_owner, owner=self.owner)
        for pk in (profile.pk, profile.pk + 1000):
            url = reverse("account:password", args=(pk,))
            self.assertEqual(self.client.get(url).status_code, 404)
            self.assertEqual(self.client.post(url).status_code, 404)

    def test_invalid_password_change_does_not_save(self):
        child, url = self.create_password_target()
        for first, second in (
            ("short", "short"),
            ("updated-olive-harbor-938", "different-password"),
            ("", ""),
        ):
            with self.subTest(first=first):
                response = self.client.post(url, {
                    "new_password1": first, "new_password2": second,
                })
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.context["form"].errors)
                child.refresh_from_db()
                self.assertTrue(child.check_password("original-harbor-password-937"))

    def test_password_change_requires_csrf(self):
        child, url = self.create_password_target()
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.owner)
        response = client.post(url, {
            "new_password1": "updated-olive-harbor-938",
            "new_password2": "updated-olive-harbor-938",
        })
        self.assertEqual(response.status_code, 403)
        child.refresh_from_db()
        self.assertTrue(child.check_password("original-harbor-password-937"))

    def test_browser_can_sign_in_and_create_with_csrf(self):
        client = Client(enforce_csrf_checks=True)
        login_page = client.get(self.login_url, {"next": self.create_url})
        self.assertContains(login_page, 'name="csrfmiddlewaretoken"')
        response = client.post(self.login_url, {
            "username": "owner",
            "password": "owner-long-password",
            "next": self.create_url,
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertRedirects(response, self.create_url)
        form_page = client.get(self.create_url)
        self.assertContains(form_page, 'name="csrfmiddlewaretoken"')
        self.assertContains(form_page, 'name="password1"')
        response = client.post(self.create_url, {
            "username": "browser-child",
            "password1": "unusual-olive-harbor-937",
            "password2": "unusual-olive-harbor-937",
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertRedirects(response, self.index_url)
        self.assertContains(client.get(self.index_url), "browser-child")

    def test_profile_failure_rolls_back_user_creation(self):
        with patch.object(UserProfile.objects, "create", side_effect=IntegrityError):
            with self.assertRaises(IntegrityError):
                self.client.post(self.create_url, {
                    "username": "child",
                    "password1": "unusual-olive-harbor-937",
                    "password2": "unusual-olive-harbor-937",
                })
        self.assertFalse(self.user_model.objects.filter(username="child").exists())
