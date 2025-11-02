
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'examples'

urlpatterns = urls.paths_named(views,
    example=('TheatreIndexTemplateView', '',),
    demo_examples=('ExampleIndexTemplateView', 'demos/',),
    theatre_process=('ImmediateProcessTheatreFilesView', ('process/',)),
    point_src=('PointSrcAssetView', ('point_src/<path:path>',)),
    demo_src=('DemoSrcAssetView', ('demos/<path:path>',)),
    theatre_src=('TheatreSrcAssetView', ('theatre/<path:path>',)),
    script_raw=('ScriptsRawImportView', 'script_list_raw/<str:name>/'),
    script_list=('ScriptsImportListView', 'script_list/<str:name>/'),
    image_post_form=('ImagePostFormView', 'upload/image/'),

    clone_file=('CloneFileView', 'clone/<path:path>/',),
    rename_file=('RenameFileView', 'rename/<path:path>/',),
    # file_example_png=('ExampleExtFileView', '<path:path>.png/'),
    file_example_images=('ExampleFileImagesView', 'images/<path:path>/'),

    ## View the file-list only.
    file_example_scrips=('ExampleFileScriptsView', 'scripts/<path:path>/'),
    file_example_all=('ExampleFileScriptsAndTheatreView', 'scripts+theatre/<path:path>/'),

    # Catch-all
    file_example=('ExampleFileView', '<path:path>/'),
    file_example_html=('ExampleExtFileView', '<path:path>.html/'),

)

