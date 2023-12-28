# Generated by Django 5.0 on 2023-12-28 16:16

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Pokemon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=15)),
                ('type', models.CharField(max_length=15)),
                ('move_1', models.CharField(max_length=15)),
                ('move_2', models.CharField(max_length=15)),
                ('front_img', models.URLField()),
                ('back_img', models.URLField()),
                ('hp', models.IntegerField(default=10)),
                ('xp', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='UserPokemon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pokemon', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='captured_pokemon', to='pokemon_app.pokemon')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='captured_pokemon', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
