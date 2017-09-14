from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ListStyle, ParagraphStyle, StyleSheet1
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, ListFlowable
from tempfile import NamedTemporaryFile
from django.http import JsonResponse
import os
import json

RESUME1_HEADER_COLOR = colors.Color(.75, .12, .12)
RESUME1_FIELD_HEADER_COLOR = colors.Color(0, .5, .5)

#Stylesheet used to style our PDF
def create_stylesheet():
    global styles, style

    fontName = 'Times-Roman'

    stylesheet = StyleSheet1()
    stylesheet.add(ParagraphStyle(name = 'Normal',
                                  fontName = fontName,
                                  fontSize = 16,
                                  leading = 18,
                                  spaceAfter=5))

    stylesheet.add(ParagraphStyle(name = 'Header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18))

    stylesheet.add(ParagraphStyle(name = 'Field-Header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18,
                                  textColor = RESUME1_FIELD_HEADER_COLOR
                                  ))

    stylesheet.add(ParagraphStyle(name = 'Rich-List-Header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18,
                                  fontName = 'Times-Bold'
                                  ))

    stylesheet.add(ListStyle(name='UnorderedList',
                                parent=None,
                                leftIndent=18,
                                rightIndent=0,
                                bulletAlign='left',
                                bulletType='1',
                                bulletColor=colors.black,
                                bulletFontName='Times-Roman',
                                bulletFontSize=16,
                                bulletOffsetY=0,
                                bulletDedent='auto',
                                bulletDir='ltr',
                                bulletFormat=None,
                                #start='circle square blackstar sparkle disc diamond'.split(),
                                start=None,
                            ),
                   alias='ul')

    return stylesheet


styles = create_stylesheet()
style = styles['Normal']
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


#Header fields are simple fields used at the top of a resume
def create_header_field(canvas, starting_height, body):
    field = Paragraph(body, style=styles['Header'])
    w1, h1 = field.wrap(WIDTH, MAX_HEIGHT)
    field.drawOn(canvas, LEFT_MARGIN, starting_height - h1)

    return starting_height - h1

#A resume field is a basic field that spans two columns: a header (left col) and body (right col)
def create_resume_field(canvas, starting_height, header_text, body_paragraph):
    header = Paragraph(header_text, style=styles['Field-Header'])
    objective = Paragraph(body_paragraph, style=style)

    w1, h1 = header.wrap(FIRST_COL_WIDTH, MAX_HEIGHT)
    w2, h2 = objective.wrap(SECOND_COL_WIDTH, MAX_HEIGHT)

    header.drawOn(canvas, LEFT_MARGIN, starting_height)
    objective.drawOn(canvas, SECOND_COL_START, starting_height)

    return starting_height - h1 if h1 > h2 else starting_height - h2

#A list is a simple component with a header (left col) and bullet list (right col)
def create_list_resume_field(canvas, starting_height, header_text, list_data):
    header = Paragraph(header_text, style=styles['Field-Header'])

    bullet_list = []
    for item in list_data:
        bullet_list.append(Paragraph(item['value'], style=style))
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
        paragraphs.append(Paragraph(section['header'], style=styles['Rich-List-Header']))
    if 'dates' in section:
        paragraphs.append(Paragraph(section['dates'], style=styles['Rich-List-Header']))
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

#A rich list has multiple fields
#A header for the left column, list_data, or body (TODO)
def create_rich_list(canvas, starting_height, header_text, list_data):
    header = Paragraph(header_text, style=styles['Field-Header'])

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
    # This will not actually get sent back
    p = canvas.Canvas(response, pagesize=letter)

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

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    with NamedTemporaryFile(dir=os.path.dirname(os.path.abspath(__file__))+'/tmp', delete=False) as tmp:
        tmp.write(p.getpdfdata())

    p.save()
    #Send response with path of temporary file name
    return JsonResponse({'fileName': tmp.name})
