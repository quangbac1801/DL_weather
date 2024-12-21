from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get_weather/<str:code>/', views.get_weather, name='get_weather'),
    path('weather/', views.weather_view, name='weather_view'),
    path('get-weather-data/', views.get_weather_data, name='get_weather_data'),

    path('weather_chart/', views.weather_chart, name='weather_chart'),
    path('get_chart_data/', views.get_chart_data, name='get_chart_data'),
]

