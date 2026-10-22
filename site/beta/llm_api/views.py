from trim import views


class IndexView(views.TemplateView):
    """
    render the script tags, relative to the ./examples/import/ dir,
    used to produce an import file.
    """

    template_name = 'llm_api/index.html'