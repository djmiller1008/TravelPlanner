from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass

class SoloTrip(models.Model):
    destination = models.CharField(max_length=30)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="trips")
    budget = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    trip_start_date = models.DateField()
    trip_end_date = models.DateField()
    number_of_days = models.IntegerField()
    lat = models.DecimalField(max_digits=13, decimal_places=10)
    lon = models.DecimalField(max_digits=13, decimal_places=10)
   

class SoloDayItinerary(models.Model):
    day_number = models.IntegerField()
    trip = models.ForeignKey("SoloTrip", on_delete=models.CASCADE, related_name="daily_itinerary")
    itinerary = models.TextField()
    day_budget = models.PositiveIntegerField(default=0)

class SoloVisitLandmark(models.Model):
    day_itinerary = models.ForeignKey("SoloDayItinerary", on_delete=models.CASCADE, related_name="landmarks")
    trip = models.ForeignKey("SoloTrip", on_delete=models.CASCADE, related_name="trips")
    xid = models.CharField(max_length=10)
    name = models.CharField(max_length=64)
    


