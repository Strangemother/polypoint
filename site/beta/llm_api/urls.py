from django.urls import path

from . import views
from .mcp import TheatreMCPView


app_name = "llm_api"

urlpatterns = [
    path("mcp/", TheatreMCPView.as_view(), name="mcp"),
    path("", views.IndexView.as_view(), name="index"),

    path(
        "keys/create/",
        views.TheatreAPIKeyCreateView.as_view(),
        name="create_api_key",
    ),
    path("theatres/", views.TheatreAPIView.as_view(), name="theatres"),

    # http://localhost:8000/llm_api/theatres/th_789cd467ba2140d0adf590a456ce9aa2/
    path(
        "theatres/<str:example_id>/source/",
        views.TheatreViewerSourceView.as_view(),
        name="theatre_source_view",
    ),
    path(
        "theatres/<str:example_id>/",
        views.TheatreViewerView.as_view(),
        name="theatre_view",
    ),
    path(
        "u/<str:username>/latest_change/",
        views.UserTheatreViewerLatestChangeView.as_view(),
        name="user_theatre_latest_change",
    ),
    path(
        "u/<str:username>/",
        views.UserTheatreViewerView.as_view(),
        name="user_theatre_view",
    )
]
