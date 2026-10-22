from django.urls import path

from . import views


app_name = "llm_api"

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("v1-micro/", views.IndexView.as_view(), name="v1_micro"),
    path(
        "keys/create/",
        views.TheatreAPIKeyCreateView.as_view(),
        name="create_api_key",
    ),
    path("theatres/", views.TheatreAPIView.as_view(), name="theatres"),
    path(
        "theatres/<str:example_id>/",
        views.TheatreViewerView.as_view(),
        name="theatre_view",
    ),
]
