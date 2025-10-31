from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")
            role = data.get("role")
        except Exception:
            return JsonResponse({"success": False, "error": "Invalid request body"}, status=400)

        user = authenticate(request, username=email, password=password)
        if user is None:
            return JsonResponse({"success": False, "error": "Invalid credentials"}, status=401)

        # ✅ Ensure role matches
        if user.role != role:
            return JsonResponse({"success": False, "error": "Role mismatch"}, status=403)

        # ✅ Log user into session (optional if you just use JWT)
        login(request, user)

        # ✅ Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # ✅ Role-based redirect mapping
        role_redirects = {
            "admin": "/admin/dashboard",
            "franchise_head": "/franchise/dashboard",
            "staff": "/staff/dashboard",
        }

        return JsonResponse({
            "success": True,
            "message": f"Welcome {user.role}!",
            "role": user.role,
            "branch": user.branch,
            "email": user.email,
            "redirect_url": role_redirects.get(user.role, "/login"),
            "access": access_token,   # 👈 JWT access token
            "refresh": refresh_token, # 👈 JWT refresh token
        })

    return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    return Response(
        {"message": "Password updated successfully"},
        status=status.HTTP_200_OK,
    )
