export const DJANGO_MODELS_CODE = `# tent_rental/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

class Location(models.Model):
    city = models.CharField(
        max_length=120,
        db_index=True,
        help_text=_("Primary metropolitan area or city name")
    )
    area_name = models.CharField(
        max_length=255,
        help_text=_("Specific zone, district, or neighborhood coverage")
    )
    postal_code_prefix = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_("Postal code prefix for regional delivery validation")
    )
    delivery_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00)]
    )
    is_available = models.BooleanField(
        default=True,
        db_index=True,
        help_text=_("Designates whether tent delivery is actively serviced in this area")
    )
    minimum_rental_days = models.PositiveIntegerField(
        default=1,
        help_text=_("Minimum consecutive days required for delivery to this zone")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Service Location")
        verbose_name_plural = _("Service Locations")
        ordering = ["city", "area_name"]
        indexes = [
            models.Index(fields=["city", "is_available"], name="idx_loc_city_avail"),
        ]

    def __str__(self):
        return f"{self.city} - {self.area_name} ({'Available' if self.is_available else 'Offline'})"


class TentCategory(models.TextChoices):
    WEDDING_MARQUEE = "WEDDING", _("Wedding Marquee")
    LUXURY_GLAMPING = "GLAMPING", _("Luxury Glamping")
    PARTY_CANOPY = "PARTY", _("Party Canopy")
    HIGH_PEAK = "HIGH_PEAK", _("High Peak Pagoda")
    CLEAR_SPAN = "CLEAR_SPAN", _("Clear Span Architectural")
    DOME_ALPINE = "DOME", _("Alpine Geodesic Dome")


class Tent(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    category = models.CharField(
        max_length=30,
        choices=TentCategory.choices,
        default=TentCategory.PARTY_CANOPY,
        db_index=True
    )
    description = models.TextField(help_text=_("Comprehensive description of tent style and usage"))
    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(1.00)],
        db_index=True
    )
    capacity_seated = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Maximum recommended seated guests with round dining tables")
    )
    capacity_standing = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Maximum recommended standing cocktail guests")
    )
    dimensions = models.CharField(
        max_length=100,
        help_text=_("e.g. 40ft x 80ft (3,200 sq ft)")
    )
    peak_height = models.CharField(
        max_length=50,
        default="15 ft",
        help_text=_("Apex clearance height")
    )
    image = models.ImageField(
        upload_to="tents/photos/%Y/%m/",
        blank=True,
        null=True,
        help_text=_("High-resolution primary banner image")
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text=_("External CDN or Unsplash photo link if not using local storage")
    )
    waterproof_rating = models.CharField(max_length=150, default="100% Commercial PVC Water-Shield")
    wind_resistance = models.CharField(max_length=100, default="Rated up to 50 mph")
    stock_quantity = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Tent Inventory")
        verbose_name_plural = _("Tents")
        ordering = ["-is_featured", "price_per_day"]
        indexes = [
            models.Index(fields=["is_active", "category", "price_per_day"], name="idx_tent_search"),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()}) - \${self.price_per_day}/day"


class BookingStatus(models.TextChoices):
    PENDING = "PENDING", _("Pending Approval")
    CONFIRMED = "CONFIRMED", _("Confirmed & Scheduled")
    COMPLETED = "COMPLETED", _("Completed")
    CANCELLED = "CANCELLED", _("Cancelled")


class Booking(models.Model):
    booking_number = models.CharField(max_length=30, unique=True, db_index=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(db_index=True)
    customer_phone = models.CharField(max_length=30)
    
    tent = models.ForeignKey(
        Tent,
        on_delete=models.PROTECT,
        related_name="bookings",
        help_text=_("Selected rental structure")
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.PROTECT,
        related_name="bookings",
        help_text=_("Designated delivery zone")
    )
    delivery_address = models.CharField(max_length=300)
    surface_type = models.CharField(
        max_length=50,
        default="Grass/Lawn",
        choices=[
            ("Grass/Lawn", "Grass/Lawn"),
            ("Concrete/Asphalt", "Concrete/Asphalt"),
            ("Deck/Patio", "Deck/Patio"),
            ("Sand/Beach", "Sand/Beach")
        ]
    )
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    guest_count = models.PositiveIntegerField(default=50)
    event_type = models.CharField(max_length=100, default="Private Celebration")
    special_instructions = models.TextField(blank=True, null=True)

    # Pricing calculations
    total_days = models.PositiveIntegerField(default=1)
    base_rent_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    security_deposit = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
        db_index=True
    )
    assigned_crew = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Customer Booking")
        verbose_name_plural = _("Customer Bookings")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "start_date"], name="idx_book_status_date"),
        ]

    def __str__(self):
        return f"Booking #{self.booking_number} - {self.customer_name} ({self.status})"
`;

