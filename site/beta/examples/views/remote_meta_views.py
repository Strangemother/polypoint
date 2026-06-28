from pathlib import Path
from django.template import loader

from .. import forms, models
from trim import views

from django.http import HttpResponse

from django.conf import settings

from ..theatre import get_metadata


class ExampleFileMetaFormView(views.FormView):
    """Receive an image for the example.
    An image may be one of a series
    """

    form_class = forms.MetaForm
    template_name = 'examples/image_form.html'

    def form_valid(self, form):
        """
        + resolve the form filename and content
        + create prompt from processed endpoint
        + post the prompt to the local llm
        + parse response into the object.
        + return json response of results.
        """

        d = form.cleaned_data
        name = d['theatre_filename']
        tid = d['theatrefile_id']
        notes = d['notes']

        if len(tid) > 0:
            tfm = models.TheatreFile.objects.get(id=tid)
        else:
            tfm = models.TheatreFile.objects.get(filepath__startswith=name)

        path = tfm.filepath
        # resolve theatre file.

        p = Path(path).with_suffix('')
        parent = settings.POLYPOINT_THEATRE_DIR

        theatre_file = (parent / path)

        theatre_file = theatre_file.with_suffix('.js')

        if not theatre_file.exists():
            print('File does not exist:', theatre_file)
            print('Given path:', path)

        # we have the file and the notes. Render
        # Here we could actually use the endpoint here to render_to_Response
        # using the parsed HTML result to send as a prompt.

        c = {
            'source_code': theatre_file.read_text(),
            'notes': notes
        }

        t = loader.get_template("examples/dynamic-prompt.html")
        prompt_text = t.render(c, self.request)

        t = loader.get_template("examples/system-prompt.html")
        system_prompt = t.render(c, self.request)

        lm_payload = self.build_payload(system_prompt, prompt_text)
        # send response.

        return HttpResponse(prompt_text)#, content_type="application/xhtml+xml")
        # return super().form_valid(form)

    def build_payload(self, system_prompt, prompt_text):
        model_name = 'gemma-4-12b-it'


        return {
            'model': model_name,
            'temperature': .8,
            'system_prompt': system_prompt,
            'input': [
                {
                    'type': 'text',
                    'role': 'user',
                    'content': prompt_text
                },
            ]
        }

        # for file_obj in self.files:
        #     input_items.extend(self.build_file_input(file_obj, params=params))

        # return input_items


    def form_invalid(self, form):
        return JsonResponse({'errors': form.errors})