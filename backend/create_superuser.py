import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
django.setup()

User = get_user_model()

# Change these to your desired superuser credentials
EMAIL = "admin@gmail.com"
PASSWORD = "123456"

if not User.objects.filter(email=EMAIL).exists():
    User.objects.create_superuser(email=EMAIL, password=PASSWORD)
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