export const DJANGO_VIEWS_CODE = `# tent_rental/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum, Count, Q
from django.http import JsonResponse
from django.utils import timezone
from decimal import Decimal
import random

from .models import Tent, Location, Booking, BookingStatus
from .forms import BookingForm, TentForm, LocationForm, AdminLoginForm


def home_view(request):
    """Public storefront showcasing available tents and instant location filtering."""
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', '')
    location_id = request.GET.get('location', '')
    
    tents = Tent.objects.filter(is_active=True)
    locations = Location.objects.filter(is_available=True)
    
    if query:
        tents = tents.filter(Q(name__icontains=query) | Q(description__icontains=query))
    if category:
        tents = tents.filter(category=category)
        
    context = {
        'tents': tents,
        'locations': locations,
        'selected_category': category,
        'selected_location': location_id,
        'query': query,
    }
    return render(request, 'tent_rental/home.html', context)


def tent_detail_view(request, pk):
    """Detailed tent specifications, image gallery, and instant booking modal trigger."""
    tent = get_object_or_404(Tent, pk=pk, is_active=True)
    locations = Location.objects.filter(is_available=True)
    related_tents = Tent.objects.filter(category=tent.category, is_active=True).exclude(pk=tent.pk)[:3]
    
    context = {
        'tent': tent,
        'locations': locations,
        'related_tents': related_tents,
    }
    return render(request, 'tent_rental/tent_detail.html', context)


def create_booking_view(request, tent_id=None):
    """Public customer booking creation endpoint with real-time price & date validations."""
    selected_tent = None
    if tent_id:
        selected_tent = get_object_or_404(Tent, pk=tent_id, is_active=True)

    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            
            # Date validation
            delta_days = (booking.end_date - booking.start_date).days
            if delta_days <= 0:
                messages.error(request, "End date must be after start date.")
                return render(request, 'tent_rental/booking_form.html', {'form': form, 'tent': selected_tent})

            # Check location service availability
            if not booking.location.is_available:
                messages.error(request, f"We currently do not service {booking.location.city}.")
                return render(request, 'tent_rental/booking_form.html', {'form': form, 'tent': selected_tent})

            # Financial calculations
            booking.total_days = max(1, delta_days)
            booking.base_rent_total = booking.tent.price_per_day * Decimal(booking.total_days)
            booking.delivery_fee = booking.location.delivery_fee
            subtotal = booking.base_rent_total + booking.delivery_fee
            booking.tax_amount = subtotal * Decimal('0.0825')  # 8.25% state tax
            booking.security_deposit = Decimal('200.00')
            booking.grand_total = subtotal + booking.tax_amount + booking.security_deposit
            
            # Generate unique booking reference number
            booking.booking_number = f"BK-{random.randint(10000, 99999)}"
            booking.status = BookingStatus.PENDING
            booking.save()

            messages.success(request, f"Booking #{booking.booking_number} requested successfully! We will confirm your delivery shortly.")
            return redirect('booking_confirmation', booking_number=booking.booking_number)
    else:
        initial_data = {}
        if selected_tent:
            initial_data['tent'] = selected_tent
        form = BookingForm(initial=initial_data)

    return render(request, 'tent_rental/booking_form.html', {'form': form, 'tent': selected_tent})


def booking_confirmation_view(request, booking_number):
    """Booking success and invoice receipt view."""
    booking = get_object_or_404(Booking, booking_number=booking_number)
    return render(request, 'tent_rental/booking_confirmation.html', {'booking': booking})


def check_location_api(request):
    """AJAX API for frontend location availability verification."""
    postal_code = request.GET.get('zip', '').strip()
    city = request.GET.get('city', '').strip()
    
    locations = Location.objects.filter(is_available=True)
    if postal_code:
        locations = locations.filter(postal_code_prefix__startswith=postal_code[:3])
    elif city:
        locations = locations.filter(city__icontains=city)

    data = [
        {
            'id': loc.id,
            'city': loc.city,
            'area_name': loc.area_name,
            'delivery_fee': float(loc.delivery_fee),
            'is_available': loc.is_available
        }
        for loc in locations
    ]
    return JsonResponse({'serviced': len(data) > 0, 'locations': data})


# ------------------ ADMIN INTERFACE VIEWS ------------------ #

def admin_login_view(request):
    """Secure Django session login for warehouse and fleet operations."""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_dashboard')

    if request.method == 'POST':
        form = AdminLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user.is_staff:
                login(request, user)
                messages.success(request, f"Welcome back, {user.get_full_name() or user.username}!")
                return redirect('admin_dashboard')
            else:
                messages.error(request, "Access restricted to authorized personnel only.")
    else:
        form = AdminLoginForm()

    return render(request, 'tent_rental/admin_login.html', {'form': form})


def admin_logout_view(request):
    logout(request)
    messages.info(request, "You have been securely signed out.")
    return redirect('home')


@login_required(login_url='admin_login')
@user_passes_test(lambda u: u.is_staff)
def admin_dashboard_view(request):
    """Management dashboard with KPI metrics, revenue summary, and live bookings."""
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status=BookingStatus.PENDING).count()
    confirmed_bookings = Booking.objects.filter(status=BookingStatus.CONFIRMED).count()
    total_revenue = Booking.objects.exclude(status=BookingStatus.CANCELLED).aggregate(Sum('grand_total'))['grand_total__sum'] or 0
    
    recent_bookings = Booking.objects.select_related('tent', 'location').order_by('-created_at')[:10]
    total_tents = Tent.objects.count()
    active_locations = Location.objects.filter(is_available=True).count()

    context = {
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'confirmed_bookings': confirmed_bookings,
        'total_revenue': total_revenue,
        'recent_bookings': recent_bookings,
        'total_tents': total_tents,
        'active_locations': active_locations,
    }
    return render(request, 'tent_rental/admin_dashboard.html', context)


@login_required(login_url='admin_login')
@user_passes_test(lambda u: u.is_staff)
def update_booking_status_view(request, pk):
    """Quick status updater endpoint for staff dispatchers."""
    booking = get_object_or_404(Booking, pk=pk)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in BookingStatus.values:
            booking.status = new_status
            booking.save()
            messages.success(request, f"Booking #{booking.booking_number} updated to {booking.get_status_display()}.")
    return redirect('admin_dashboard')
`;

