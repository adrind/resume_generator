from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^guide$', views.guide, name='guide'),
    url(r'^print$', views.get_resume, name='print')
]
