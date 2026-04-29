from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('', views.ticket_list, name='ticket_list'),
    path('tickets/', views.ticket_list, name='ticket_list_alt'),
    path('tickets/create/', views.ticket_create_select, name='ticket_create_select'),
    path('tickets/create/<str:type_code>/', views.ticket_create, name='ticket_create'),
    path('tickets/<int:pk>/', views.ticket_detail, name='ticket_detail'),
    path('tickets/<int:pk>/edit/', views.ticket_edit, name='ticket_edit'),
    
    path('custom-fields/', views.custom_field_list, name='custom_field_list'),
    path('custom-fields/create/<str:type_code>/', views.custom_field_create, name='custom_field_create'),
    path('custom-fields/<int:pk>/edit/', views.custom_field_edit, name='custom_field_edit'),
    path('custom-fields/<int:pk>/delete/', views.custom_field_delete, name='custom_field_delete'),
]