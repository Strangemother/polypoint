from . import models
from trim.admin import register_models

register_models(models, ignore=__name__)