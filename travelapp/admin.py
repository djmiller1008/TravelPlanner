from django.contrib import admin

from .models import User, SoloTrip, SoloDayItinerary, SoloVisitLandmark

# Register your models here.

admin.site.register(User)
admin.site.register(SoloTrip)
admin.site.register(SoloDayItinerary)
admin.site.register(SoloVisitLandmark)