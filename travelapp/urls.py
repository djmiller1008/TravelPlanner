from django.urls import path 
from . import views 

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("discover", views.discover, name="discover"),
    path("discover/<str:name>", views.discover_destination, name="discover_destination"),
    path("plan", views.plan_solo_trip, name="plan"),
    path("trips", views.trips, name="trips")
]