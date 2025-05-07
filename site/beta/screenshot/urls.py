
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'screenshot'

urlpatterns = urls.paths_named(views,
    theatre_src=('TheatreSrcAssetView', ('theatre/<path:path>',)),
    point_src=('PointSrcAssetView', ('point_src/<path:path>',)),
    backshot_file_example=('BackshotExampleFileView', '<path:path>'),
)

