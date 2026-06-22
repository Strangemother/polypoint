from pathlib import Path
from operator import itemgetter, attrgetter

from django.template.base import Template
from django.template.loader import render_to_string
from django.template.response import TemplateResponse
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.urls import reverse

from django.conf import settings
from django.db.models import Q
from urllib.parse import urlencode

from trim import views
from trim.markdown import (
    MarkdownToMarkdownTemplateResponse,
    MarkdownDoubleTemplateResponse,
    MarkdownTemplateResponse,
    MarkdownReponseMixin,
)
from examples import theatre
import markdown


import json

from docs.models import SourceReference
from docs.forms import SearchSymbolForm
from docs.search_text import field_boost_score, normalize_search_text, rank_symbol_match
from docs.sqlite_search import sqlite_fts_ranked_ids


class SearchFormView(views.FormView):
    template_name = "docs/search-form.html"
    form_class = SearchSymbolForm

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        r["object_path"] = Path("search")
        r["page_title"] = "Search API"
        r["title"] = "Search API"
        return r

    def form_valid(self, form):
        q = form.cleaned_data["q"]
        url = reverse("docs:search_results")
        query = urlencode({"q": q})
        return HttpResponseRedirect(f"{url}?{query}")


class SearchResultsListView(views.ListView):
    template_name = "docs/search-results.html"
    context_object_name = "results"
    result_limit = 250
    fuzzy_scan_limit = 5000
    fuzzy_distance_floor = 2
    fts_limit = 1500

    def _rank_key(self, q, item):
        exact, distance = rank_symbol_match(q, item.name, item.qualified_name)
        boost = field_boost_score(
            query=q,
            name=item.name,
            qualified_name=item.qualified_name,
            owner_name=item.owner_name,
            symbol_type=item.symbol_type,
            search_text=item.search_text,
        )
        fts_rank = self._fts_rank_map.get(item.id, 1e12)
        return (
            exact,
            -boost,
            fts_rank,
            distance,
            -(item.rank_weight or 1),
            -(item.ranking or 0),
            item.qualified_name,
            item.line_start,
        )

    def get_queryset(self):
        q = (self.request.GET.get("q") or "").strip()
        if not q:
            return SourceReference.objects.none()

        self._fts_rank_map = {}

        direct = list(
            SourceReference.objects.filter(
                Q(search_text__icontains=q)
                | Q(name__icontains=q)
                | Q(qualified_name__icontains=q)
            )
            .order_by("qualified_name", "line_start")[: self.result_limit]
        )

        direct_ids = {item.id for item in direct if item.id is not None}
        remaining = self.result_limit - len(direct)

        fts = []
        if remaining > 0:
            fts_ids, self._fts_rank_map = sqlite_fts_ranked_ids(q, limit=self.fts_limit)
            if fts_ids:
                fts_by_id = {
                    item.id: item
                    for item in SourceReference.objects.filter(id__in=fts_ids)
                }
                for row_id in fts_ids:
                    item = fts_by_id.get(row_id)
                    if item is None or item.id in direct_ids:
                        continue
                    fts.append(item)

        taken_ids = set(direct_ids)
        taken_ids.update(item.id for item in fts if item.id is not None)
        remaining = self.result_limit - len(direct) - len(fts)

        fuzzy = []
        if remaining > 0:
            normalized_q = normalize_search_text(q)
            max_distance = max(self.fuzzy_distance_floor, len(normalized_q) // 3)

            scanned = 0
            pool = SourceReference.objects.exclude(id__in=taken_ids).order_by("name")
            for item in pool.iterator(chunk_size=1000):
                scanned += 1
                if scanned > self.fuzzy_scan_limit:
                    break

                _, distance = rank_symbol_match(q, item.name, item.qualified_name)
                if distance <= max_distance:
                    fuzzy.append(item)

            fuzzy.sort(key=lambda item: self._rank_key(q, item))
            fuzzy = fuzzy[:remaining]

        matches = direct + fts + fuzzy
        matches.sort(key=lambda item: self._rank_key(q, item))
        return matches[: self.result_limit]

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        q = (self.request.GET.get("q") or "").strip()
        r["q"] = q
        r["form"] = SearchSymbolForm(initial={"q": q})
        r["object_path"] = Path("search/results")
        r["page_title"] = "Search Results"
        r["title"] = "Search Results"
        return r


class SuperSheetListView(views.ListView):
    template_name = "docs/supersheet.html"
    context_object_name = "results"

    def get_queryset(self):
        return SourceReference.objects.order_by(
                    "qualified_name", "symbol_type", "line_start"
                )

    def get(self, request, *args, **kwargs):
        self.object_list = self.get_queryset()
        context = self.get_context_data(object_list=self.object_list)

        if request.GET.get("download"):
            content = render_to_string("docs/supersheet.txt", context, request=request)
            response = HttpResponse(content, content_type="text/plain; charset=utf-8")
            response["Content-Disposition"] = 'attachment; filename="polypoint-supersheet.txt"'
            return response

        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        base_qs = self.object_list if hasattr(self, "object_list") else self.get_queryset()
        no_owner = Q(owner_name__isnull=True) | Q(owner_name="")
        top_level_filter = no_owner & ~Q(symbol_type__iexact="class")
        r["top_level_results"] = base_qs.filter(top_level_filter)
        r["owned_results"] = base_qs.exclude(top_level_filter)
        r["object_path"] = Path("supersheet")
        return r

def get_src_list(sub_path=None, **kw):
    # get all files in the src dir

    # parent = settings.POLYPOINT_THEATRE_DIR
    # parent = settings.POLYPOINT_EXAMPLES_DIR
    parent = settings.POLYPOINT_SRC_DIR

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
    template_name = 'docs/index.html'

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        return get_src_list()

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path', '')
        p = Path(path) # .with_suffix('.js')
        r['object_path'] = p
        return r


class ExamplePageView(views.TemplateView):
    template_name = 'docs/another-example-index.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        return r


class ExampleDocPageView(ExamplePageView):
    template_name = 'docs/another-example-doc.html'


class ExampleDoc2PageView(ExamplePageView):
    template_name = 'docs/another-example-doc-2.html'


class ExampleDoc3PageView(ExamplePageView):
    template_name = 'docs/another-example-doc-3.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = 'point.js'
        parent = settings.POLYPOINT_SRC_DIR
        meta = theatre.get_metadata(path, parent)
        r['metadata'] = meta
        return r


class FileParseView(views.TemplateView):
    """Show a source presentation - reading the file meta and presenting an import."""
    template_name = 'docs/file-parser.html'

    def get_context_data(self, **kwargs):
        """Append file information to the context

            metadata
            markdown
        """
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('.js')
        r['object_path'] = p
        return r


class MarkdownExamplePureView(views.TemplateView):
    """Given a markdown file as the template_name, render as the response.

    This is a direct replacement for standard HTML templates, allowing the
    django inheritence methods to function, such as blocks and extends.
    """
    response_class = MarkdownTemplateResponse
    template_name = 'docs/markdown-example.md'


class MarkdownExampleView(views.TemplateView):
    """Given a markdown template_name, read the metadata within the file
    and gather the "wrapper" template_name; the template to contain the
    finished markdown.

    This is defined as _double rendering_, as we render the markdown, and the
    standard template (collected from the markdown metadata), and present the
    standard template response.
    """
    response_class = MarkdownDoubleTemplateResponse
    template_name = 'docs/markdown-example.md'
    # template_name = 'docs/markdown-base.html'


class MarkdownToMarkdownExampleView(views.ListView):
    response_class = MarkdownToMarkdownTemplateResponse
    template_name = 'docs/md/src-list-example.md'

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        return get_src_list()


class SubMarkdownTemplateResponse(TemplateResponse):
    """Given a template with a 'markdown' text to render within the context,
    collect the markdown and update the context with an addition var,
    of HTML
    """

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
            """
            If the markdown exists, render it uniquely, and apply the finished
            html to the original template as an context var.
            """
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


class PointSrcDirView(views.ListView):
    """Show a directory of assets, similar to a list view, but with the
    option of a _Readme_ and other associations.

        http://localhost:8000/docs/dir/capture/

    """
    template_name = 'docs/src-dir.html'
    # response_class = SubMarkdownTemplateResponse

    def get_queryset(self):
        """
        Return the list of items for this view.
        """
        path = self.kwargs.get('path')
        return get_src_list(path)

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path) # .with_suffix('.js')
        r['object_path'] = p

        return self.add_readme_info(r, p, **kwargs)

    def add_readme_info(self, r, p, **kwargs):
        """coupled with the response_class, render the file disovered markdown
        """
        root = settings.POLYPOINT_SRC_DIR
        readme_path = root / p / 'readme.md'

        r['readme'] = { "exists": False, "path": readme_path.relative_to(root) }

        if not readme_path.exists():
            return r

    # def populate_readme(self, r, readme_path):
        readme_md_text = readme_path.read_text()
        r['readme'].update({
            "exists": True,
            "text": readme_md_text,
        })

        parent = settings.POLYPOINT_SRC_DIR
        rel_path = readme_path.relative_to(parent)
        meta = theatre.render_markdown(rel_path, parent)
        # meta = theatre.get_metadata(rel_path, parent, ensure_suffix=None)

        r['file_exists'] = meta['filepath_exists']

        # Generate an internal renderer.
        response_kwargs = kwargs
        response_kwargs.setdefault("content_type", self.content_type)
        md_response = SubMarkdownTemplateResponse(
            request=self.request,
            template=self.get_template_names(),
            context=r,
            using=self.template_engine,
            **response_kwargs,
        )

        r['readme']['meta'] = meta

        md = meta.get('markdown', None)
        if md:
            r['markdown'] = md
            r['readme']['rendered'] = r['markdown']['html']
        else:
            print('no markdown object.')
        return r


