# Generated by Django 3.2.16 on 2023-01-16 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_auto_20221231_1715"),
    ]

    operations = [
        migrations.AlterField(
            model_name="song",
            name="content",
            field=models.TextField(blank=True, null=True),
        ),
    ]