export const DJANGO_URLS_CODE = `# tent_rental/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Public Client Interface
    path('', views.home_view, name='home'),
    path('tent/<int:pk>/', views.tent_detail_view, name='tent_detail'),
    path('book/', views.create_booking_view, name='book_tent'),
    path('book/<int:tent_id>/', views.create_booking_view, name='book_specific_tent'),
    path('booking/confirmation/<str:booking_number>/', views.booking_confirmation_view, name='booking_confirmation'),
    path('api/check-location/', views.check_location_api, name='api_check_location'),

    # Admin Management Portal
    path('portal/login/', views.admin_login_view, name='admin_login'),
    path('portal/logout/', views.admin_logout_view, name='admin_logout'),
    path('portal/dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('portal/booking/<int:pk>/status/', views.update_booking_status_view, name='update_booking_status'),
]
`;

export const DJANGO_TESTS_CODE = `# tent_rental/tests.py
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date, timedelta
from .models import Tent, Location, Booking, BookingStatus, TentCategory

class TentRentalModelTests(TestCase):
    def setUp(self):
        self.location = Location.objects.create(
            city="San Francisco",
            area_name="Downtown",
            postal_code_prefix="941",
            delivery_fee=Decimal("120.00"),
            is_available=True
        )
        self.tent = Tent.objects.create(
            name="Cathedral Marquee 40x80",
            category=TentCategory.WEDDING_MARQUEE,
            description="Luxury wedding canopy",
            price_per_day=Decimal("1450.00"),
            capacity_seated=240,
            capacity_standing=400,
            dimensions="40ft x 80ft",
            stock_quantity=3,
            is_active=True
        )

    def test_tent_creation_and_str(self):
        self.assertEqual(str(self.tent), "Cathedral Marquee 40x80 (Wedding Marquee) - $1450.00/day")
        self.assertTrue(self.tent.is_active)

    def test_booking_total_calculation(self):
        start = date.today() + timedelta(days=5)
        end = start + timedelta(days=2)
        
        booking = Booking.objects.create(
            booking_number="BK-99881",
            customer_name="Alice Smith",
            customer_email="alice@example.com",
            customer_phone="555-0192",
            tent=self.tent,
            location=self.location,
            delivery_address="77 Market St",
            start_date=start,
            end_date=end,
            total_days=2,
            base_rent_total=Decimal("2900.00"),
            delivery_fee=Decimal("120.00"),
            tax_amount=Decimal("249.15"),
            security_deposit=Decimal("500.00"),
            grand_total=Decimal("3769.15"),
            status=BookingStatus.PENDING
        )
        self.assertEqual(booking.status, BookingStatus.PENDING)
        self.assertEqual(booking.grand_total, Decimal("3769.15"))

    def test_location_check_api_endpoint(self):
        client = Client()
        response = client.get(reverse('api_check_location'), {'city': 'San Francisco'})
        self.assertEqual(response.status_code, 200)
        json_data = response.json()
        self.assertTrue(json_data['serviced'])
        self.assertEqual(len(json_data['locations']), 1)
`;

