from django.contrib.auth import get_user_model
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from trim import views

from .forms import SubAccountCreationForm
from .models import UserProfile


class LoginView(views.LoginView):
    template_name = "account/login.html"
    next_page = reverse_lazy("account:index")


class LogoutView(views.LogoutView):
    http_method_names = ["post", "options"]
    next_page = reverse_lazy("account:login")


class AccountLoginRequiredMixin(LoginRequiredMixin):
    login_url = reverse_lazy("account:login")


@method_decorator(never_cache, name="dispatch")
class IndexView(AccountLoginRequiredMixin, views.TemplateView):
    template_name = "account/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["can_create_sub_account"] = not UserProfile.objects.filter(
            user=self.request.user, sub_account=True
        ).exists()
        context["sub_accounts"] = UserProfile.objects.filter(
            owner=self.request.user, sub_account=True
        ).select_related("user").order_by("user__username")
        return context


@method_decorator(never_cache, name="dispatch")
class SubAccountCreateView(
    AccountLoginRequiredMixin, UserPassesTestMixin, views.FormView
):
    template_name = "account/sub_account_form.html"
    form_class = SubAccountCreationForm
    success_url = reverse_lazy("account:index")

    def test_func(self):
        return not UserProfile.objects.filter(
            user=self.request.user, sub_account=True
        ).exists()

    def form_valid(self, form):
        with transaction.atomic():
            user = form.save()
            UserProfile.objects.create(
                user=user, owner=self.request.user, sub_account=True
            )
        return super().form_valid(form)


@method_decorator(never_cache, name="dispatch")
class SubAccountPasswordView(AccountLoginRequiredMixin, views.FormView):
    template_name = "account/sub_account_password_form.html"
    form_class = SetPasswordForm
    success_url = reverse_lazy("account:index")

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        profile = get_object_or_404(
            UserProfile.objects.select_related("user"),
            pk=self.kwargs["pk"],
            owner=self.request.user,
            sub_account=True,
        )
        kwargs["user"] = profile.user
        return kwargs

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)


@method_decorator(never_cache, name="dispatch")
class SubAccountDeleteView(AccountLoginRequiredMixin, views.DeleteView):
    template_name = "account/sub_account_confirm_delete.html"
    success_url = reverse_lazy("account:index")
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return get_user_model().objects.filter(
            account_profile__owner=self.request.user,
            account_profile__sub_account=True,
        )
