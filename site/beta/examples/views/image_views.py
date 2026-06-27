import os
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse
from trim import views
from trim.response import content_type_response

from .. import forms


class ExampleFileImagesView(views.TemplateView):
    template_name = 'default_template.html'

    def get(self, request, *args, **kwargs):
        print('ExampleFileImagesView')
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)

    def render_to_response(self, context, **response_kwargs):
        """
        Return a response, using the `response_class` for this view, with a
        template rendered with the given context.
        Pass response_kwargs to the constructor of the response class.
        """

        path = self.kwargs.get('path')
        root = settings.POLYPOINT_THEATRE_DIR
        real_filepath = settings.POLYPOINT_THEATRE_DIR / 'images' / path

        return content_type_response(real_filepath)

        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            using=self.template_engine,
            **response_kwargs,
        )


class AjaxFormMixin:
    def form_invalid(self, form):
        return JsonResponse({'errors': form.errors})


class ImagePostFormView(AjaxFormMixin, views.FormView):
    """Receive an image for the example.
    An image may be one of a series
    """

    form_class = forms.ImagePostForm
    template_name = 'examples/image_form.html'

    def form_valid(self, form):
        """Put the image in the correct location"""

        image = form.cleaned_data['image_file']

        # This will auto-save to MEDIA_ROOT/uploads/
        filename = default_storage.save(f'uploads/{image.name}', image)
        series = form.cleaned_data['series_index']
        stem = form.cleaned_data['theatre_filename']
        series_name = None

        if len(series) > 0:
            if series.isnumeric() and int(series) == 0:
                # make new index.
                series_name = str(uuid4())
            else:
                # existing series str
                series_name = series

            base = default_storage.base_location
            out_dir = f'uploads/{stem}/{series_name}/'
            out_path = Path(base) / out_dir
            os.makedirs(out_path, exist_ok=True)

            _, _, files = next(os.walk(out_path))
            file_count = len(files)

            filename = f'{file_count}_{image.name}'
            out_filename = f'{out_dir}{filename}'
        else:
            # no series.
            out_filename = f'uploads/{stem}/{image.name}'

        filename = default_storage.save(out_filename, image)

        # if a series_index
        #   if 0, create a new one, return the index
        #   if string, use as index.
        #   save as index file in series foldername
        # else
        #   name of the file is theatre_file/image_{index}
        return JsonResponse({'file': filename, 'series_index': series_name})