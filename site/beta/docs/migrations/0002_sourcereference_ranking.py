from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("docs", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="sourcereference",
            name="ranking",
            field=models.IntegerField(default=0),
        ),
        migrations.AddIndex(
            model_name="sourcereference",
            index=models.Index(fields=["ranking"], name="docs_source_rankin_4a4136_idx"),
        ),
    ]
