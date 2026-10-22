from django.contrib import admin

from .models import TheatreAPIKey, TheatreExample


@admin.register(TheatreAPIKey)
class TheatreAPIKeyAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "expires_at", "revoked_at")
    list_filter = ("revoked_at",)
    readonly_fields = ("user", "key_hash", "created_at")
    fields = ("user", "key_hash", "created_at", "expires_at", "revoked_at")

    def has_add_permission(self, request):
        return False


@admin.register(TheatreExample)
class TheatreExampleAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "visibility", "revision", "is_deleted")
    list_filter = ("visibility", "is_deleted")
    search_fields = ("name", "id", "owner__username")
    readonly_fields = (
        "id",
        "revision",
        "is_deleted",
        "created_at",
        "updated_at",
    )

    def has_delete_permission(self, request, obj=None):
        return False
