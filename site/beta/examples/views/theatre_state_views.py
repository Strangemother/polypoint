from datetime import datetime, timezone
from pathlib import Path

import requests

from django.conf import settings
from django.http import JsonResponse
from django.urls import reverse
from trim import views

from .. import forms, models
from ..llm_descriptions import extract_message, request_description_response
from ..theatre import get_theatre_list


def stat_mtime_to_datetime(st_mtime: float) -> datetime:
    return datetime.fromtimestamp(st_mtime, tz=timezone.utc)


def onboard_theatre_file(filepath):
    clean_filepath = str(Path(filepath).with_suffix('.js'))

    models.TheatreFile.ensure(clean_filepath, settings.POLYPOINT_THEATRE_DIR)
    tfm = models.TheatreFile.objects.get(filepath=clean_filepath)

    try:
        data = request_description_response(clean_filepath)
        description = extract_message(data)
        if description:
            tfm.description = description
            tfm.save(update_fields=['description'])
    except (FileNotFoundError, requests.RequestException, ValueError):
        pass


def get_pending_theatre_filepaths():
    files = get_theatre_list(suffix=True)
    existing = set(models.TheatreFile.objects.values_list('filepath', flat=True))
    return [name for name, *_ in files if name not in existing]


def has_valid_still_image(theatre_file):
    still_image_path = (theatre_file.still_image_path or '').strip()
    if not still_image_path:
        return False

    image_path = Path(settings.MEDIA_ROOT) / still_image_path
    return image_path.exists()


def get_thumbnail_missing_filepaths():
    theatre_files = get_theatre_list(reverse=False, orderby='name', suffix=True)
    theatre_file_map = {
        item.filepath: item
        for item in models.TheatreFile.objects.only('filepath', 'still_image_path')
    }

    missing = []
    for filepath, *_ in theatre_files:
        tfm = theatre_file_map.get(filepath)
        if tfm and has_valid_still_image(tfm):
            continue
        missing.append(filepath)

    return missing


class PhotographerNextView(views.TemplateView):
    template_name = 'default_template.html'

    def get(self, request, *args, **kwargs):
        missing = get_thumbnail_missing_filepaths()
        if len(missing) < 1:
            return JsonResponse({'done': True, 'next_url': None, 'remaining': 0})

        next_filepath = missing[0]
        next_path = str(Path(next_filepath).with_suffix(''))
        next_url = reverse('examples:file_example', kwargs={'path': next_path})

        return JsonResponse(
            {
                'done': False,
                'next_url': next_url,
                'filepath': next_filepath,
                'remaining': len(missing),
            }
        )


class TheatreFileListView(views.ListView):
    model = models.TheatreFile
    ordering = '-modified'

    def get_context_data(self, **kw):
        # ITerate every _file_. create a set of names
        # iterate all objects, set of names,
        #   check for modified and crc
        # Un-discovered files in the models are _new_ files.
        save_updates = True

        res = super().get_context_data(**kw)
        items = res['object_list']
        files = get_theatre_list(suffix=True)
        file_names = set(x[0] for x in files)
        files_ref = {x[0]: x[1:] for x in files}

        # discovered change to modified time..
        modified_change = []

        for obj in items:
            fn = obj.filepath
            ref = files_ref[fn]
            file_names.remove(fn)
            # check crc and modified.
            norm_modified = stat_mtime_to_datetime(ref[0])
            if obj.modified != norm_modified:
                # updated is not the same as the file modified.
                # File has likely been changed
                modified_change.append(obj)
                # update but don't save.
                obj.modified = norm_modified

                # If its modified. CRC has changed.
                obj.update_crc(root=settings.POLYPOINT_THEATRE_DIR, save=False)

        res['new_files'] = file_names
        res['modified_change'] = modified_change
        res['save_updates'] = save_updates

        if save_updates:
            self.model.objects.bulk_update(modified_change, ['modified', 'crc'])

        print('Changes detected for', len(modified_change), 'models')
        print('Files not in DB:', file_names)

        return res


class OnboardTheatreFileView(views.FormView):
    form_class = forms.ConfirmForm
    http_method_names = ['post']

    def form_valid(self, form):
        onboard_theatre_file(self.kwargs.get('path'))

        return super().form_valid(form)

    def get_success_url(self):
        return views.reverse('examples:example_db')


class OnboardAllTheatreFilesView(views.FormView):
    form_class = forms.ConfirmForm
    http_method_names = ['post']

    def form_valid(self, form):
        for filepath in get_pending_theatre_filepaths():
            onboard_theatre_file(filepath)

        return super().form_valid(form)

    def get_success_url(self):
        return views.reverse('examples:example_db')
