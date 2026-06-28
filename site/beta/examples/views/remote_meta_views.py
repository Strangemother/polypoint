import requests
from django.template import loader

from .. import forms, models
from trim import views

from django.http import JsonResponse

from django.conf import settings


class FileDescriptionFormView(views.FormView):
    """USer posts desc.
    """
    form_class = forms.FileDescriptionForm

    def form_valid(self, form):
        """Record the desc to the tfm
        """
        d = form.cleaned_data
        tid = self.kwargs.get('pk')
        tfm = models.TheatreFile.objects.get(id=tid)
        tfm.description = d['description']
        tfm.save()

        return JsonResponse({ 'status': 'ok', 'message': 'Description updated.'})
        # return super().form_valid(form)


class ExampleFileMetaFormView(views.FormView):
    """Receive an image for the example.
    An image may be one of a series
    """

    form_class = forms.MetaForm
    template_name = 'examples/image_form.html'
    lmstudio_endpoint = 'http://192.168.50.60:1234/v1/chat/completions'

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

        t = loader.get_template("examples/prompts/dynamic-prompt.md")
        prompt_text = t.render(c, self.request)

        t = loader.get_template("examples/prompts/system-prompt.md")
        system_prompt = t.render(c, self.request)

        lm_payload = self.build_payload(system_prompt, prompt_text)

        try:
            response = requests.post(
                self.lmstudio_endpoint,
                json=lm_payload,
                timeout=60,
            )
            response.raise_for_status()
            return JsonResponse(response.json())
        except requests.RequestException as exc:
            return JsonResponse({'error': str(exc)}, status=502)
        except ValueError:
            return JsonResponse(
                {'error': 'Invalid JSON response from LM Studio.'},
                status=502,
            )

    def build_payload(self, system_prompt, prompt_text):
        """ example:

        curl http://192.168.50.60:1234/v1/chat/completions \
            -H "Content-Type: application/json" \
            -d '{
                "model": "{{model}}",
                "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful jokester."
                },
                {
                    "role": "user",
                    "content": "Tell me a joke."
                }
                ],
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "joke_response",
                        "strict": "true",
                        "schema": {
                        "type": "object",
                        "properties": {
                            "joke": {
                            "type": "string"
                            }
                        },
                        "required": ["joke"]
                    }
                }
                },
                "temperature": 0.7,
                "max_tokens": 50,
                "stream": false
            }'
        """

        model_name = 'gemma-4-12b-it'


        return {
            'model': model_name,
            'messages': [
                {
                    'role': 'system',
                    'content': system_prompt,
                },
                {
                    'role': 'user',
                    'content': prompt_text,
                },
            ],
            'temperature': 0.8,
            'stream': False,
        }

        # for file_obj in self.files:
        #     input_items.extend(self.build_file_input(file_obj, params=params))

        # return input_items


    def form_invalid(self, form):
        return JsonResponse({'errors': form.errors})