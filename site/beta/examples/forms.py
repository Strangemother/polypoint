from django import forms
from trim.forms import fields
# from . import models


class CloneFileForm(forms.Form):
    new_name = fields.chars(max_length=255)

    class Meta:
        fields = ('new_name',)