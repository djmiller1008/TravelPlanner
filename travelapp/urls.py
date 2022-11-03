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
    path("trips", views.trips, name="trips"),
    path("trips/<int:pk>", views.trip_show, name="trip_show"),
    path("solo_day_itineraries/<int:trip_id>", views.solo_day_itineraries, name="solo_day_itineraries"),
    path("add_solo_day_itinerary", views.add_solo_day_itinerary, name="add_solo_day_itinerary")
]