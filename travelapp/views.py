
from django.shortcuts import render
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import datetime 
import json
from .models import User, SoloTrip, SoloDayItinerary, SoloVisitLandmark

def index(request):
    return render(request, "travelapp/index.html")

def currency(request):
    return render(request, "travelapp/currency.html")

@login_required(login_url='login')
def add_day_budget(request, trip_id, day_number):
    budget = int(json.loads(request.body))
    
    day_itinerary = SoloDayItinerary.objects.get(trip=trip_id, day_number=day_number)
    if budget >= 0:
        day_itinerary.day_budget = budget
        day_itinerary.save()
        response = json.dumps('Success')
        return HttpResponse(response, content_type="application/json")
    else: 
        response = json.dumps("Invalid Entry")
        return HttpResponse(response, content_type="application/json")
    
@login_required(login_url='login')
def solo_visit_trip_landmarks(request, trip_id, day_number):
    landmarks = SoloVisitLandmark.objects.filter(trip=trip_id)
    if landmarks.exists() == False:
            json_string = json.dumps('None')
            return HttpResponse(json_string, content_type="application/json")
    else:
        response = {}
        for landmark in landmarks:
            if landmark.day_itinerary.day_number == day_number:
                response[landmark.name] = landmark.xid
    
        json_string = json.dumps(response)
        return HttpResponse(json_string, content_type="application/json")

@login_required(login_url='login')
def delete_solo_trip_landmark(request, trip_id, day_number):
    landmark_name = json.loads(request.body)
    day_itinerary = SoloDayItinerary.objects.get(trip=trip_id, day_number=day_number)
    landmark = SoloVisitLandmark.objects.filter(trip=trip_id, day_itinerary=day_itinerary, name=landmark_name)
    if landmark.exists():
        landmark.delete()
        json_string = json.dumps('Success')
        return HttpResponse(json_string, content_type="application/json")
    else:
        json_string = json.dumps('No Landmark Found')
        return HttpResponse(json_string, content_type="application/json")
    
    
@login_required(login_url='login')
def add_solo_trip_landmark(request):
    json_dict = json.loads(request.body)
    name = json_dict['name']
    day_number = json_dict['day_number']
    xid = json_dict['xid']
    trip_id = json_dict['trip_id']
    
    trip = SoloTrip.objects.get(pk=trip_id)
    day_itinerary = SoloDayItinerary.objects.get(trip=trip, day_number=day_number)
  
    new_solo_visit_landmark = SoloVisitLandmark(
        day_itinerary=day_itinerary,
        name=name,
        trip=trip,
        xid=xid
    )

    new_solo_visit_landmark.save()
    json_string = json.dumps(new_solo_visit_landmark.name)
    return HttpResponse(json_string, content_type="application/json")

@login_required(login_url='login')
def solo_day_itineraries(request, trip_id):
    trip = SoloTrip.objects.get(pk=trip_id)
    day_itineraries = trip.daily_itinerary.all()
    response = {}
    for itinerary in day_itineraries:
        response[itinerary.day_number] = itinerary.itinerary
        response[f'budget_{itinerary.day_number}'] = itinerary.day_budget
    
    json_string = json.dumps(response)

    return HttpResponse(json_string, content_type="application/json")

@login_required(login_url='login')
def add_solo_day_itinerary(request):
    json_dict = json.loads(request.body)
    day_number = json_dict['day_number']
    trip_id = json_dict['trip_id']
    itinerary = json_dict['itinerary']

    trip = SoloTrip.objects.get(pk=trip_id)

    new_day_itinerary = SoloDayItinerary(day_number=day_number,
                                            trip=trip,
                                            itinerary=itinerary)
    new_day_itinerary.save()

    json_string = json.dumps(new_day_itinerary.itinerary)

    return HttpResponse(json_string, content_type="application/json")

@login_required(login_url='login')
def edit_solo_day_itinerary(request):
    json_dict = json.loads(request.body)
    day_number = json_dict['day_number']
    trip_id = json_dict['trip_id']
    editted_itinerary = json_dict['itinerary']

    trip = SoloTrip.objects.get(pk=trip_id)
    itinerary = SoloDayItinerary.objects.get(trip=trip, day_number=day_number)

    itinerary.itinerary = editted_itinerary
    itinerary.save()

    json_string = json.dumps(itinerary.itinerary)

    return HttpResponse(json_string, content_type="application/json")

