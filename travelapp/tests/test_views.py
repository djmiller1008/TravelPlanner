from django.test import TestCase, Client
from ..models import SoloTrip, User, SoloDayItinerary, SoloVisitLandmark 
import pdb

class TravelAppViewsTestCase(TestCase):

    def setUp(self):

        self.client = Client()
        # Create Models

        self.user1 = User.objects.create_user(username="Chuck",
                                    password="password",
                                    email="chuck@chuck.com")

        self.user2 = User.objects.create_user(username="Alice",
                                    password="password",
                                    email="alice@alice.com")
        

        self.valid_trip1 = SoloTrip.objects.create(destination="Bangkok",
                                        user=self.user1,
                                        budget=3500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=6,
                                        lat=13.7563,
                                        lon=100.5018)

        
        self.valid_trip2 = SoloTrip.objects.create(destination="Paris",
                                        user=self.user2,
                                        budget=13500,
                                        trip_start_date="2023-1-15",
                                        trip_end_date="2023-1-25",
                                        number_of_days=11,
                                        lat=48.8566,
                                        lon=2.3522)

        self.invalid_days_trip = SoloTrip.objects.create(destination="Tokyo",
                                        user=self.user1,
                                        budget=32500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=16,
                                        lat=35.6762,
                                        lon=139.6503)
        
        self.invalid_destination_trip = SoloTrip.objects.create(destination='',
                                                           user=self.user2,
                                                            budget=13500,
                                                            trip_start_date="2023-1-15",
                                                            trip_end_date="2023-1-25",
                                                            number_of_days=11,
                                                            lat=48.8566,
                                                            lon=2.3522) 

    def test_index(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_login(self):
        login = self.client.login(username="Chuck", password="password")
        self.assertTrue(login)

    def test_invalid_login(self):
        response = self.client.post("/login", {"username": "badusername", "password": "badpassword"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["message"], "Invalid username and/or password.")

    def test_discover_page(self):
        response = self.client.get("/discover")
        self.assertEqual(response.status_code, 200)

    def test_trips_count(self):
        self.client.login(username="Chuck", password="password")
        response = self.client.get("/trips")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["trips"].count(), 2)

    def test_discover_destination_page(self):
        response = self.client.get("/discover/Bangkok")
        self.assertEqual(response.status_code, 200)

    def test_trip_show_page(self):
        self.client.login(username="Chuck", password="password")
      
        response = self.client.get(f"/trips/{self.valid_trip1.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.valid_trip1, response.context["trip"])

    def test_plan_page(self):
        self.client.login(username="Chuck", password="password")
        response = self.client.get("/plan")
        self.assertEqual(response.status_code, 200)

    def test_currency_page(self):
        response = self.client.get("/currency")
        self.assertEqual(response.status_code, 200)

    def test_valid_add_solo_trip(self):
        self.client.login(username="Chuck", password="password")
        
        response = self.client.post("/plan", {"destination": self.valid_trip1.destination, 
                                "number_of_days": self.valid_trip1.number_of_days,
                                "budget": self.valid_trip1.budget,
                                "trip_start_date": self.valid_trip1.trip_start_date,
                                "trip_end_date": self.valid_trip1.trip_end_date,
                                "lat": self.valid_trip1.lat,
                                "lon": self.valid_trip1.lon})
        
        self.assertRedirects(response, "/trips")

    def test_invalid_number_of_days_solo_trip(self):
        self.client.login(username="Chuck", password="password")
        
        response = self.client.post("/plan", {"destination": self.invalid_days_trip.destination, 
                                "number_of_days": self.invalid_days_trip.number_of_days,
                                "budget": self.invalid_days_trip.budget,
                                "trip_start_date": self.invalid_days_trip.trip_start_date,
                                "trip_end_date": self.invalid_days_trip.trip_end_date,
                                "lat": self.invalid_days_trip.lat,
                                "lon": self.invalid_days_trip.lon})
       
        self.assertEqual(response.status_code, 200)       
        self.assertEqual(response.context['message'], "With current trip dates, number of days should be 6 days")

    def test_invalid_destination_solo_trip(self):
        self.client.login(username="Chuck", password="password")

        response = self.client.post("/plan", {"destination": self.invalid_destination_trip.destination, 
                                "number_of_days": self.invalid_destination_trip.number_of_days,
                                "budget": self.invalid_destination_trip.budget,
                                "trip_start_date": self.invalid_destination_trip.trip_start_date,
                                "trip_end_date": self.invalid_destination_trip.trip_end_date,
                                "lat": self.invalid_destination_trip.lat,
                                "lon": self.invalid_destination_trip.lon})
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['message'], "Invalid Entry")