# Generated by Django 5.0 on 2024-01-02 17:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('team_app', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teampokemon',
            name='team',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team_pokemons', to='team_app.team'),
        ),
    ]
