import shutil
from pathlib import Path

from django.conf import settings
from trim import views

from .. import forms, theatre_process


class CloneFileView(views.FormView):
    form_class = forms.CloneFileForm
    template_name = 'examples/clone_form.html'

    def get_initial(self):
        tp = self.get_target_path()

        tp = tp.with_suffix('')
        tp = tp.with_name(f'{tp.name}_clone')

        return {
            'new_name': str(tp)
        }

    def form_valid(self, form):
        target = Path(settings.POLYPOINT_THEATRE_DIR)
        orig = self.get_target_path()
        fp = target / orig
        if fp.exists() is False:
            fp = fp.with_suffix('.js')
            if fp.exists() is False:
                raise Exception(f'file does not exist {fp}')

        new_name = form.cleaned_data['new_name']
        clean_name = Path(new_name).with_suffix('.js')
        # Copy original file,
        new_fp = target / clean_name
        if new_fp.exists():
            raise Exception(f'Target file already exists {new_fp}')

        self.perform_file_action(fp, new_fp)
        self.target_path = clean_name
        # redirect to new.
        return super().form_valid(form)

    def perform_file_action(self, fp, new_fp):
        shutil.copyfile(fp, new_fp)

    def get_target_path(self):
        return Path(self.kwargs.get('path'))

    def get_success_url(self):
        args = (self.target_path,)
        return views.reverse('examples:file_example', args=args)


class RenameFileView(CloneFileView):

    def get_initial(self):
        tp = self.get_target_path()

        tp = tp.with_suffix('')
        tp = tp.with_name('erica-homestead')

        return {
            'new_name': str(tp)
        }

    def perform_file_action(self, fp, new_fp):
        shutil.move(fp, new_fp)


class ImmediateProcessTheatreFilesView(views.FormView):
    form_class = forms.ConfirmForm
    template_name = 'examples/clone_form.html'

    def form_valid(self, form):
        tp = theatre_process.TheatreProcessor()
        tp.parse_theatre(settings.POLYPOINT_THEATRE_DIR)
        return super().form_valid(form)

    def get_success_url(self):
        return views.reverse('examples:example')