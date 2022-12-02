from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass

class SoloTrip(models.Model):
    destination = models.CharField(max_length=30, blank=False)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="trips")
    budget = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    trip_start_date = models.DateField(blank=False)
    trip_end_date = models.DateField(blank=False)
    number_of_days = models.IntegerField(blank=False)
    lat = models.DecimalField(max_digits=13, decimal_places=10, blank=False)
    lon = models.DecimalField(max_digits=13, decimal_places=10, blank=False)

    def is_valid_trip(self):
        if self.number_of_days <= 0:
            return False 
        elif ((self.trip_end_date - self.trip_start_date).days + 1) != self.number_of_days:
            return False 
        else:
            return True


   

class SoloDayItinerary(models.Model):
    day_number = models.IntegerField(blank=False)
    trip = models.ForeignKey("SoloTrip", on_delete=models.CASCADE, related_name="daily_itinerary")
    itinerary = models.TextField(blank=False)
    day_budget = models.PositiveIntegerField(default=0)

class SoloVisitLandmark(models.Model):
    day_itinerary = models.ForeignKey("SoloDayItinerary", on_delete=models.CASCADE, related_name="landmarks")
    trip = models.ForeignKey("SoloTrip", on_delete=models.CASCADE, related_name="trips")
    xid = models.CharField(max_length=10, blank=False)
    name = models.CharField(max_length=64, blank=False)
    


