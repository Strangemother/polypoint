import imageio

import imageio.v3 as iio
from pathlib import Path


images = []

HERE = Path(__file__).parent
# images_dir = HERE / "./images/"

images_dir = ("C:/Users/jay/Documents/projects/polypoint"
              "/site/beta/media/uploads/gif-recorder/"
              "0ff5c1e6-a5c2-40f3-8aeb-eaf8f26b3a77")

images_dir = Path(images_dir)


from image2gif import writeGif
from PIL import Image
import os

file_names = sorted(images_dir.iterdir())
#['animationframa.png', 'animationframb.png', 'animationframc.png', ...] "
images = [Image.open(fn) for fn in file_names]
# writeGif(filename, images, duration=0.1, loops=0, dither=1)
#    Write an animated gif from the specified images.
#    images should be a list of numpy arrays of PIL images.
#    Numpy images of type float should have pixels between 0 and 1.
#    Numpy images of other types are expected to have values between 0 and 255.

#images.extend(reversed(images)) #infinit loop will go backwards and forwards.

filename = "my_gif.gif"
writeGif(filename, images, duration=len(file_names) / 60)
#54 frames written
