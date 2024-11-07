
from django.urls import include, path

from docs import views

urlpatterns = [
    path("", views.IndexView.as_view()),
]
