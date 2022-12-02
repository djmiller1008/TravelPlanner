from django.test import TestCase
from ..models import SoloTrip, User
from ..views import NewSoloTripForm
import datetime

class TravelAppFormTestCase(TestCase):

    def setUp(self):
        # Create Models

        user1 = User.objects.create_user(username="Chuck",
                                    password="password",
                                    email="chuck@chuck.com")

        user2 = User.objects.create_user(username="Alice",
                                    password="password",
                                    email="alice@alice.com")
        

        trip1 = SoloTrip.objects.create(destination="Bangkok",
                                        user=user1,
                                        budget=3500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=6,
                                        lat=13.7563,
                                        lon=100.5018)

        
        trip2 = SoloTrip.objects.create(destination="Paris",
                                        user=user2,
                                        budget=13500,
                                        trip_start_date="2023-1-15",
                                        trip_end_date="2023-1-25",
                                        number_of_days=11,
                                        lat=48.8566,
                                        lon=2.3522)

        trip3 = SoloTrip.objects.create(destination="Tokyo",
                                        user=user1,
                                        budget=32500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=16,
                                        lat=35.6762,
                                        lon=139.6503)

    def test_destination_label(self):
        form = NewSoloTripForm()
        self.assertTrue(form.fields["destination"].label == "Destination")

    def test_min_number_of_days(self):
        form = NewSoloTripForm()
        self.assertTrue(form.fields["number_of_days"].min_value == 1)

    def test_min_value_of_budget(self):
        form = NewSoloTripForm()
        self.assertTrue(form.fields["budget"].min_value == 1)

    def test_trip_start_date_initial_date(self):
        form = NewSoloTripForm()
        self.assertTrue(form.fields["trip_start_date"].initial == datetime.date.today())

    def test_trip_end_date_initial_date(self):
        form = NewSoloTripForm()
        self.assertTrue(form.fields["trip_end_date"].initial == (datetime.date.today() + datetime.timedelta(days=7)))
        
