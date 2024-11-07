from django import template
from django.urls import resolve, reverse
from django.conf import settings


register = template.Library()

# @register.simple_tag(takes_context=True, name='file_content')
# def file_content(context, view_name, *url_args, **kwargs):


@register.inclusion_tag('templatetags/file_content.html', takes_context=True,
                        name='file_content')
def file_content_template(context, filename, *args, **kwargs):
    """Load the given file from the demos path, and return as a content to
    push into the view.
    """
    info = get_file_contents(filename)

    return {
        'egg': 20,
        'exists': info['exists'],
        'content': info['content'],
    }


@register.inclusion_tag('templatetags/code_content.html', takes_context=True,
                        name='code_content')
def code_content_template(context, filename, *args, **kwargs):
    """Load the given file from the demos path, and return as a content to
    push into the view.
    """
    info = get_file_contents(filename)

    return {
        'egg': 20,
        'lang_class': 'language-javascript',
        'exists': info['exists'],
        'content': info['content'],
        'uuid': rand_str()
    }

import string
import random


def rand_str(size=10, chars=string.ascii_lowercase + string.digits):
   return ''.join(random.choice(chars) for _ in range(size))


def get_file_contents(path):
    target = settings.POLYPOINT_DEMO_DIR / path
    print('target', target)
    exists = target.exists()
    content = None
    if exists:
        content = target.read_text()
    return {
        'exists': exists,
        'content': content,
    }