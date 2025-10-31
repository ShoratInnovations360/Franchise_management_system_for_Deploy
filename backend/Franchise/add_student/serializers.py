from rest_framework import serializers
from .models import Student
from admin1.add_batch.models import Batch
from admin1.add_franchise.models import AddFranchise
import re

class StudentSerializer(serializers.ModelSerializer):
    # Display clean batch name without franchise code in parentheses
    batch_name = serializers.SerializerMethodField()
    
    # Franchise displayed as string (e.g. franchise code/name)
    franchise = serializers.StringRelatedField(read_only=True)
    
    # Accept franchise_id on write
    franchise_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "batch",
            "batch_name",
            "franchise",
            "franchise_id",
            "total_fees",
            "fees_paid",
            "status",
            "created_at",
        ]

    def get_batch_name(self, obj):
        """
        Remove franchise code in parentheses from batch.name.
        e.g. 'java full stack (shra)' => 'java full stack'
        """
        if obj.batch and obj.batch.name:
            # Regex to remove parentheses and content inside at end of string
            return re.sub(r"\s*\([^)]*\)$", "", obj.batch.name)
        return ""

    def create(self, validated_data):
        franchise_id = validated_data.pop("franchise_id", None)

        if franchise_id:
            try:
                franchise = AddFranchise.objects.get(id=franchise_id)
                validated_data["franchise"] = franchise
            except AddFranchise.DoesNotExist:
                raise serializers.ValidationError({"franchise_id": "Invalid franchise ID."})
        else:
            # If franchise_id not provided, get franchise from logged-in user (if any)
            user = self.context["request"].user
            validated_data["franchise"] = getattr(user, "franchise", None)
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        franchise_id = validated_data.pop("franchise_id", None)

        if franchise_id:
            try:
                franchise = AddFranchise.objects.get(id=franchise_id)
                validated_data["franchise"] = franchise
            except AddFranchise.DoesNotExist:
                raise serializers.ValidationError({"franchise_id": "Invalid franchise ID."})
        
        return super().update(instance, validated_data)
