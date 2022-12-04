import os 
import pathlib
import unittest
from django.test import LiveServerTestCase
from webdriver_manager.chrome import ChromeDriverManager


from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def file_uri(filename):
    return pathlib.Path(os.path.abspath(filename)).as_uri()

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(executable_path=ChromeDriverManager().install(), options=chrome_options)


class WebpageTests(unittest.TestCase):

    def test_title(self):
        driver.get(file_uri("travelapp/templates/travelapp/layout.html"))
        self.assertEqual(driver.title, "Travel App")
        driver.quit()

        
if __name__ == "__main__":
    unittest.main()