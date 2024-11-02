from django.shortcuts import render


from trim import views

class IndexView(views.TemplateView):
    template_name = 'docs/index.html'