import os
from pathlib import Path
import dj_database_url

# BASE
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Core ─────────────────────────────────────────────────────────
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

# ALLOWED HOSTS and CSRF trusted origins (include exact frontend origin)
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "franchise-management-system-for-deploy-1.onrender.com",   # backend on Render
    "franchise-management-system-for-deploy1.onrender.com",    # frontend host (without https prefix)
    ".onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://franchise-management-system-for-deploy-1.onrender.com",
    "https://franchise-management-system-for-deploy1.onrender.com",
]

# ── Apps ─────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",

    # your apps
    "admin1.add_franchise.apps.AddFranchiseConfig",
    "admin1.accounts",
    "admin1.add_event",
    "admin1.profiles",
    "admin1.add_course",
    "Franchise.add_student",
    "admin1.add_staff",
    "admin1.notifications.apps.NotificationsConfig",
    "admin1.add_batch",
    "admin1.attendance",
]

# ── Middleware (order matters) ───────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",            # Must be high to handle preflight BEFORE CommonMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",       # serve static files
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend_project.urls"
AUTH_USER_MODEL = "accounts.User"  # OK if app label is 'accounts'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend_project.wsgi.application"

# ── Database (Render → DATABASE_URL; fallback to sqlite) ─────────
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True
    )
}

# ── Passwords ────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── i18n ─────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ── Static / Media via WhiteNoise ────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── CORS ─────────────────────────────────────────────────────────
# Add exact origins (include https://) — frontend origin is critical and must match browser origin
CORS_ALLOWED_ORIGINS = [
    "https://franchise-management-system-for-deploy1.onrender.com",   # frontend (exact)
    "https://franchise-management-system-for-deploy-1.onrender.com",  # backend origin (if needed)
]

# Allow credentials only if you actually use cookies; otherwise OK to leave True when using JWTs.
CORS_ALLOW_CREDENTIALS = True

# Allow common headers and Authorization
from corsheaders.defaults import default_headers, default_methods

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
    "x-csrftoken",
]

# Optionally include extra methods
CORS_ALLOW_METHODS = list(default_methods) + [
    "PATCH",
]

# ── DRF & JWT ───────────────────────────────────────────────────
from datetime import timedelta

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── Email (move secrets to env) ──────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "shoratteam@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "kimk scdg ntmv ffdb")


# ── Security behind Render proxy ─────────────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
