from django.conf import settings
from trim import views
from django.http import Http404

from pathlib import Path
from operator import itemgetter

from editor.views import PointSrcAssetView, TheatreSrcAssetView


def get_theatre_list(**kw):
    # get all files in the theatre dir
    # parent = settings.POLYPOINT_THEATRE_DIR
    parent = settings.POLYPOINT_EXAMPLES_DIR

    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            modified = asset.stat().st_mtime
            # get date
            res += (
                    (str(asset.relative_to(tpath)), modified,),
                )

    res = reversed(sorted(res, key=itemgetter(1)))
    return tuple(res)


class ExampleIndexTemplateView(views.ListView):
    """
    Index view for the examples, with a list of available files
    """
    template_name = 'examples/index.html'
    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        return get_theatre_list()


from .file_reader import imports_list

from django.conf import settings

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

    template_name = 'examples/file.html'

    def get_context_data(self, **kwargs):
        # kwargs.setdefault("view", self)
        # if self.extra_context is not None:
        #     kwargs.update(self.extra_context)
        # return kwargs
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
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
        ]
        return names
        # names = super().get_template_names()


class ExampleExtFileView(ExampleFileView):
    def get_template_names(self):
        path = self.kwargs.get('path')

        names = [
            path,
        ]
        return names
        # names = super().get_template_names()