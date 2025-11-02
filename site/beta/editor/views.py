import json
from pathlib import Path
from django.http import Http404
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from trim import views

from examples import theatre
from . import forms


@method_decorator(xframe_options_exempt, name='dispatch')
class IndexView(views.TemplateView):
    template_name = 'editor/view.html'

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        kw['theatre_list'] = get_theatre_list()

        if 'path' in kwargs:
            kw['path'] = get_theatre_file_contents(kwargs['path'])
            if kw['path']['exists'] is True:
                # load theatre meta
                # rel kwargs['path']
                kw['metadata'] = theatre.read_resolve(
                        kwargs['path'],
                        settings.POLYPOINT_THEATRE_DIR,
                    )
        return kw


@method_decorator(xframe_options_exempt, name='dispatch')
class MicroView(IndexView):
    template_name = 'editor/micro-editor.html'


@method_decorator(xframe_options_exempt, name='dispatch')
class MicroRunOnlyView(IndexView):
    template_name = 'editor/micro-runonly.html'

    def get_context_data(self, **kwargs):
        # kwargs.setdefault("view", self)
        # if self.extra_context is not None:
        #     kwargs.update(self.extra_context)
        # return kwargs
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('')
        r['part_name'] = p
        # meta = get_metadata(path)

        # r['metadata'] = meta
        # md = meta.get('markdown', None)
        # if md:
            # r['markdown'] = md
            # del meta['markdown']
        return r


class PointSrcAssetView(views.TemplateView):
    template_name = 'editor/blank.html'

    """
    Change this to resolve files in an alternative directory

        POLYPOINT_DEMO_DIR: 'demos/'
        POLYPOINT_SRC_DIR: 'point_src/'

    """
    # src_dir = settings.POLYPOINT_DEMO_DIR
    src_dir = settings.POLYPOINT_SRC_DIR

    def get_context_data(self,**kwargs):
        kw = super().get_context_data(**kwargs)
        # kw['path'] = self.inject_requirements(get_file_contents(kwargs['path']))
        kw['path'] = get_file_contents(kwargs['path'], root=self.src_dir)
        if kw['path']['exists'] is False:
            raise Http404

        return kw

    def inject_requirements(self, obj):
        extra = 'window \n\n'

        data = theatre.get_metadata(obj['path'], parent=self.src_dir)
        files = data.get('files', ())

        file_contents = ()
        for rp in files:
            fp = src_dir / rp
            if fp.exists() is False:
                print('File does not exist', fp)
                continue
            file_contents += (fp.read_text(), )
            print(fp)

        extra = '\n\n'.join(file_contents)
        obj['content'] = extra + obj['content']
        return obj

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        response['Content-Type'] = 'text/javascript'
        # response['Content-Length'] = len(content)
        return response


class DemoSrcAssetView(PointSrcAssetView):
    src_dir = settings.POLYPOINT_DEMO_DIR



class TreeStorePostView(views.FormView):
    """Receive a POST of JSON content from a parser, for a file within
    the point src.
    When enabled, this file is stored for later use within the documentation.
    """
    template_name = "editor/tree_form.html"
    form_class = forms.TreeForm
    success_url = views.reverse_lazy('editor:tree_success')

    def form_valid(self, form):
        data = form.cleaned_data
        json_content = data['content']
        filename = data['filename']
        # json_content['info'] = {
        #     "filename": filename
        # }
        # print('Result', filename, json_content.keys())
        # json_content = json.loads(json_content)
        self.tree_result = theatre.store_tree(filename, json_content)
        self.form_filename = filename
        print('RESULT', self.tree_result)
        return super().form_valid(form)

    def get_success_url(self):
        ok = self.tree_result['exists']
        filename = self.form_filename
        return views.reverse('docs:point_src', args=(self.form_filename,))


class TreeStorePostSuccessView(views.TemplateView):
    template_name = "editor/tree_post_succes.html"


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
    src_dir = settings.POLYPOINT_SRC_DIR
    target = (root or src_dir) / path
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

