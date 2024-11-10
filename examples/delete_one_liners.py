from pathlib import Path

target = '{% extends "./generic_named.html" %}'
here = Path('.')

for file in here.iterdir():
    # print(file)
    l = 0
    if file.is_dir():
        continue

    contents = ''
    with open(file, 'r') as stream:
        for line in stream:
            contents += line
            l += len(line) > 0

    if l == 1:
        if contents.strip() == target:
            print(f"{l:<4}", f"{len(contents):<6}", file)
            # print('Found', file)


