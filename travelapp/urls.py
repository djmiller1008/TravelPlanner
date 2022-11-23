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
    path("add_solo_day_itinerary", views.add_solo_day_itinerary, name="add_solo_day_itinerary"),
    path("edit_solo_day_itinerary", views.edit_solo_day_itinerary, name="edit_solo_day_itinerary"),
    path("delete_solo_trip/<int:trip_id>", views.delete_solo_trip, name="delete_solo_trip"),
    path("add_solo_trip_landmark", views.add_solo_trip_landmark, name="add_solo_trip_landmark"),
    path("solo_visit_trip_landmarks/<int:trip_id>/<int:day_number>", views.solo_visit_trip_landmarks, name="solo_visit_trip_landmarks"),
    path("delete_solo_trip_landmarks/<int:trip_id>/<int:day_number>", views.delete_solo_trip_landmarks, name="delete_solo_trip_landmarks")
]