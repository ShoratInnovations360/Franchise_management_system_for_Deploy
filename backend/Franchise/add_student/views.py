from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user

        # Prevent crash for anonymous users
        if not user.is_authenticated:
            return Student.objects.none()

        # Admin sees all students
        if getattr(user, "role", None) == "admin":
            return Student.objects.all().order_by("-created_at")

        # Franchise head or staff sees only students from their franchise
        franchise = getattr(user, "franchise", None)
        if franchise:
            return Student.objects.filter(franchise=franchise).order_by("-created_at")

        # Default empty queryset
        return Student.objects.none()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response({
                "total_students": 0,
                "active_students": 0,
                "inactive_students": 0,
                "total_fees_paid": 0
            })

        # Admin: all students
        if getattr(user, "role", None) == "admin":
            students = Student.objects.all()
        else:
            # Franchise head / staff: only their franchise
            franchise = getattr(user, "franchise", None)
            students = Student.objects.filter(franchise=franchise) if franchise else Student.objects.none()

        total_fees_paid = students.aggregate(total=Sum('fees_paid'))['total'] or 0

        data = {
            "total_students": students.count(),
            "active_students": students.filter(status="Active").count(),
            "inactive_students": students.filter(status="Inactive").count(),
            "total_fees_paid": total_fees_paid,
        }

        return Response(data)