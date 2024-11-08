from django.conf import settings
from trim import views
from django.http import Http404

from pathlib import Path

class IndexView(views.TemplateView):
    template_name = 'editor/view.html'

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        kw['theatre_list'] = get_theatre_list()

        if 'path' in kwargs:
            kw['path'] = get_theatre_file_contents(kwargs['path'])
        return kw


class PointSrcAssetView(views.TemplateView):
    template_name = 'editor/blank.html'

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        kw['path'] = get_file_contents(kwargs['path'])
        if kw['path']['exists'] is False:
            raise Http404
        return kw

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        response['Content-Type'] = 'text/javascript'
        # response['Content-Length'] = len(content)
        return response



class TheatreSrcAssetView(views.TemplateView):
    template_name = 'editor/blank.html'

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        kw['path'] = get_theatre_file_contents(kwargs['path'])
        if kw['path']['exists'] is False:
            raise Http404
        return kw

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        response['Content-Type'] = 'text/javascript'
        # response['Content-Length'] = len(content)
        return response


def get_theatre_list(**kw):
    # get all files in the theatre dir
    parent = settings.POLYPOINT_THEATRE_DIR
    tpath = Path(parent)
    res = ()
    for asset in tpath.iterdir():
        if asset.is_file():
            res += (str(asset.relative_to(tpath)), )
    return res


class TheatreJsonListView(views.JsonView):
    template_name = 'editor/blank.html'
    prop = 'items'

    def get_data(self, **kw):
        return self.get_theatre_list(**kw)

    def get(self, request, *args, **kwargs):
        d = self.get_context_data(**self.kwargs)
        # serial = self.get_serialiser()
        result = self.get_data(**d)
        # r = serial.serialize([result])
        data = {
            self.prop:result
        } if self.prop is not None else result

        return self.render_to_json_response(data, **kwargs)

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        return kw


def get_theatre_file_contents(path):
    return get_file_contents(path, settings.POLYPOINT_THEATRE_DIR)


def get_file_contents(path, root=None):
    target = (root or settings.POLYPOINT_SRC_DIR) / path
    print('target', target)
    exists = target.exists()
    content = None
    if exists:
        content = target.read_text()
    return {
        'exists': exists,
        'content': content,
        'path': path,
    }