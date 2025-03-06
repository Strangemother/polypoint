
from django.urls import include, path

from . import views
from trim import urls

app_name = 'documentation'


urlpatterns = urls.paths_named(views,
    home=('IndexView', ""),
    src_file=('FileView', "file/<path:path>/"),
    src_dir=('DirView', "dir/<path:path>/"),
)