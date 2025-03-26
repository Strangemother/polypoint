
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'examples'

urlpatterns = urls.paths_named(views,
    example=('ExampleIndexTemplateView', '',),
    theatre_process=('ImmediateProcessTheatreFilesView', ('process/',)),
    point_src=('PointSrcAssetView', ('point_src/<path:path>',)),
    theatre_src=('TheatreSrcAssetView', ('theatre/<path:path>',)),
    script_raw=('ScriptsRawImportView', 'script_list_raw/<str:name>/'),
    script_list=('ScriptsImportListView', 'script_list/<str:name>/'),

    clone_file=('CloneFileView', 'clone/<path:path>/',),
    rename_file=('RenameFileView', 'rename/<path:path>/',),
    # file_example_png=('ExampleExtFileView', '<path:path>.png/'),
    file_example_images=('ExampleFileImagesView', 'images/<path:path>/'),
    file_example=('ExampleFileView', '<path:path>/'),
    file_example_html=('ExampleExtFileView', '<path:path>.html/'),
)