@login_required(login_url='login')
def delete_solo_trip(request, trip_id):
    trip = SoloTrip.objects.get(pk=trip_id)
    trip.delete()
    success_message = json.dumps('Success')
    return HttpResponse(success_message, content_type="application/json")
    

def discover(request):
    return render(request, "travelapp/discover.html")


def discover_destination(request, name):
    return render(request, "travelapp/discover_destination.html", {
        "name": name
    })

@login_required(login_url='login')
def trips(request):
    user = User.objects.get(username=request.user.username)
    
    trips = user.trips.all()
   
    return render(request, "travelapp/trips.html", {
        "trips": trips
    })

@login_required(login_url='login')
def trip_show(request, pk):
    trip = SoloTrip.objects.get(pk=pk)
    number_of_days = range(1, trip.number_of_days + 1)
    return render(request, "travelapp/trip_show.html", {
        "trip": trip,
        "number_of_days": number_of_days
    }) 

@login_required(login_url='login')
def plan_solo_trip(request):
    if request.method == "POST":
        
        form = NewSoloTripForm(request.POST)

        if form.is_valid():
            destination = form.cleaned_data['destination']
            number_of_days = form.cleaned_data['number_of_days']
            budget = form.cleaned_data['budget']
            trip_start_date = form.cleaned_data['trip_start_date']
            trip_end_date = form.cleaned_data['trip_end_date']
            day_delta = (trip_end_date - trip_start_date).days + 1
            lat = float(request.POST['lat'])
            lon = float(request.POST['lon']) 
            user = request.user 
            if day_delta == number_of_days:
                if budget is None:
                    budget = 0
                new_solo_trip = SoloTrip(destination = destination,
                                            number_of_days=number_of_days,
                                            budget=budget,
                                            trip_start_date=trip_start_date,
                                            trip_end_date=trip_end_date,
                                            user=user,
                                            lat=lat,
                                            lon=lon)

                new_solo_trip.save()
                return HttpResponseRedirect(reverse("trips"))
            else:
                return render(request, "travelapp/solotrip.html", {
                    "trip_form": NewSoloTripForm(),
                    "message": f"With current trip dates, number of days should be {day_delta} days"
                })

        else:
            return render(request, "travelapp/solotrip.html", {
                "trip_form": NewSoloTripForm(),
                "message": "Invalid Entry"
            })

    return render(request, "travelapp/solotrip.html", {
        "trip_form": NewSoloTripForm()
    })

class NewSoloTripForm(forms.Form):
    destination = forms.CharField(label = 'Destination', widget=forms.TextInput(attrs={'class': 'form-control'}))
    number_of_days = forms.IntegerField(min_value=1, widget=forms.TextInput(attrs={'class': 'form-control'}))
    budget = forms.IntegerField(required=False, widget=forms.TextInput(attrs={'class': 'form-control'}))
    trip_start_date = forms.DateField(initial=datetime.date.today(), widget=forms.SelectDateWidget())
    trip_end_date = forms.DateField(initial=datetime.date.today() + datetime.timedelta(days=7), widget=forms.SelectDateWidget())


def login_view(request):
    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("trips"))
        else:
            return render(request, "travelapp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "travelapp/login.html")

def demo_login(request):
    username = "demoaccount"
    password = "demoaccountpassword"
    user = authenticate(request, username=username, password=password)

    login(request, user)
    return HttpResponseRedirect(reverse("index"))

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
       
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "travelapp/register.html", {
                "message": "Passwords must match"
            })
        if username == '':
            return render(request, "travelapp/register.html", {
                "message": "You must enter a Username"
            })
        
        try:
            validate_password(password)
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "travelapp/register.html", {
                "message": "Username already taken"
            })
        except ValidationError:
            return render(request, "travelapp/register.html", {
                "message": "Passwords must be at least 8 characters long and unique"
            })  
        login(request, user)
        return HttpResponseRedirect(reverse("trips"))
    else:
        return render(request, "travelapp/register.html")