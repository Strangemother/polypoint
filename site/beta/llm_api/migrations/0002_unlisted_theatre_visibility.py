from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("llm_api", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="theatreexample",
            name="visibility",
            field=models.CharField(
                choices=[
                    ("private", "Private"),
                    ("unlisted", "Unlisted"),
                    ("public", "Public"),
                ],
                default="unlisted",
                max_length=7,
            ),
        ),
    ]
