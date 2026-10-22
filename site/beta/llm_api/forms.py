from django import forms
from django.contrib.auth import get_user_model


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
