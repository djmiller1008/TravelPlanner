# Generated by Django 3.2.15 on 2022-11-15 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('travelapp', '0006_auto_20221103_1523'),
    ]

    operations = [
        migrations.AddField(
            model_name='solotrip',
            name='lat',
            field=models.DecimalField(decimal_places=10, default=2.3, max_digits=13),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='solotrip',
            name='lon',
            field=models.DecimalField(decimal_places=10, default=2.3, max_digits=13),
            preserve_default=False,
        ),
    ]
