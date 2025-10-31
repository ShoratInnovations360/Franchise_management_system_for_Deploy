# backend/admin1/attendance/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import StaffAttendance, StudentAttendance
from .serializers import StaffAttendanceSerializer, StudentAttendanceSerializer
from datetime import datetime


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all()
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)
        results = []

        for record in request.data:
            staff_id = record.get("staff")
            date = record.get("date")

            # Check if attendance already exists
            obj, created = StaffAttendance.objects.update_or_create(
                staff_id=staff_id,
                date=date,
                defaults={
                    "in_time": record.get("in_time"),
                    "out_time": record.get("out_time"),
                    "status": record.get("status"),
                    "branch": record.get("branch", "Unknown"),
                },
            )

            serializer = self.get_serializer(obj)
            results.append(serializer.data)

        return Response(results, status=status.HTTP_200_OK)
    def get_queryset(self):
        queryset = StaffAttendance.objects.all()
        date = self.request.query_params.get("date")
        branch = self.request.query_params.get("branch")
        staff_id = self.request.query_params.get("staff")
        if date:
            queryset = queryset.filter(date=date)
        if branch:
            queryset = queryset.filter(branch=branch)
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Supports bulk upsert from a list of attendance records
        payload = request.data
        if not isinstance(payload, list):
            payload = [payload]

        results = []
        for record in payload:
            student_id = record.get("student")
            date = record.get("date")
            obj, created = StudentAttendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                defaults={
                    "in_time": record.get("in_time"),
                    "out_time": record.get("out_time"),
                    "status": record.get("status"),
                    "branch": record.get("branch", "Unknown"),
                    "batch": record.get("batch"),
                },
            )
            results.append(self.get_serializer(obj).data)

        return Response(results, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = StudentAttendance.objects.all()
        date = self.request.query_params.get("date")
        branch = self.request.query_params.get("branch")
        batch = self.request.query_params.get("batch")
        student_id = self.request.query_params.get("student")
        if date:
            queryset = queryset.filter(date=date)
        if branch:
            queryset = queryset.filter(branch=branch)
        if batch:
            queryset = queryset.filter(batch=batch)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset
    
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import StaffAttendance, StudentAttendance

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    month = request.GET.get('month')  # Get month from query params
    if not month:
        month = datetime.now().month
    else:
        month = int(month)

    # Optional filters
    staff_id = request.GET.get('staff')
    branch = request.GET.get('branch')

    # Filter by month and optional params
    records = StaffAttendance.objects.filter(date__month=month)
    if staff_id:
        records = records.filter(staff_id=staff_id)
    if branch:
        records = records.filter(branch=branch)

    # Aggregate summary
    summary = records.values('staff__id', 'staff__name').annotate(
        present=Count('id', filter=Q(status='Present')),
        absent=Count('id', filter=Q(status='Absent')),
        half_day=Count('id', filter=Q(status='Half Day')),
        wfh=Count('id', filter=Q(status='WFH'))
    )

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_monthly_summary(request):
    """
    Returns per-student counts for the given month (and optional branch) with keys used by frontend:
    student__id, student__name, present, absent, half_day, leave
    """
    month = request.GET.get('month')
    if not month:
        month = datetime.now().month
    else:
        month = int(month)

    branch = request.GET.get('branch')

    qs = StudentAttendance.objects.filter(date__month=month)
    if branch:
        qs = qs.filter(branch=branch)

    summary = qs.values('student__id', 'student__name').annotate(
        present=Count('id', filter=Q(status='Present')),
        absent=Count('id', filter=Q(status='Absent')),
        half_day=Count('id', filter=Q(status='Half Day')),
        leave=Count('id', filter=Q(status='Leave')),
    )

    return Response(summary)
