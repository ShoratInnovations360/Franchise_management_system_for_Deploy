from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FranchiseViewSet, dashboard_stats,my_franchise

router = DefaultRouter()
router.register(r'franchise', FranchiseViewSet, basename='franchise')

urlpatterns = [
    path('', include(router.urls)),                # /api/franchise/
    path('dashboard-stats/', dashboard_stats),     # /api/dashboard-stats/
    path('my-franchise/', my_franchise, name='my-franchise'),
    path('api/add-franchise/delete/<str:name>/', FranchiseViewSet.as_view({'delete': 'destroy_by_name'})),
]