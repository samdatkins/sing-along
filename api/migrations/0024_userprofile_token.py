# Generated by Django 3.2.19 on 2023-10-23 23:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_wishlistsong'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='token',
            field=models.CharField(blank=True, max_length=24, null=True),
        ),
    ]
