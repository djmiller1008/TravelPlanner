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

class SoloDayItinerary(models.Model):
    day_number = models.IntegerField()
    trip = models.ForeignKey("SoloTrip", on_delete=models.CASCADE, related_name="daily_itinerary")
    itinerary = models.TextField()

class SoloVisitLandmark(models.Model):
    day_itinerary = models.ForeignKey("SoloDayItinerary", on_delete=models.CASCADE, related_name="landmarks")
    xid = models.CharField(max_length=10)
    


