from django.contrib import admin

from . import models


@admin.register(models.TheatreFile)
class TheatreFileAdmin(admin.ModelAdmin):
    list_display = (
        'filepath',
        'name',
        'still_image_compatible',
        'has_still_image',
        'modified',
        'updated',
    )
    list_filter = (
        'still_image_compatible',
        'modified',
        'updated',
    )
    search_fields = (
        'filepath',
        'name',
        'description',
        'crc',
        'still_image_path',
    )
    ordering = ('filepath',)
    list_per_page = 100
    readonly_fields = (
        'created',
        'updated',
    )
    actions = (
        'mark_still_image_compatible',
        'mark_still_image_incompatible',
    )
    fieldsets = (
        ('File', {
            'fields': (
                'filepath',
                'name',
                'description',
            ),
        }),
        ('Image', {
            'fields': (
                'still_image_compatible',
                'still_image_path',
            ),
        }),
        ('Tracking', {
            'fields': (
                'crc',
                'modified',
                'created',
                'updated',
            ),
        }),
    )

    @admin.display(boolean=True, description='Has still image')
    def has_still_image(self, obj):
        return bool((obj.still_image_path or '').strip())

    @admin.action(description='Mark selected files as still image compatible')
    def mark_still_image_compatible(self, request, queryset):
        queryset.update(still_image_compatible=True)

    @admin.action(description='Mark selected files as still image incompatible')
    def mark_still_image_incompatible(self, request, queryset):
        queryset.update(still_image_compatible=False)