from datetime import datetime, timezone

from django.conf import settings
from trim import views

from .. import models
from ..theatre import get_theatre_list


def stat_mtime_to_datetime(st_mtime: float) -> datetime:
    return datetime.fromtimestamp(st_mtime, tz=timezone.utc)


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