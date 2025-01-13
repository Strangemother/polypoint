
from django import forms
from trim.forms import fields


class TreeForm(forms.Form):
    content = fields.json(required=True)
    filename = fields.text(required=True)
    # cc_myself = fields.bool_false() # A boolean field if `False` prepared
    # subject = fields.chars(max_length=255, required=False) # CharField
    # message = fields.text(required=True) # A ready-to-go CharField with a TextArea widget