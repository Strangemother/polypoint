
from django.urls import include, path

from docs import views
from trim import urls

from . import views

app_name = 'editor'

urlpatterns = urls.paths_named(views,
    # about=('AboutView', 'sheet/<str:pk>/',),
    # contact=('ContactView', 'contact/',),
    micro=('MicroView', ('v1-micro/', 'v1-micro/<path:path>',),),
    tree=('TreeStorePostView', 'tree/',),
    tree_success=('TreeStorePostSuccessView', 'tree-success/',),
    home=('IndexView', ('v1/', 'v1/<path:path>',),),
    point_src=('PointSrcAssetView', ('point_src/<path:path>',)),
    theatre_list=('TheatreJsonListView', ('theatre-list/',))
)