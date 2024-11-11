from django import template
from django.template.defaultfilters import stringfilter


register = template.Library()

# @register.simple_tag
@register.filter
@stringfilter
def template_exists(template_name):
    try:
        template.loader.get_template(template_name)
        return True
    except (template.TemplateDoesNotExist, PermissionError):
        return False
