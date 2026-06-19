from django.contrib import admin

# Register your models here.
from trim.admin import register_models

from . import models

register_models(models)