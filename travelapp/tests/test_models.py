from django.test import TestCase, Client
from ..models import SoloTrip, User, SoloDayItinerary, SoloVisitLandmark 

class TravelAppModelTestCase(TestCase):
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
                                        trip_start_date="2023-1-25",
                                        trip_end_date="2023-1-15",
                                        number_of_days=-11,
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

                            

    def test_destination_max_length(self):
        trip1 = SoloTrip.objects.get(pk=1)
        max_length = trip1._meta.get_field('destination').max_length
        self.assertEqual(max_length, 30)

    def test_lat_max_digits_and_max_decimal_places(self):
        trip1 = SoloTrip.objects.get(pk=1)
        max_digits = trip1._meta.get_field('lat').max_digits
        max_decimal_places = trip1._meta.get_field('lat').decimal_places
        self.assertEqual(max_digits, 13)
        self.assertEqual(max_decimal_places, 10)

    def test_lon_max_digits_and_max_decimal_places(self):
        trip1 = SoloTrip.objects.get(pk=1)
        max_digits = trip1._meta.get_field('lon').max_digits
        max_decimal_places = trip1._meta.get_field('lon').decimal_places
        self.assertEqual(max_digits, 13)
        self.assertEqual(max_decimal_places, 10)


    def test_valid_trip(self):
        trip1 = SoloTrip.objects.get(destination="Bangkok")
        self.assertTrue(trip1.is_valid_trip())

    def test_invalid_trip(self):
        trip3 = SoloTrip.objects.get(destination="Tokyo")
        self.assertFalse(trip3.is_valid_trip())

    def test_negative_number_of_days(self):
        trip2 = SoloTrip.objects.get(destination="Paris")
        self.assertFalse(trip2.is_valid_trip())