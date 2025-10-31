from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT Auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API Endpoints
    path("api/accounts/", include("admin1.accounts.urls")),
    path("api/add-franchise/", include("admin1.add_franchise.urls")),
    path("api/events/", include("admin1.add_event.urls")),
    path("api/profiles/", include("admin1.profiles.urls")),
    path("api/students/", include("Franchise.add_student.urls")),
    path("api/courses/", include("admin1.add_course.urls")),
    path("api/batches/", include("admin1.add_batch.urls")),
    path("api/staff/", include("admin1.add_staff.urls")),
    path("api/notifications/", include("admin1.notifications.urls")),
    path("api/attendance/", include("admin1.attendance.urls")),
]
