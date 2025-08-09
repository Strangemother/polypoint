from django import forms
from trim.forms import fields
# from . import models


class ImagePostForm(forms.Form):
    image_file = fields.image()
    theatre_filename = fields.chars()
    series_index = fields.chars(required=False)


class CloneFileForm(forms.Form):
    new_name = fields.chars(max_length=255)

    class Meta:
        fields = ('new_name',)


class ConfirmForm(forms.Form):
    pass