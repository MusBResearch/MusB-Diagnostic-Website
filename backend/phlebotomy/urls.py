from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='phleb-signup'),
    path('login/', views.login_view, name='phleb-login'),
    path('dashboard/', views.dashboard_stats, name='phleb-dashboard'),
]
