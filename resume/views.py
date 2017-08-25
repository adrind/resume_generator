from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ListStyle
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas, textobject
from reportlab.platypus import Paragraph, ListFlowable, ListItem

styles = getSampleStyleSheet()
style = styles["Normal"]
list_style = styles["UnorderedList"]

# Create your views here.
WIDTH, HEIGHT = letter

LEFT_MARGIN = 100
TOP_MARGIN = HEIGHT - 100

LINE_HEIGHT = 20
SPACER = 20

TOP_TABLE_MARGIN = HEIGHT - 200

FIRST_COL_WIDTH = (WIDTH - LEFT_MARGIN)/5
SECOND_COL_WIDTH = (WIDTH - LEFT_MARGIN) * 4/5
SECOND_COL_START = FIRST_COL_WIDTH + LEFT_MARGIN


def create_header(canvas):
    header_info = {
        'name': "Adrienne Dreyfus",
        'address': "3099 Washington st APT 20",
        'city': "San Francisco, CA 94115",
        'fontName': "Helvetica",
        'size': 14,
        'textColor': colors.slategray}

    header = Paragraph('''<para align=left spaceb=3>
                              <font name=%(fontName)s size=%(size)s color=%(textColor)s>
                              %(name)s<br/>
                              %(address)s<br/>
                              %(city)s<br/>
                              </font></para>''' % header_info, style=style, bulletText=None)

    header.wrap(300, 300)
    header.drawOn(canvas, LEFT_MARGIN, TOP_MARGIN)

def create_text_header(canvas, data):
    canvas.setFont('Times-Bold', 16)
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN, data['name'])
    canvas.setFont('Times-Roman', 16)
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN - LINE_HEIGHT, data['address'])
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN - LINE_HEIGHT*2, data['city'])

def create_objective(canvas, objective):
    return create_resume_field(canvas, 0, "Objective", objective)

def create_resume_field(canvas, starting_height, header_text, body_paragraph):
    canvas.setFont('Times-Bold', 16)
    header = Paragraph(header_text, style=style)
    canvas.setFont('Times-Roman', 16)
    objective = body_paragraph

    w1, h1 = header.wrap(FIRST_COL_WIDTH, 100)
    w2, h2 = objective.wrap(SECOND_COL_WIDTH, 100)

    header.drawOn(canvas, LEFT_MARGIN, TOP_TABLE_MARGIN - h1 - starting_height)
    objective.drawOn(canvas, SECOND_COL_START, TOP_TABLE_MARGIN - h2 - starting_height)

    return h1 if h1 > h2 else h2

def create_list_resume_field(canvas, starting_height, header_text, list_data):
    header = Paragraph(header_text, style=style)

    bullet_list = []
    for skill in list_data:
        bullet_list.append(Paragraph(skill, style=style))
    list = ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
        bulletFontSize=16, style=list_style)

    w1, h1 = header.wrapOn(canvas, FIRST_COL_WIDTH, 100)
    w2, h2 = list.wrapOn(canvas, SECOND_COL_WIDTH, LINE_HEIGHT * len(list_data))
    header.drawOn(canvas, LEFT_MARGIN, TOP_TABLE_MARGIN - h1 - starting_height - SPACER)
    list.drawOn(canvas, SECOND_COL_START, TOP_TABLE_MARGIN - h2 - starting_height - SPACER)

    return h1 if h1 > h2 else h2

def create_resume_section(header, dates, body):
    return Paragraph('''<font color="red">{header}</font><br/>
    <font color="blue">{dates}</font><br/>
    {body}
    '''.format(header=header, dates=dates, body=body), style=style)

def create_skills(canvas, height, skill_arr):
    return create_list_resume_field(canvas, height, "Skills", skill_arr)

def create_education(canvas, height):
    return create_resume_field(canvas, height, "Education", create_resume_section("Tufts", "2009-2013", "I went here!"))


def home(request):
    return render(request, "resume/home_page.html")

def guide(request):
    return render(request, "resume/resume.html")

def get_resume(request):
    data = request.GET
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="somefilename.pdf"'

    # Create the PDF object, using the response object as its "file."
    p = canvas.Canvas(response, pagesize=letter)

    p.setFont('Times-Roman', 16)

    create_text_header(p, data)
    h1 = create_objective(p, Paragraph(data['objective'], style=style))
    h2 = create_skills(p, h1, data['skills'].split(','))
    h3 = create_education(p, h2 + h1 + SPACER * 2)

    # Draw things on the PDF. Here's where the PDF generation happens.
    # See the ReportLab documentation for the full list of functionality.

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()

    return response
