from pprint import pprint as pp
import shutil
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

from .theatre import get_theatre_list, get_theatre_filelist, get_metadata
from . import forms
from . import theatre_process


class ExampleIndexTemplateView(views.ListView):
    """
    Index view for the examples, with a list of available files

        http://localhost:8000/examples/
    """
    orders = (
            ('name','Name', ),
            ('modified', 'Date (Modified)'),
            ('created', 'Date (Created)'),
        )

    template_name = 'examples/index.html'

    def get_orderby(self):
        orderby = self.request.GET.get('orderby', None)
        return orderby

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        orderby = self.request.GET.get('orderby', None)
        reverse = self.request.GET.get('reverse', None) or ''
        reverse = reverse.lower().startswith('t')
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


class CloneFileView(views.FormView):
    form_class = forms.CloneFileForm
    template_name = 'examples/clone_form.html'

    def get_initial(self):
        tp = self.get_target_path()

        tp = tp.with_suffix('')
        tp = tp.with_name(f'{tp.name}_clone')

        return {
            'new_name': str(tp)
        }

    def form_valid(self, form):
        target = Path(settings.POLYPOINT_THEATRE_DIR)
        orig = self.get_target_path()
        fp = target / orig
        if fp.exists() is False:
            fp = fp.with_suffix('.js')
            if fp.exists() is False:
                raise Exception(f'file does not exist {fp}')

        new_name = form.cleaned_data['new_name']
        clean_name = Path(new_name).with_suffix('.js')
        # Copy original file,
        new_fp = target / clean_name
        if new_fp.exists():
            raise Exception(f'Target file already exists {new_fp}')

        self.perform_file_action(fp, new_fp)
        self.target_path = clean_name
        # redirect to new.
        return super().form_valid(form)

    def perform_file_action(self, fp, new_fp):
        shutil.copyfile(fp, new_fp)

    def get_target_path(self):
        return Path(self.kwargs.get('path'))

    def get_success_url(self):
        args = (self.target_path, )
        # args = (self.get_target_path(), )
        return views.reverse("examples:file_example", args=args)


class RenameFileView(CloneFileView):

    def get_initial(self):
        tp = self.get_target_path()

        tp = tp.with_suffix('')
        tp = tp.with_name('erica-homestead')

        return {
            'new_name': str(tp)
        }

    def perform_file_action(self, fp, new_fp):
        shutil.move(fp, new_fp)


class ExampleExtFileView(ExampleFileView):
    def get_template_names(self):
        path = self.kwargs.get('path')

        names = [
            path,
        ]
        return names
        # names = super().get_template_names()
        #


class ImmediateProcessTheatreFilesView(views.FormView):
    form_class = forms.ConfirmForm
    template_name = 'examples/clone_form.html'

    def form_valid(self, form):
        tp = theatre_process.TheatreProcessor()
        tp.parse_theatre(settings.POLYPOINT_THEATRE_DIR)
        return super().form_valid(form)

    def get_success_url(self):
        return views.reverse("examples:example")


from trim.response import content_type_response


class ExampleFileImagesView(views.TemplateView):
    template_name = 'default_template.html'

    def get(self, request, *args, **kwargs):
        print('ExampleFileImagesView')
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)

    def render_to_response(self, context, **response_kwargs):
        """
        Return a response, using the `response_class` for this view, with a
        template rendered with the given context.
        Pass response_kwargs to the constructor of the response class.
        """
        # response_kwargs.setdefault("content_type", self.content_type)
        path = self.kwargs.get('path')
        root = settings.POLYPOINT_THEATRE_DIR
        real_filepath = settings.POLYPOINT_THEATRE_DIR / 'images' / path

        return content_type_response(real_filepath)

        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            using=self.template_engine,
            **response_kwargs,
        )