import requests
from pathlib import Path
import argparse
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('target')           # positional argument
    parser.add_argument('-y', '--yes',
                         action='store_true')      # option that takes a value
    # parser.add_argument('-v', '--verbose',
    #                     action='store_true')  # on/off flag
    # print(args.filename, args.count, args.verbose)
    args = parser.parse_args()
    name = args.target
    name = Path(name).with_suffix('')

    if name.is_dir():
        # loop each name and ask.
        for filepath in tuple(name.glob('*.html')):
            if replace_origin(filepath):
                slooth(filepath.stem, yes=args.yes)
        return

    return slooth(name, yes=args.yes)


def slooth(name, yes):
    ok = make(name)
    p = f'./examples/{name}.html'
    if not ok:
        print('Failed.')
        return
    path = Path(p)
    if path.exists():
        if yes or replace_origin(p):
            template = """{% extends "./generic_named.html" %}"""
            path.write_text(template)
    else:
        print('File does not exist:', p)


def open_file(filename):
    s = f'"C:/Program Files/Sublime Text 3/sublime_text.exe" {filename}'
    os.system(s)


def replace_origin(name, default=True):
    answer = input(f'Replace "{name}" content (default: {default})? ')
    if len(answer.strip()) == 0:
        return default
    return answer.lower() in 'yes'


def make(name):
    # Convert a file to the imports
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
    open_file(path)
    return path.exists()


if __name__ == '__main__':
    main()
