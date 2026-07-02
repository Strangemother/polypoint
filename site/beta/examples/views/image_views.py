import os
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from PIL import Image, UnidentifiedImageError
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
    thumbnail_series_name = 'thumbnail'
    # Thumbnails are mostly line-art screenshots; prefer sharp edges.
    webp_lossless = True
    webp_exact = True
    webp_method = 4
    # Used only if webp_lossless is disabled.
    webp_quality = 90

    def is_thumbnail_series(self, series):
        return str(series or '').strip().lower() == self.thumbnail_series_name

    def build_upload_filename(self, image_name, file_count, is_thumbnail):
        clean_name = Path(image_name).name
        if is_thumbnail:
            clean_name = f'{Path(clean_name).stem}.webp'
        return f'{file_count}_{clean_name}'

    def save_thumbnail_webp(self, image, out_filename):
        if hasattr(image, 'seek'):
            image.seek(0)

        with Image.open(image) as source_image:
            mode = 'RGBA' if 'A' in source_image.getbands() else 'RGB'
            converted = source_image.convert(mode)
            data = BytesIO()
            save_kwargs = {
                'format': 'WEBP',
                'method': self.webp_method,
                'exact': self.webp_exact,
            }
            if self.webp_lossless:
                save_kwargs['lossless'] = True
            else:
                save_kwargs['quality'] = self.webp_quality

            converted.save(
                data,
                **save_kwargs,
            )

        content = ContentFile(data.getvalue())
        return default_storage.save(out_filename, content)

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
        tfm.still_image_compatible = True
        tfm.save(update_fields=['still_image_path', 'still_image_compatible'])
        return tfm.id

    def form_valid(self, form):
        """Put the image in the correct location"""

        image = form.cleaned_data['image_file']
        series = form.cleaned_data['series_index']
        stem = form.cleaned_data['theatre_filename']
        series_name = None
        is_thumbnail = self.is_thumbnail_series(series)

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

            filename = self.build_upload_filename(
                image.name,
                file_count,
                is_thumbnail,
            )
            out_filename = f'{out_dir}{filename}'
        else:
            # no series.
            out_filename = f'uploads/{stem}/{image.name}'

        try:
            if is_thumbnail:
                filename = self.save_thumbnail_webp(image, out_filename)
            else:
                filename = default_storage.save(out_filename, image)
        except (UnidentifiedImageError, OSError, ValueError):
            if hasattr(image, 'seek'):
                image.seek(0)
            fallback_filename = out_filename
            if is_thumbnail:
                source_suffix = Path(image.name).suffix or '.png'
                fallback_filename = str(Path(out_filename).with_suffix(source_suffix))
            filename = default_storage.save(fallback_filename, image)

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
