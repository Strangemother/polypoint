import requests
from django.conf import settings
from django.template import loader

LMSTUDIO_ENDPOINT = 'http://192.168.50.60:1234/v1/chat/completions'
MODEL_NAME = 'gemma-4-12b-it'


def build_payload(system_prompt, prompt_text):
    return {
        'model': MODEL_NAME,
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


def get_theatre_source(filepath):
    theatre_file = (settings.POLYPOINT_THEATRE_DIR / filepath).with_suffix('.js')
    if not theatre_file.exists():
        raise FileNotFoundError(f'File does not exist: {theatre_file}')
    return theatre_file.read_text(encoding='utf-8')


def build_prompts(source_code, notes='', request=None):
    context = {
        'source_code': source_code,
        'notes': notes,
    }
    prompt_text = loader.get_template(
        'examples/prompts/dynamic-prompt.md'
    ).render(context, request)
    system_prompt = loader.get_template(
        'examples/prompts/desc-system-prompt.md'
    ).render(context, request)
    return system_prompt, prompt_text


def request_description_response(
    filepath,
    notes='',
    request=None,
    endpoint=LMSTUDIO_ENDPOINT,
    timeout=60,
):
    source_code = get_theatre_source(filepath)
    system_prompt, prompt_text = build_prompts(
        source_code,
        notes=notes,
        request=request,
    )
    payload = build_payload(system_prompt, prompt_text)
    response = requests.post(endpoint, json=payload, timeout=timeout)
    response.raise_for_status()
    return response.json()


def extract_message(response_data):
    try:
        return response_data['choices'][0]['message']['content'].strip()
    except (KeyError, IndexError, TypeError, AttributeError):
        return ''
