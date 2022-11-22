# Generated by Django 3.2.15 on 2022-11-22 01:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('travelapp', '0008_solovisitlandmark_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='solovisitlandmark',
            name='trip',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='trips', to='travelapp.solotrip'),
            preserve_default=False,
        ),
    ]