from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.super_admin_login, name='super-admin-login'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
]
