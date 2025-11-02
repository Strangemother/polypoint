
from django.urls import include, path

from docs import views
from trim import urls

app_name = 'docs'


urlpatterns = urls.paths_named(views,
    home=('IndexView', ""),
    markdown_example=('MarkdownExampleView', 'md/'),
    pure_markdown_example=('MarkdownExamplePureView', 'pmd/'),
    page_example=('ExamplePageView', 'example/1/'),
    another_page_example=('ExampleDocPageView', 'example/2/'),
    another_page_example_2=('ExampleDoc2PageView', 'example/3/'),
    another_page_example_3=('ExampleDoc3PageView', 'example/4/'),

    md2md=('MarkdownToMarkdownExampleView', 'md2md/'),
    point_src_dir=('PointSrcDirView', 'dir/<path:path>/'),
    point_src=('PointSrcFileView', 'file/<path:path>/'),
    # point_class=('PointSrcClassView', 'class/<path:path>/'),

    file_parse=('FileParseView', ('parse/<path:path>/', 'parse/', )),
)
