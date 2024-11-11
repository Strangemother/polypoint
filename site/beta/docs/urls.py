
from django.urls import include, path

from docs import views
from trim import urls

app_name = 'docs'

urlpatterns = [
    path("", views.IndexView.as_view()),
]

urlpatterns += urls.paths_named(views,
    point_src=('PointSrcFileView', ('<path:path>',)),
)