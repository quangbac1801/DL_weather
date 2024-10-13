from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('get_weather/<str:code>/', views.get_weather, name='get_weather')
]
