from django.db import models
from trim.models import fields

from pathlib import Path
import zlib

# Source - https://stackoverflow.com/a/2387880
# Posted by kobor42, modified by community. See post 'Timeline' for change history
# Retrieved 2026-06-18, License - CC BY-SA 3.0

def crc(fileName):
    prev = 0
    for eachLine in open(fileName,"rb"):
        prev = zlib.crc32(eachLine, prev)
    return "%X"%(prev & 0xFFFFFFFF)


class TheatreFile(models.Model):
    # represent a file.
    description = fields.text()
    name = fields.chars()
    filepath = fields.chars()

    # when renaming a file, the crc doesn't change. This can
    # detect a rename.
    crc = fields.chars()
    # When the file was modified.
    modified = fields.dt(nil=True)

    # created/updated of this fb model.
    created, updated = fields.dt_cu_pair()

    def update_crc(self, root=None, save=True):
        # Update the internal crc.
        fp = Path(self.filepath)
        if root:
            fp = Path(root) / self.filepath
        self.crc = crc(fp)
        if save:
            self.save()
        return self.crc

    @classmethod
    def ensure(cls, filepath, root=None):
        clean_fp = str(filepath)
        ex = cls.objects.filter(filepath=clean_fp).exists()
        if ex:
            print('Exists')
            return True
        # Create.
        fp = filepath
        if root:
            fp = Path(root) / filepath

        m = cls(
                filepath=clean_fp,
                name=Path(filepath).stem,
                crc=crc(fp),
            )
        print('Creating.', clean_fp)
        m.save()
        return True