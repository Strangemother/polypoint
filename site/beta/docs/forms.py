from django import forms


class SearchSymbolForm(forms.Form):
    q = forms.CharField(max_length=255, required=True, label="Query")
