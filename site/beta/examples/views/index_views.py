import json
from pathlib import Path

from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404
from trim import views

from ..models import TheatreFileCategory
from ..theatre import get_theatre_list


class ExampleIndexTemplateView(views.ListView):
    """
    Index view for the examples, with a list of available files

        http://localhost:8000/examples/
    """

    orders = (
        ('name', 'Name'),
        ('modified', 'Date (Modified)'),
        ('created', 'Date (Created)'),
    )

    template_name = 'examples/index.html'

    """The directory to list,

        POLYPOINT_THEATRE_DIR: 'theatre/*.js' dir
        POLYPOINT_EXAMPLES_DIR: 'examples/*.html' dir

    This will change the list.
    """

    parent_dir = settings.POLYPOINT_EXAMPLES_DIR

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

        items = get_theatre_list(reverse=reverse, orderby=orderby, parent_dir=self.parent_dir)

        return items


class TheatreIndexTemplateView(ExampleIndexTemplateView):
    parent_dir = settings.POLYPOINT_THEATRE_DIR


class TheatreFileCategoryListView(views.ListView):
    template_name = 'examples/theatrefilecategory_list.html'

    def get_queryset(self):
        return TheatreFileCategory.objects.annotate(file_count=Count('files')).order_by('name')


class TheatreFileCategoryFilesView(views.ListView):
    template_name = 'examples/theatrefile_list.html'

    def get_queryset(self):
        self.category = get_object_or_404(TheatreFileCategory, name=self.kwargs['name'])
        return self.category.files.order_by('-modified', 'filepath')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['category'] = self.category
        return context


class TheatreIndexJSONTemplateView(ExampleIndexTemplateView):
    """Read the theatre list from the process json file."""

    parent_dir = settings.POLYPOINT_THEATRE_DIR
    filename = 'theatre-files.json'
    template_name = 'examples/json-index.html'

    def get_queryset(self):
        """
        Return the list of items for this view.
        """

        orderby = self.request.GET.get('orderby', None)
        reverse = self.request.GET.get('reverse', None) or ''
        reverse = reverse.lower().startswith('t')

        asset_path = (Path(self.parent_dir) / self.filename).read_text()
        data = json.loads(asset_path)['files']
        ordered_list = data
        if orderby:
            ordered_list = sorted(data, key=lambda d: str(d[orderby]).lower())
        if reverse:
            ordered_list = reversed(ordered_list)
        return list(ordered_list)