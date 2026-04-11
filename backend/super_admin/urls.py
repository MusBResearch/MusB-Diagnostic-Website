from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.super_admin_login, name='super-admin-login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    # Offers CRUD
    path('offers/', views.admin_offers_list, name='admin-offers-list'),
    path('offers/create/', views.admin_offer_create, name='admin-offer-create'),
    path('offers/<str:offer_id>/', views.admin_offer_update, name='admin-offer-update'),
    path('offers/<str:offer_id>/delete/', views.admin_offer_delete, name='admin-offer-delete'),
    path('offers/<str:offer_id>/toggle/', views.admin_offer_toggle, name='admin-offer-toggle'),

    # Catalog Management
    path('catalog/tests/', views.admin_tests_list, name='admin-catalog-list'),
    path('catalog/tests/create/', views.admin_test_create, name='admin-catalog-create'),
    path('catalog/tests/<str:test_id>/', views.admin_test_update, name='admin-catalog-update'),
    path('catalog/tests/<str:test_id>/delete/', views.admin_test_delete, name='admin-catalog-delete'),
    path('catalog/tests/<str:test_id>/toggle/', views.admin_test_toggle, name='admin-catalog-toggle'),

    # Booking & Dispatch
    path('bookings/pending/', views.list_pending_bookings, name='admin-pending-bookings'),
    path('bookings/<str:booking_id>/approve/', views.approve_booking, name='admin-approve-booking'),
    path('bookings/<str:booking_id>/geocode/', views.geocode_booking, name='admin-geocode-booking'),

    # Fleet Management
    path('fleet/', views.list_fleet_specialists, name='admin-fleet-list'),
    path('fleet/create/', views.create_phlebotomist, name='admin-fleet-create'),
    path('fleet/<str:specialist_id>/delete/', views.delete_phlebotomist, name='admin-fleet-delete'),
]
