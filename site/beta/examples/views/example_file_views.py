from pathlib import Path

from django.conf import settings
from trim import views

from ..theatre import get_metadata
from .utils import remove_comments


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
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
        meta = get_metadata(path)

        # flag to call the _single file_ endpoint
        # rather than list all files individually.
        r['concat_file'] = False

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

        names = [path, f"{path}.html", self.template_name] + super().get_template_names()
        return names


class ExampleFileScriptsView(views.TemplateView):
    """Display a list of imports (files) for the given path.

    http://localhost:8000/examples/scripts/graph-chain-follow-raw-2/

    """

    template_name = 'examples/file_scripts_view.html'
    include_theatre_file = False

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        response['Content-Type'] = 'text/javascript'
        return response

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
        meta = get_metadata(path)

        res_strings = ('/* js output. */\n',)

        target = Path(settings.POLYPOINT_THEATRE_DIR)
        for subpath in meta['clean_files']:
            content = target / Path(subpath)

            if not content.exists():
                continue
            res_strings += (content.read_text(),)

        if self.include_theatre_file:
            if meta['filepath_exists']:
                content = target / meta['filepath']
                res_strings += (content.read_text(),)

        print('Concating', len(res_strings), 'files.')

        r['concat_content'] = remove_comments('\n;\n;'.join(res_strings))
        r['closed_scope'] = True
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
            self.template_name,
        ]
        return names


class ExampleFileScriptsAndTheatreView(ExampleFileScriptsView):
    include_theatre_file = True


class ExampleExtFileView(ExampleFileView):
    def get_template_names(self):
        path = self.kwargs.get('path')

        names = [
            path,
        ]
        return names