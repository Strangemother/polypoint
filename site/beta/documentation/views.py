from trim import views
from django.conf import settings
from pathlib import Path



def get_docs_list(sub_path=None, **kw):
    # get all files in the src dir

    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    # parent = settings.POLYPOINT_SRC_DIR
    parent = settings.POLYPOINT_DOCS_DIR

    parent_path = Path(parent)
    tpath = Path(parent_path)

    if sub_path is not None:
        tpath /= sub_path

    res = ()
    for asset in tpath.iterdir():
        rel_path = asset.relative_to(parent_path)
        nn = rel_path.with_suffix('')
        if asset.is_file():
            modified = asset.stat().st_mtime
            res += ({
                    # The plain name of the file, without the extension
                    'name': str(nn.as_posix()),
                    # rel_name is used within the iterface, as the slug
                    # and guessing pattern for associations.
                    'rel_name': str(rel_path.with_suffix('').as_posix()),
                    # The rel_path is the filepath of this file, relative within
                    # the polypoint src dir.
                    'rel_path': str(rel_path.as_posix()),
                    'is_dir': False,
                    'is_file': True,
                    'modified': modified,
                },)
        else:
            # modified = asset.stat().st_mtime
            res += ({
                    'name': str(nn.as_posix()),
                    'rel_name': str(rel_path.as_posix()),
                    'rel_path': str(rel_path.as_posix()),
                    'is_dir': True,
                    'is_file': False,
                    'modified': -1,
                },)

    res = sorted(res, key=lambda x: x['name'])
    # res = reversed(sorted(res, key=itemgetter(1)))
    return tuple(res)



class IndexView(views.ListView):
    """Primary index page for the docs/ URL.
    Present a list of all available files.
    """
    template_name = 'documentation/index.html'

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        return get_docs_list()

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path', '')
        p = Path(path) # .with_suffix('.js')
        r['object_path'] = p
        return r


class FileView(views.TemplateView):
    """Primary index page for the docs/ URL.
    Present a list of all available files.
    """
    template_name = 'documentation/file.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path', '')
        # r['object_path'] = Path(path)
        p = Path(path)
        if p.exists() is False:
            p = p.with_suffix('.md')
        r['filepath'] = p
        r['exists'] = p.exists()

        return r


class DirView(views.TemplateView):
    """Primary index page for the docs/ URL.
    Present a list of all available files.
    """
    template_name = 'documentation/dir.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path', '')
        p = Path(path)
        if p.exists() is False:
            p = p.with_suffix('.md')
        r['object_path'] = p

        return r
