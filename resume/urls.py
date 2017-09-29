from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.guide, name='home'),
    url(r'^guide$', views.guide, name='guide'),
    url(r'^print$', views.get_resume, name='print'),
    url(r'^download', views.download_resume, name='download'),
    url(r'^doc', views.get_doc, name='doc')
]
