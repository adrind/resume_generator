from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, ListFlowable
from tempfile import NamedTemporaryFile
from django.http import JsonResponse

from . import utils

import os
import json

styles = utils.create_template_2_stylesheet()
style = styles['Normal']
list_style = styles["UnorderedList"]

# Create your views here.
WIDTH, HEIGHT = letter

TOP_MARGIN = HEIGHT - 100
LEFT_MARGIN = 100

FIRST_COL_HEADER = WIDTH/2

LINE_HEIGHT = 20
SPACER = 20
MAX_HEIGHT = 100

TOP_TABLE_MARGIN = HEIGHT - 200

FIRST_COL_WIDTH = (WIDTH - LEFT_MARGIN)/5
SECOND_COL_WIDTH = (WIDTH - LEFT_MARGIN) * 4/5
SECOND_COL_START = FIRST_COL_WIDTH + LEFT_MARGIN

def create_centered_field(canvas, starting_height, body):
    return create_header_field(canvas, starting_height, WIDTH, body, styles['Name'])
def create_left_field(canvas, starting_height, body):
    return create_header_field(canvas, starting_height, WIDTH + LEFT_MARGIN, body, styles['Normal'])
def create_right_field(canvas, starting_height, body):
    return create_header_field(canvas, starting_height, WIDTH + LEFT_MARGIN + FIRST_COL_HEADER, body, styles['Normal'])

#Header fields are simple fields used at the top of a resume
def create_header_field(canvas, starting_height, starting_width, body, style):
    field = Paragraph(body, style=style)
    w1, h1 = field.wrap(WIDTH, MAX_HEIGHT)
    field.drawOn(canvas, starting_width - w1, starting_height - h1)

    return starting_height - h1

#A resume field is a basic field that spans two columns: a header (left col) and body (right col)
def create_resume_field(canvas, starting_height, header_text, values):
    first_col = Paragraph(header_text, style=styles['Field-Header'])
    second_col = []

    for field in values:
        if field['style'] != '':
            second_col_style = styles[field['style']]
        else:
            second_col_style = style

        if field['type'] == 'paragraph' or field['type'] == 'field':
            second_col.append(Paragraph(field['data'], style=second_col_style))
        if field['type'] == 'spacer':
            second_col.append(field)
        if field['type'] == 'list':
            bullet_list = []
            for item in field['data']:
                bullet_list.append(Paragraph(item, style=second_col_style))
            second_col.append(ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
                                     bulletFontSize=16, style=list_style))

    w1, h1 = first_col.wrapOn(canvas, FIRST_COL_WIDTH, MAX_HEIGHT)
    first_col.drawOn(canvas, LEFT_MARGIN, starting_height - h1)

    for paragraph in second_col:
        if type(paragraph) is dict:
            #then we know it's just a spacer
            starting_height -= paragraph['data']
        else:
            w2, h2 = paragraph.wrapOn(canvas, SECOND_COL_WIDTH, MAX_HEIGHT)
            paragraph.drawOn(canvas, SECOND_COL_START, starting_height - h2)
            starting_height -= h2

    return starting_height


def fetch_field(resume, field_id):
    return next(field for field in resume if field['id'] == field_id)


def build_resume_2(canvas, resume, starting_height):
    name = fetch_field(resume, 'Name')

    starting_height = create_centered_field(canvas, starting_height, name['data'])
    starting_height -= SPACER
    create_left_field(canvas, starting_height, fetch_field(resume, 'Address')['data'])
    starting_height = create_right_field(canvas, starting_height, fetch_field(resume, 'Email')['data'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'City')['data'])
    starting_height -=SPACER
    



    return

def home(request):
    return render(request, "resume/home_page.html")

def guide(request):
    return render(request, "resume/resume.html")

def download_resume(request):
    file = request.GET['file']
    fsock = open(file, 'rb')
    response = HttpResponse(fsock, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=myfile.pdf'

    return response

def get_resume(request):
    data = json.loads(request.body)
    response = HttpResponse(content_type='application/pdf')

    # Create the PDF object, using the response object as its "file."
    # This will not actually get sent back
    p = canvas.Canvas(response, pagesize=letter)

    starting_height = TOP_MARGIN

    build_resume_2(p, data, starting_height)

    #for field in data:
    #    if field['type'] == 'single-col':
    #        starting_height = create_header_field(p, starting_height, field['data'])
    #    if field['type'] == 'double-col':
    #        starting_height -= SPACER
    #        starting_height = create_resume_field(p, starting_height, field['data']['header'], field['data']['values'])

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    with NamedTemporaryFile(dir=os.path.dirname(os.path.abspath(__file__))+'/tmp', delete=False) as tmp:
        tmp.write(p.getpdfdata())

    p.save()
    #Send response with path of temporary file name
    return JsonResponse({'fileName': tmp.name})
