# Generated by Django 3.2.15 on 2022-11-03 15:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('travelapp', '0005_auto_20221103_1503'),
    ]

    operations = [
        migrations.RenameField(
            model_name='solodayitinerary',
            old_name='trip_id',
            new_name='trip',
        ),
        migrations.RenameField(
            model_name='solovisitlandmark',
            old_name='day_itinerary_id',
            new_name='day_itinerary',
        ),
    ]
