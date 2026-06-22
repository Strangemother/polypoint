from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("docs", "0003_sourcereference_rank_weight"),
    ]

    operations = [
        migrations.CreateModel(
            name="SearchWeightRule",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("target", models.CharField(blank=True, max_length=255, null=True)),
                ("weight", models.IntegerField(default=0)),
                ("enabled", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True, default="", null=True)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("updated", models.DateTimeField(auto_now=True)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["target"], name="docs_searchw_target_136040_idx"),
                    models.Index(fields=["enabled"], name="docs_searchw_enabled_983d5c_idx"),
                ],
            },
        ),
    ]
