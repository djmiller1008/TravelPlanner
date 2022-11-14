
from django.shortcuts import render
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import datetime 
import json
from .models import User, SoloTrip, SoloDayItinerary


def index(request):
    return render(request, "travelapp/index.html")

def solo_day_itineraries(request, trip_id):
    trip = SoloTrip.objects.get(pk=trip_id)
    day_itineraries = trip.daily_itinerary.all()
    response = {}
    for itinerary in day_itineraries:
        response[itinerary.day_number] = itinerary.itinerary 
    
    json_string = json.dumps(response)

    return HttpResponse(json_string, content_type="application/json")

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

def delete_solo_trip(request, trip_id):
    trip = SoloTrip.objects.get(pk=trip_id)
    trip.delete()
    success_message = json.dumps('Success')
    return HttpResponse(success_message, content_type="application/json")
    



@login_required(login_url='login')
def discover(request):
    return render(request, "travelapp/discover.html")

@login_required(login_url='login')
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
            user = request.user 
            if day_delta == number_of_days:
                new_solo_trip = SoloTrip(destination = destination,
                                            number_of_days=number_of_days,
                                            budget=budget,
                                            trip_start_date=trip_start_date,
                                            trip_end_date=trip_end_date,
                                            user=user)

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
    budget = forms.IntegerField(min_value=1, widget=forms.TextInput(attrs={'class': 'form-control'}))
    trip_start_date = forms.DateField(initial=datetime.date.today(), widget=forms.SelectDateWidget())
    trip_end_date = forms.DateField(initial=datetime.date.today() + datetime.timedelta(days=7), widget=forms.SelectDateWidget())


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "travelapp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "travelapp/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "travel/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "travelapp/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "travelapp/register.html")