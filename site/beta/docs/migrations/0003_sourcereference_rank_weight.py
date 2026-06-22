from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("docs", "0002_sourcereference_ranking"),
    ]

    operations = [
        migrations.AddField(
            model_name="sourcereference",
            name="rank_weight",
            field=models.IntegerField(default=1),
        ),
        migrations.AddIndex(
            model_name="sourcereference",
            index=models.Index(fields=["rank_weight"], name="docs_source_rank_w_7fcb8d_idx"),
        ),
    ]
