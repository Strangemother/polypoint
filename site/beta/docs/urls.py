
from django.urls import include, path

from docs import views
from trim import urls

app_name = 'docs'


urlpatterns = urls.paths_named(views,
    home=('IndexView', ""),
    markdown_example=('MarkdownExampleView', 'md/'),
    point_src_dir=('PointSrcDirView', 'dir/<path:path>/'),
    point_src=('PointSrcFileView', 'file/<path:path>/'),
    file_parse=('FileParseView', ('parse/<path:path>/', 'parse/', )),
)