class TheatreFileMarkdownTemplateResponse(TemplateResponse):

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
            """
            If the markdown exists, render it uniquely, and apply the finished
            html to the original template as an context var.
            """
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
    response_class = TheatreFileMarkdownTemplateResponse

    def get_context_data(self, **kwargs):
        """Append file information to the context

            metadata
            markdown
        """
        r = super().get_context_data(**kwargs)
        path = self.kwargs.get('path')
        p = Path(path).with_suffix('.js')
        r['object_path'] = p
        r = self.markdown_and_meta(r, path)
        return self.apply_method_docs_2(r, path)

    def apply_method_docs_2(self, r, path):

        rp = Path(path)
        docs_parent = settings.POLYPOINT_DOCS_DIR

        # target filename
        name = rp.with_suffix('.js').name.replace('.', '-')
        # nrp = rp.with_name(f'{name}/program.json')
        trees_parent = docs_parent / f"trees/clean/stash" / name / 'program.json'

        print('\n\ntrees_parent.exists(): ',trees_parent.exists(), trees_parent, '\n\n')
        if trees_parent.exists() is False:
            return r

        prog = self.get_json(trees_parent)
        d = prog['defs']
        r['defs'] = d
        return r

    def apply_method_docs(self, r, path):
        """
        old version

        Apply the additional information for all methods for this unit,
        from the docs. (data-cuts)
        """
        rp = Path(path)
        docs_parent = settings.POLYPOINT_DOCS_DIR

        # target filename
        name = rp.with_suffix('.js').name.replace('.', '-')
        nrp = rp.with_name(f'{name}-references.json')
        trees_parent = docs_parent / f"trees/clean" / nrp

        print('\n\ntrees_parent.exists(): ',trees_parent.exists(), trees_parent, '\n\n')

        if trees_parent.exists() is False:
            return r

        # Open the file, read all methods. As this is the src file ('point.js')
        # we access all referenes.
        refs = self.get_json(trees_parent)
        ref_path = trees_parent.parent
        result = {}
        for name in refs['defined']:
            class_info = refs['items'][name] # E.g. Point
            # now iter each sub defined entity e.g. 0-Positionable
            for local_key in class_info['local_references']:
                class_ref = class_info[local_key]
                class_info_file = ref_path / class_ref['info_file']
                class_def = self.get_json(class_info_file)
                result[name] = class_def

        # store to the given object
        r['references'] = result
        return r

    def get_json(self, path):
        return json.loads(path.read_text())

    def markdown_and_meta(self, r, path):
        """coupled with the response_class, render the file disovered markdown
        """
        parent = settings.POLYPOINT_SRC_DIR

        # Meta keys of a src file include similar properties as the
        # theatre file.
        meta_keys = (
                ('title',),
                ('dependencies',),
            )

        meta = theatre.get_metadata(path, parent, meta_keys=meta_keys)
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
        return pre_processed_html


# class PointSrcClassView(PointSrcFileView):
