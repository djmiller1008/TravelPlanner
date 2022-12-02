from django.test import TestCase, Client
from ..models import SoloTrip, User, SoloDayItinerary, SoloVisitLandmark 

class TravelAppViewsTestCase(TestCase):

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

    def test_index(self):
        c = Client()
        response = c.get("/")
        self.assertEqual(response.status_code, 200)

    def test_login(self):
        c = Client()
        login = c.login(username='Chuck', password='password')
        self.assertTrue(login)

    def test_discover_page(self):
        c = Client()
        response = c.get("/discover")
        self.assertEqual(response.status_code, 200)

    def test_trips_count(self):
        c = Client()
        c.login(username="Chuck", password="password")
        response = c.get("/trips")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["trips"].count(), 2)

    def test_discover_destination_page(self):
        c = Client()
        response = c.get("/discover/Bangkok")
        self.assertEqual(response.status_code, 200)

    def test_trip_show_page(self):
        c = Client()
        c.login(username="Chuck", password="password")
        trip1 = SoloTrip.objects.get(destination="Bangkok")
        response = c.get(f"/trips/{trip1.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(trip1, response.context["trip"])

    def test_plan_page(self):
        c = Client()
        c.login(username="Chuck", password="password")
        response = c.get("/plan")
        self.assertEqual(response.status_code, 200)