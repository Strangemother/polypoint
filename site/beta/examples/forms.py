from django import forms
from trim.forms import fields
# from . import models


class ImagePostForm(forms.Form):
    image_file = fields.image()
    theatre_filename = fields.chars()
    series_index = fields.chars(required=False)


class MetaForm(forms.Form):
    """Given the file and some notes to populate the
    theatre data info with knowledge.
    """
    theatrefile_id = fields.chars(required=False)
    theatre_filename = fields.chars(required=False)
    notes = fields.text(required=False)


class FileDescriptionForm(forms.Form):
    """desc.
    """
    description = fields.text(required=False)


class CloneFileForm(forms.Form):
    new_name = fields.chars(max_length=255)

    class Meta:
        fields = ('new_name',)


class ConfirmForm(forms.Form):
    pass