import requests

from .. import forms, models
from ..llm_descriptions import (
    LMSTUDIO_ENDPOINT,
    request_description_response,
)
from trim import views

from django.http import JsonResponse


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

        return JsonResponse({'status': 'ok', 'message': 'Description updated.'})
        # return super().form_valid(form)


class ExampleFileMetaFormView(views.FormView):
    """Receive an image for the example.
    An image may be one of a series
    """

    form_class = forms.MetaForm
    template_name = 'examples/image_form.html'
    lmstudio_endpoint = LMSTUDIO_ENDPOINT

    def form_valid(self, form):
        """
        + resolve the form filename and content
        + create prompt from processed endpoint
        + post the prompt to the local llm
        + parse response into the object.
        + return json response of results.
        """

        d = form.cleaned_data
        tid = d['theatrefile_id']
        notes = d['notes']

        if tid:
            tfm = models.TheatreFile.objects.get(id=tid)
        else:
            name = d['theatre_filename']
            tfm = models.TheatreFile.objects.get(filepath__startswith=name)

        try:
            data = request_description_response(
                tfm.filepath,
                notes=notes,
                request=self.request,
                endpoint=self.lmstudio_endpoint,
            )
            return JsonResponse(data)
        except FileNotFoundError as exc:
            return JsonResponse({'error': str(exc)}, status=404)
        except requests.RequestException as exc:
            return JsonResponse({'error': str(exc)}, status=502)
        except ValueError:
            return JsonResponse(
                {'error': 'Invalid JSON response from LM Studio.'},
                status=502,
            )

    def form_invalid(self, form):
        return JsonResponse({'errors': form.errors})
