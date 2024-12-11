from pprint import pprint as pp
from operator import itemgetter
from pathlib import Path
import markdown
import textwrap
import re

from django.http import Http404
from django.conf import settings
from trim import views

from editor.views import PointSrcAssetView, TheatreSrcAssetView
from .file_reader import imports_list

from .theatre import get_theatre_list, get_metadata


class ExampleIndexTemplateView(views.ListView):
    """
    Index view for the examples, with a list of available files

        http://localhost:8000/examples/
    """
    template_name = 'examples/index.html'
    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        orderby = self.request.GET.get('orderby', None)
        reverse = 'reverse' in self.request.GET
        return get_theatre_list(reverse=reverse, orderby=orderby)


class ScriptsImportListView(views.ListView):
    """
    Index view for the examples, with a list of available files
    """
    template_name = 'examples/script_list.html'

    def get_context_data(self, **kwargs):
        # kwargs.setdefault("view", self)
        # if self.extra_context is not None:
        #     kwargs.update(self.extra_context)
        # return kwargs
        r = super().get_context_data(**kwargs)
        name = self.kwargs.get('name')
        r['page_title'] = name
        return r

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        name = self.kwargs.get('name')
        # name = "angle-point"
        target = settings.POLYPOINT_EXAMPLES_DIR
        filename = f'{target}/{name}.html'
        tag = 'script'
        return imports_list(filename, tag)


class ScriptsRawImportView(ScriptsImportListView):
    """
    render the script tags, relative to the ./examples/import/ dir,
    used to produce an import file.
    """
    template_name = 'examples/script_tags.html'


class ExampleFileView(views.TemplateView):
    """Show an _example_ file from the given `path`.

        http://localhost:8000/examples/lerp-line/

    + Attempt `examples/lerp-line.html` template
    + In the template, try `examples/imports/lerp-line.html` extras
    + In the browser, attempt request to `theatre/lerp-line.js`

    This is a combination of `examples/` theatre files, and their imports.
    The template is chosen from `examples` using the `{path}.html`.
    If this template does not exist, the default `template_name` is used.

    The `examples/imports` may apply, found by the name of the path:
    `examples/imports/{path}.html`

    Finally the _theatre_ file is attempted at `theatre/{path}.js`.
    """
    # The template file will be generated based upon the
    # path; e.g. "egg" -> "theatre/egg.js", "examples/egg.html"
    # If the template file does not exist, use this default template.
    template_name = 'default_template.html'

    def get_context_data(self, **kwargs):
        # kwargs.setdefault("view", self)
        # if self.extra_context is not None:
        #     kwargs.update(self.extra_context)
        # return kwargs
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
        meta = get_metadata(path)

        r['metadata'] = meta
        md = meta.get('markdown', None)
        if md:
            r['markdown'] = md
            del meta['markdown']
        return r

    def get_template_names(self):
        """
        Return a list of template names to be used for the request. Must return
        a list. May not be called if render_to_response is overridden.
        """
        path = self.kwargs.get('path')

        names = [
            path,
            f"{path}.html",
            self.template_name
        ]
        # names = super().get_template_names()
        return names


class ExampleExtFileView(ExampleFileView):
    def get_template_names(self):
        path = self.kwargs.get('path')

        names = [
            path,
        ]
        return names
        # names = super().get_template_names()