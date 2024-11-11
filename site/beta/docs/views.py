from pathlib import Path
from operator import itemgetter, attrgetter

from django.conf import settings
from django.shortcuts import render

from trim import views

def get_src_list(**kw):
    # get all files in the src dir

    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    parent = settings.POLYPOINT_SRC_DIR

    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        nn = asset.relative_to(tpath).with_suffix('')
        if asset.is_file():
            modified = asset.stat().st_mtime
            res += ({
                    'name': str(nn),
                    'is_dir': False,
                    'is_file': True,
                    'modified': modified,
                },)
        else:
            # modified = asset.stat().st_mtime
            res += ({
                    'name': str(nn),
                    'is_dir': True,
                    'is_file': False,
                    'modified': -1,
                },)

    res = sorted(res, key=lambda x: x['name'])
    # res = reversed(sorted(res, key=itemgetter(1)))
    return tuple(res)


class IndexView(views.ListView):
    template_name = 'docs/index.html'
    # template_name = 'examples/index.html'
    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        return get_src_list()


class ExampleView(views.TemplateView):
    template_name = 'docs/example-index.html'


from examples import theatre

from django.template.base import Template
from django.template.response import TemplateResponse


class MarkdownTemplateResponse(TemplateResponse):

    @property
    def rendered_content(self):
        """Return the freshly rendered content for the template and context
        described by the TemplateResponse.

        This *does not* set the final content of the response. To set the
        response content, you must either call render(), or set the
        content explicitly using the value of this property.
        """

        # django.template.backends.django.Template
        template = self.resolve_template(self.template_name)
        context = self.resolve_context(self.context_data)
        source_text = self.update_template(template, context)
        old_inner = template.template
        # Edit the markdown HTML to a processed version
        mdo = context.get('markdown', None)

        if mdo:
            html = mdo.get('html', '')
            if len(html) > 0:
                # process the HTML, append it to the context.
                inner = Template(
                        html,
                        old_inner.origin, old_inner.name, old_inner.engine)
                template.template = inner
                md_html_result = template.render(context, self._request)
                context['markdown']['rendered'] = md_html_result
        inner = Template(source_text, old_inner.origin, old_inner.name, old_inner.engine)
        template.template = inner
        res = template.render(context, self._request)
        return res

    def update_template(self,template, context):
        """Given the standard django template, alter the 'source' of the template
        (the outbound HTML) and early replace all markdown components before
        the django rendering.

        Ensuring this occurs before the main rendering allows the use of
        django templates within markdown.
        """
        # django.template.backends.django.Template
        old_inner = template.template
        # django.template.base.Template
        source_text = old_inner.source#.replace(self.tag, content or "")
        return self.replace_template_text(source_text, context)

    def replace_template_text(self, text, context):
        return text


class PointSrcFileView(views.TemplateView):
    """Show a source presentation - reading the file meta and presenting an import.

    """
    template_name = 'docs/src-file.html'
    response_class = MarkdownTemplateResponse

    def get_context_data(self, **kwargs):
        """Append file information to the context

            metadata
            markdown
        """
        # kwargs.setdefault("view", self)
        # if self.extra_context is not None:
        #     kwargs.update(self.extra_context)
        # return kwargs
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
        parent = settings.POLYPOINT_SRC_DIR
        meta = theatre.get_metadata(path, parent)
        r['file_exists'] = meta['filepath_exists']

        r['metadata'] = meta
        md = meta.get('markdown', None)
        if md:
            r['markdown'] = md
            pre_processed_html = r['markdown']['html']
            self.reprocess_template_text(pre_processed_html)
            del meta['markdown']
        return r

    def reprocess_template_text(self, pre_processed_html):
        """Given the HTML from the markdown content, reprocess through
        the templating library, returning HTML with rendered django templates.
        """
        print('reprocess_template_text')
        return pre_processed_html
