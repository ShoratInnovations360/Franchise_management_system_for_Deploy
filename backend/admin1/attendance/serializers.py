# attendance/serializers.py
from rest_framework import serializers
from .models import StaffAttendance, StudentAttendance

class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.name", read_only=True)

    class Meta:
        model = StaffAttendance
        fields = "__all__"


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)

    class Meta:
        model = StudentAttendance
        fields = "__all__"
