
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'examples'

urlpatterns = urls.paths_named(views,
    example=('ExampleIndexTemplateView', '',),
    point_src=('PointSrcAssetView', ('point_src/<path:path>',)),
    theatre_src=('TheatreSrcAssetView', ('theatre/<path:path>',)),
    script_raw=('ScriptsRawImportView', 'script_list_raw/<str:name>/'),
    script_list=('ScriptsImportListView', 'script_list/<str:name>/'),

    file_example=('ExampleFileView', '<path:path>/'),
    file_example_html=('ExampleExtFileView', '<path:path>.html/'),
)