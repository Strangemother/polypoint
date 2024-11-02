
from django.template.loaders.base import Loader as BaseLoader

class Loader(BaseLoader):
    def get_contents(self, origin):
        # Implement your custom logic here
        return "FOO"