import hashlib
import secrets
import uuid

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q


THEATRE_NAME_PATTERN = r"\A[A-Za-z0-9][A-Za-z0-9_-]{0,127}\Z"


def generate_theatre_id():
    return f"th_{uuid.uuid4().hex}"


class TheatreAPIKey(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="theatre_api_keys",
    )
    key_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    @staticmethod
    def generate_token():
        return f"thk_{secrets.token_urlsafe(32)}"

    @staticmethod
    def hash_token(token):
        return hashlib.sha256(token.encode("ascii")).hexdigest()

    @classmethod
    def issue_for(cls, user, expires_at=None):
        token = cls.generate_token()
        api_key = cls.objects.create(
            user=user,
            key_hash=cls.hash_token(token),
            expires_at=expires_at,
        )
        return api_key, token

    def __str__(self):
        return f"Theatre API key for {self.user}"


class TheatreExample(models.Model):
    class Visibility(models.TextChoices):
        PRIVATE = "private", "Private"
        PUBLIC = "public", "Public"

    id = models.CharField(
        primary_key=True,
        max_length=35,
        default=generate_theatre_id,
        editable=False,
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="theatre_examples",
    )
    name = models.CharField(
        max_length=128,
        validators=[RegexValidator(THEATRE_NAME_PATTERN)],
    )
    source = models.TextField()
    revision = models.PositiveBigIntegerField(default=1)
    visibility = models.CharField(
        max_length=7,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("owner", "name"),
                condition=Q(is_deleted=False),
                name="llm_api_unique_active_theatre_name",
            )
        ]
        indexes = [models.Index(fields=("name", "visibility"))]

    def __str__(self):
        return self.name
