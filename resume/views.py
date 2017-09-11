from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ListStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, ListFlowable
from tempfile import NamedTemporaryFile
from django.http import JsonResponse
import os
import json

styles = getSampleStyleSheet()
style = styles["Normal"]
list_style = styles["UnorderedList"]

# Create your views here.
WIDTH, HEIGHT = letter

TOP_MARGIN = HEIGHT - 100
LEFT_MARGIN = 100

LINE_HEIGHT = 20
SPACER = 20
MAX_HEIGHT = 100

TOP_TABLE_MARGIN = HEIGHT - 200

FIRST_COL_WIDTH = (WIDTH - LEFT_MARGIN)/5
SECOND_COL_WIDTH = (WIDTH - LEFT_MARGIN) * 4/5
SECOND_COL_START = FIRST_COL_WIDTH + LEFT_MARGIN


def create_header_field(canvas, starting_height, body):
    field = Paragraph(body, style=style)
    w1, h1 = field.wrap(WIDTH, MAX_HEIGHT)
    field.drawOn(canvas, LEFT_MARGIN, starting_height)

    return starting_height - h1


def create_resume_field(canvas, starting_height, header_text, body_paragraph):
    header = Paragraph(header_text, style=style)
    objective = Paragraph(body_paragraph, style=style)

    w1, h1 = header.wrap(FIRST_COL_WIDTH, MAX_HEIGHT)
    w2, h2 = objective.wrap(SECOND_COL_WIDTH, MAX_HEIGHT)

    header.drawOn(canvas, LEFT_MARGIN, starting_height)
    objective.drawOn(canvas, SECOND_COL_START, starting_height)

    return starting_height - h1 if h1 > h2 else starting_height - h2


def create_list_resume_field(canvas, starting_height, header_text, list_data):
    header = Paragraph(header_text, style=style)

    bullet_list = []
    for skill in list_data:
        bullet_list.append(Paragraph(skill, style=style))
    list_flow = ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
        bulletFontSize=16, style=list_style)

    w1, h1 = header.wrapOn(canvas, FIRST_COL_WIDTH, MAX_HEIGHT)
    w2, h2 = list_flow.wrapOn(canvas, SECOND_COL_WIDTH, LINE_HEIGHT * len(list_data))
    header.drawOn(canvas, LEFT_MARGIN, starting_height - h1)
    list_flow.drawOn(canvas, SECOND_COL_START, starting_height - h2)

    return starting_height - h1 if h1 > h2 else starting_height - h2

def create_rich_list_section(section):
    paragraphs = []
    if 'header' in section:
        paragraphs.append(Paragraph(section['header'], style=style))
    if 'dates' in section:
        paragraphs.append(Paragraph(section['dates'], style=style))
    if 'values' in section:
        bullet_list = []
        for skill in section['values']:
            bullet_list.append(Paragraph(skill['value'], style=style))
        list_flow = ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
                                 bulletFontSize=16, style=list_style)
        paragraphs.append(list_flow)

    if 'body' in section:
        paragraphs.append(Paragraph(section['body'], style=style))

    return paragraphs


def create_rich_list(canvas, starting_height, header_text, list_data):
    header = Paragraph(header_text, style=style)

    w1, h1 = header.wrapOn(canvas, FIRST_COL_WIDTH, MAX_HEIGHT)
    header.drawOn(canvas, LEFT_MARGIN, starting_height - h1)

    for item in list_data:
        section = create_rich_list_section(item)
        for paragraph in section:
            w2, h2 = paragraph.wrapOn(canvas, SECOND_COL_WIDTH, MAX_HEIGHT)
            paragraph.drawOn(canvas, SECOND_COL_START, starting_height - h2)

            starting_height -= h2
        starting_height -= SPACER

    return starting_height

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
    p = canvas.Canvas(response, pagesize=letter)

    p.setFont('Times-Roman', 16)
    starting_height = TOP_MARGIN

    for field in data:
        if field['type'] == 'header':
            starting_height = create_header_field(p, starting_height, field['value'])
        if field['type'] == 'field':
            starting_height -= SPACER
            starting_height = create_resume_field(p, starting_height, field['id'], field['value'])
        if field['type'] == 'list':
            starting_height -= SPACER
            starting_height = create_list_resume_field(p, starting_height, field['id'], field['value'])
        if field['type'] == 'rich-list':
            starting_height -= SPACER
            starting_height = create_rich_list(p, starting_height, field['id'], field['value'])

    # Draw things on the PDF. Here's where the PDF generation happens.
    # See the ReportLab documentation for the full list of functionality.

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    with NamedTemporaryFile(dir=os.path.dirname(os.path.abspath(__file__))+'/tmp', delete=False) as tmp:
        tmp.write(p.getpdfdata())

    p.save()
    return JsonResponse({'fileName': tmp.name})
