import imageio
import argparse

import imageio.v3 as iio
from pathlib import Path
import re

images = []

HERE = Path(__file__).parent
# images_dir = HERE / "./images/"

# "4cfcb78f-43e2-467f-b490-e9c58fc920c1"

def natural_sort_key(s, _nsre=re.compile(r'(\d+)')):
    return [int(text) if text.isdigit() else text.lower()
            for text in _nsre.split(str(s))]


ROOT = Path("C:/Users/jay/Documents/projects/polypoint"
            "/site/beta/media/uploads/gif-recorder/")


def main():
    parser = argparse.ArgumentParser(description="Process a UUID.")
    parser.add_argument("uuid", type=str, help="UUID to process")
    args = parser.parse_args()
    # Use the UUID object (canonical string shown below)
    print(f"Create Gif: {str(args.uuid)}")
    create_gif(ROOT / args.uuid)
    print('Done')


def create_gif(images_dir, fps=30):
    images_dir = Path(images_dir)

    for file in sorted(images_dir.iterdir(), key=natural_sort_key):
        if not file.is_file():
            continue
        images.append(iio.imread(file))

    # for filename in filenames:
    #     images.append(imageio.imread(filename))
    imageio.mimsave(f'{images_dir.name}.gif', images, format='GIF-PIL', fps=fps)


if __name__ == "__main__":
    main()
