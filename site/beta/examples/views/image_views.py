import os
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse
from trim import views
from trim.response import content_type_response

from .. import forms, models


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
        return JsonResponse({'errors': form.errors}, status=400)


class ImagePostFormView(AjaxFormMixin, views.FormView):
    """Receive an image for the example.
    An image may be one of a series
    """

    form_class = forms.ImagePostForm
    template_name = 'examples/image_form.html'

    def apply_still_image_path(self, theatre_filename, media_subpath):
        clean_filepath = str(Path(theatre_filename).with_suffix('.js'))
        tfm = models.TheatreFile.objects.filter(filepath=clean_filepath).first()
        if not tfm:
            tfm = models.TheatreFile.objects.filter(
                filepath__startswith=theatre_filename,
            ).first()

        if not tfm:
            try:
                models.TheatreFile.ensure(clean_filepath, settings.POLYPOINT_THEATRE_DIR)
            except (FileNotFoundError, OSError):
                return None
            tfm = models.TheatreFile.objects.filter(filepath=clean_filepath).first()

        if not tfm:
            return None

        tfm.still_image_path = media_subpath
        tfm.save(update_fields=['still_image_path'])
        return tfm.id

    def form_valid(self, form):
        """Put the image in the correct location"""

        image = form.cleaned_data['image_file']
        series = form.cleaned_data['series_index']
        stem = form.cleaned_data['theatre_filename']
        series_name = None

        if series:
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
        media_subpath = Path(filename).as_posix()
        theatre_file_id = self.apply_still_image_path(stem, media_subpath)

        # if a series_index
        #   if 0, create a new one, return the index
        #   if string, use as index.
        #   save as index file in series foldername
        # else
        #   name of the file is theatre_file/image_{index}
        return JsonResponse(
            {
                'file': media_subpath,
                'series_index': series_name,
                'still_image_path': media_subpath,
                'theatrefile_id': theatre_file_id,
            }
        )
