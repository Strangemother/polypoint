from django import template
# from django.urls import resolve, reverse
# from django.conf import settings
from django.template.loader import get_template


register = template.Library()

@register.filter
def template_exists(path):

    return get_template(path)