export const FIREBASE_CONFIG_CODE = `// firebase-blueprint.json & Firestore Database Structure
{
  "entities": {
    "tents": {
      "title": "Tents",
      "description": "Rental fleet units and specifications",
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "category": { "type": "string" },
        "description": { "type": "string" },
        "pricePerDay": { "type": "number" },
        "capacitySeated": { "type": "number" },
        "capacityStanding": { "type": "number" },
        "dimensions": { "type": "string" },
        "stockQuantity": { "type": "number" },
        "imageUrl": { "type": "string" },
        "status": { "type": "string", "enum": ["Available", "Low Stock", "Maintenance"] }
      },
      "required": ["name", "category", "pricePerDay", "capacitySeated"]
    },
    "locations": {
      "title": "Service Locations",
      "properties": {
        "cityName": { "type": "string" },
        "areaName": { "type": "string" },
        "postalCodePrefix": { "type": "string" },
        "deliveryFee": { "type": "number" },
        "isAvailable": { "type": "boolean" }
      },
      "required": ["cityName", "deliveryFee", "isAvailable"]
    },
    "bookings": {
      "title": "Customer Bookings",
      "properties": {
        "bookingNumber": { "type": "string" },
        "customerName": { "type": "string" },
        "customerEmail": { "type": "string" },
        "customerPhone": { "type": "string" },
        "tentId": { "type": "string" },
        "locationId": { "type": "string" },
        "startDate": { "type": "string" },
        "endDate": { "type": "string" },
        "grandTotal": { "type": "number" },
        "status": { "type": "string", "enum": ["Pending", "Confirmed", "Completed", "Cancelled"] }
      },
      "required": ["customerName", "customerEmail", "tentId", "startDate", "endDate", "grandTotal"]
    }
  },
  "firestoreRules": "rules_version = '2';\\nservice cloud.firestore {\\n  match /databases/{database}/documents {\\n    match /tents/{tentId} {\\n      allow read: if true;\\n      allow write: if request.auth != null && request.auth.token.role == 'admin';\\n    }\\n    match /locations/{locId} {\\n      allow read: if true;\\n      allow write: if request.auth != null && request.auth.token.role == 'admin';\\n    }\\n    match /bookings/{bookingId} {\\n      allow create: if request.resource.data.customerEmail != null;\\n      allow read: if true;\\n      allow update, delete: if request.auth != null && request.auth.token.role == 'admin';\\n    }\\n  }\\n}"
}
`;
