from django.shortcuts import render

from examples.views import ExampleFileView
from editor.views import PointSrcAssetView, TheatreSrcAssetView


class BackshotExampleFileView(ExampleFileView):
    template_name = 'screenshot/backshot.html'
