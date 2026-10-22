
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'editor'

urlpatterns = urls.paths_named(views,
    # about=('AboutView', 'sheet/<str:pk>/',),
    # contact=('ContactView', 'contact/',),
    index=('IndexView', ('v1-micro/', '',),),
)