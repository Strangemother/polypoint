from django import forms
from django.contrib.auth import get_user_model
from oauth2_provider.forms import AllowForm


class TheatreAuthorizationForm(AllowForm):
    sub_account = forms.ModelChoiceField(
        queryset=get_user_model().objects.none(),
        required=False,
        label="MCP account",
        help_text="Choose the account whose theatre workspace this connection will use.",
    )

    def __init__(self, *args, user, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["sub_account"].empty_label = f"Current account ({user.get_username()})"
        self.fields["sub_account"].queryset = get_user_model().objects.filter(
            is_active=True,
            account_profile__owner=user,
            account_profile__sub_account=True,
        ).order_by("username")


class TheatreAPIKeyForm(forms.Form):
    user = forms.ModelChoiceField(
        queryset=get_user_model()._default_manager.none(),
        label="User",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user_model = get_user_model()
        self.fields["user"].queryset = user_model._default_manager.filter(
            is_active=True
        ).order_by("pk")
