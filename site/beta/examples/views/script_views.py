from django.conf import settings
from trim import views

from ..file_reader import imports_list


class ScriptsImportListView(views.ListView):
    """
    Index view for the examples, with a list of available files
    """

    template_name = 'examples/script_list.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        name = self.kwargs.get('name')
        r['page_title'] = name
        return r

    def get_queryset(self):
        """
        Return the list of items for this view.
        """

        name = self.kwargs.get('name')
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