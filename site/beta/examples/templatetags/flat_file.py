from django import template

register = template.Library()

@register.simple_tag
def flat_path(files, *args, **kwargs):

    return "foo.js"