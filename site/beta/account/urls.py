from trim import urls

from . import views

app_name = "account"

urlpatterns = urls.paths_named(
    views,
    index=("IndexView", ""),
    login=("LoginView", "login/"),
    logout=("LogoutView", "logout/"),
    create=("SubAccountCreateView", "create/"),
    password=("SubAccountPasswordView", "<int:pk>/password/"),
    delete=("SubAccountDeleteView", "<int:pk>/delete/"),
)
