from django.test import TestCase, Client
from ..models import SoloTrip, User, SoloDayItinerary, SoloVisitLandmark 
import pdb
import json 

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

        self.trip_itinerary = SoloDayItinerary.objects.create(day_number=1,
                                                            trip=self.valid_trip1,
                                                            itinerary="Arrive at the airport",
                                                            day_budget=200)
        

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

    def test_logout(self):
        self.client.login(username="Chuck", password="password")
        response = self.client.get("/logout")
        self.assertRedirects(response, "/")


    def test_register(self):
        response = self.client.get("/register")
        self.assertEqual(response.status_code, 200)

    def test_valid_register(self):
        response = self.client.post("/register", {"username": "Bob",
                                        "email": "b@b.com",
                                        "password": "g1h2j3k4",
                                        "confirmation": "g1h2j3k4"})

        self.assertRedirects(response, "/")

    def test_password_match(self):
        response = self.client.post("/register", {"username": "Bob",
                                    "email": "b@b.com",
                                    "password": "g1h2j3k4",
                                    "confirmation": "a1s2d3f4"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["message"], "Passwords must match")

    def test_username_already_taken(self):
        response = self.client.post("/register", {"username": "Chuck",
                                                "email": "c@c.com",
                                                "password": "g1h2j3k4",
                                                "confirmation": "g1h2j3k4"})
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["message"], "Username already taken")

    def test_register_with_no_username(self):
        response = self.client.post("/register", {"username": "",
                                                "email": "c@c.com",
                                                "password": "g1h2j3k4",
                                                "confirmation": "g1h2j3k4"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["message"], "You must enter a Username")

    def test_register_with_bad_password(self):
        response = self.client.post("/register", {"username": "Bob",
                                                "email": "c@c.com",
                                                "password": "g1h2",
                                                "confirmation": "g1h2"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["message"], "Passwords must be at least 8 characters long and unique")

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

    def test_delete_solo_trip(self):
        self.client.login(username="Chuck", password="password")
        trip = SoloTrip.objects.get(pk=1)

        response = self.client.get(f"/delete_solo_trip/{trip.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SoloTrip.objects.filter(pk=1).exists(), False)

    def test_add_solo_day_itinerary(self):
        self.client.login(username="Chuck", password="password")
        body = {
            "day_number": 2,
            "trip_id": 1,
            "itinerary": "Check into the hotel"
        }
        response = self.client.post("/add_solo_day_itinerary", 
                            body,
                            content_type="application/json")
        self.assertEqual(response.status_code, 200)
        itinerary = SoloDayItinerary.objects.get(pk=2)
        self.assertEqual(itinerary.itinerary, "Check into the hotel")
        self.assertEqual(itinerary.day_number, 2)

    def test_edit_solo_day_itinerary(self):
        self.client.login(username="Chuck", password="password")
        body = {
            "day_number": 1,
            "trip_id": 1,
            "itinerary": "Editted itinerary"
        }
        response = self.client.post("/edit_solo_day_itinerary", body,
                                    content_type="application/json")

        self.assertEqual(response.status_code, 200)
        itinerary = SoloDayItinerary.objects.get(pk=1)
        self.assertEqual(itinerary.itinerary, "Editted itinerary")

    def test_fetch_itineraries(self):
        self.client.login(username="Chuck", password="password")
        response = self.client.get(f"/solo_day_itineraries/{1}")
        itinerary = json.loads(response.content)
        self.assertEqual(itinerary, {'1': 'Arrive at the airport', 'budget_1': 200})
      
    def test_add_day_budget(self):
        itinerary = SoloDayItinerary.objects.get(pk=1)
        self.assertEqual(itinerary.day_budget, 200)
        self.client.login(username="Chuck", password="password")
        budget = 1000
        response = self.client.post(f"/add_day_budget/{self.valid_trip1.id}/1",
                                    budget,
                                    content_type="application/json")

        self.assertEqual(response.status_code, 200)
        itinerary = SoloDayItinerary.objects.get(pk=1)

        self.assertEqual(itinerary.day_budget, 1000)

    def test_invalid_day_budget(self):
        self.client.login(username="Chuck", password="password")
        budget = -1000
        response = self.client.post(f"/add_day_budget/{self.valid_trip1.id}/1",
                                    budget,
                                    content_type="application/json")

        self.assertEqual(response.status_code, 200)
        message = json.loads(response.content)
        self.assertEqual(message, "Invalid Entry")

    
        