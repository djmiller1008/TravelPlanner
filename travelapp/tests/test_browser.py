import os 
import pathlib
from webdriver_manager.chrome import ChromeDriverManager
from django.contrib.staticfiles.testing import StaticLiveServerTestCase

from ..models import SoloTrip, User

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def file_uri(filename):
    return pathlib.Path(os.path.abspath(filename)).as_uri()

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument("--disable-dev-shm-usage")


class WebpageTests(StaticLiveServerTestCase):

    @classmethod
    def setUp(self):
        self.driver = webdriver.Chrome(executable_path=ChromeDriverManager().install(), options=chrome_options)
        # Create Models

        self.user1 = User.objects.create_user(username="Chuck",
                                    password="password",
                                    email="chuck@chuck.com")

        self.user2 = User.objects.create_user(username="Alice",
                                    password="password",
                                    email="alice@alice.com")
        

        self.trip1 = SoloTrip.objects.create(destination="Bangkok",
                                        user=self.user1,
                                        budget=3500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=6,
                                        lat=13.7563,
                                        lon=100.5018)

        
        self.trip2 = SoloTrip.objects.create(destination="Paris",
                                        user=self.user2,
                                        budget=13500,
                                        trip_start_date="2023-1-15",
                                        trip_end_date="2023-1-25",
                                        number_of_days=11,
                                        lat=48.8566,
                                        lon=2.3522)

        self.trip3 = SoloTrip.objects.create(destination="Tokyo",
                                        user=self.user1,
                                        budget=32500,
                                        trip_start_date="2022-11-30",
                                        trip_end_date="2022-12-05",
                                        number_of_days=16,
                                        lat=35.6762,
                                        lon=139.6503)
    @classmethod
    def tearDownClass(self):
        self.driver.quit()

    def test_title(self):
        self.driver.get(self.live_server_url)
        self.assertEqual(self.driver.title, "Travel App")

    def test_unauthorized_visit_to_page(self):
        self.driver.get('%s%s' % (self.live_server_url, '/trips'))
        h1 = self.driver.find_element(By.CLASS_NAME, "h1-center")
        self.assertNotEqual(h1.text, "Trips")
       
    def test_authorized_visit_to_page(self):
        self.driver.get('%s%s' % (self.live_server_url, '/login'))
        h1 = self.driver.find_element(By.CLASS_NAME, "h1-center")
        
        username_input = self.driver.find_element(By.NAME, "username")
        username_input.send_keys('Chuck')
        password_input = self.driver.find_element(By.NAME, "password")
        password_input.send_keys('password')
        self.driver.find_element(By.XPATH, '//input[@value="Login"]').click()

        self.driver.get('%s%s' % (self.live_server_url, '/trips'))
        h1 = self.driver.find_element(By.CLASS_NAME, "h1-center")
        self.assertEqual(h1.text, "My Trips")