import requests
from pathlib import Path


def main():
    name = 'angle-point'
    ok = make(name)
    p = f'./examples/{name}.html'
    if not ok:
        print('Failed.')
        return

    path = Path(p)
    if path.exists():
        if replace_origin(p):
            template = """{% extends "./generic_named.html" %}"""
            path.write_text(template)
    else:
        print('File does not exist:', p)

def replace_origin(name):
    answer = input(f'Replace "{name}.html" content? ')
    return answer.lower() in 'yes'

def make(name):
    # Convert a file to the imports

    name = 'angle-point'
    ## pull the content using the import scripting tool.
    resp = requests.get(f'http://localhost:8000/examples/script_list_raw/{name}/')
    ## grab the new file content
    content = resp.text

    p = f'./examples/imports/{name}.html'
    path = Path(p)

    if path.exists():
        print('path exists:', path)
        return False

    path.write_text(content)
    print('making file', path)
    return path.exists()


if __name__ == '__main__':
    main()
