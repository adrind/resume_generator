from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from tempfile import NamedTemporaryFile
from django.http import JsonResponse

from .templates import build_resume_1, build_resume_2, build_resume_3

import os
import json


def home(request):
    return render(request, "resume/home_page.html")

def guide(request):
    return render(request, "resume/resume.html")

def download_resume(request):
    file = request.GET['file']
    fsock = open(file, 'rb')
    response = HttpResponse(fsock, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=resume.pdf'

    return response

def get_resume(request):
    data = json.loads(request.body)
    response = HttpResponse(content_type='application/pdf')

    # Create the PDF object, using the response object as its "file."
    # This will not actually get sent back
    resume_canvas = canvas.Canvas(response, pagesize=letter)

    if data['template'] == 1:
        build_resume_1(resume_canvas, data['data'])
    if data['template'] == 2:
        build_resume_2(resume_canvas, data['data'])
    if data['template'] == 3:
        build_resume_3(resume_canvas, data['data'])

    with NamedTemporaryFile(dir=os.path.dirname(os.path.abspath(__file__))+'/tmp', delete=False) as tmp:
        tmp.write(resume_canvas.getpdfdata())

    resume_canvas.save()
    #Send response with path of temporary file name
    return JsonResponse({'fileName': tmp.name})
