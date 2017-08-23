from django.shortcuts import render
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, ListFlowable

styles = getSampleStyleSheet()
style = styles["Normal"]

# Create your views here.
WIDTH, HEIGHT = letter

LEFT_MARGIN = 100
TOP_MARGIN = HEIGHT - 100

LINE_HEIGHT = 20

TOP_TABLE_MARGIN = HEIGHT - 300

FIRST_COL_WIDTH = WIDTH/5
SECOND_COL_WIDTH = WIDTH * 4/5

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

def create_text_header(canvas):
    canvas.setFont('Times-Bold', 16)
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN, "Adrienne Dreyfus")
    canvas.setFont('Times-Roman', 16)
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN - LINE_HEIGHT, "3099 Washington st APT 20")
    canvas.drawString(LEFT_MARGIN, TOP_MARGIN - LINE_HEIGHT*2, "San Francisco, CA 94115")

def create_objective(canvas):
    canvas.drawString(LEFT_MARGIN, TOP_TABLE_MARGIN, "Objective")
    objective = Paragraph('''<para align=left spaceb=3>
                              <font name=Times-Roman size=16>
                              To learn on the job and be a good human
                              </font></para>''', style=style)
    w, h = objective.wrapOn(canvas, SECOND_COL_WIDTH, LINE_HEIGHT)

    objective.drawOn(canvas, SECOND_COL_START, TOP_TABLE_MARGIN)
    return h


def create_skills(canvas, height):
    canvas.drawString(LEFT_MARGIN, TOP_TABLE_MARGIN - height * 3, "Skills")
    skills = ListFlowable([Paragraph("Eating", style=style), Paragraph("Sleeping", style=style)], bulletType='bullet')

    w, h = skills.wrapOn(canvas, SECOND_COL_WIDTH, LINE_HEIGHT * 4)
    skills.drawOn(canvas, SECOND_COL_START, TOP_TABLE_MARGIN - height * 3)

    return h

def home(request):
    return render(request, "resume/home_page.html")

def index(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="somefilename.pdf"'

    # Create the PDF object, using the response object as its "file."
    p = canvas.Canvas(response, pagesize=letter)

    p.setFont('Times-Roman', 16)

    create_text_header(p)
    height = create_objective(p)
    create_skills(p, height)

    data = [["Objective", "To gain employment"], ["Skills", "Eating, Cooking, Eating"], ["Education", "My kitchen"]]


    # Draw things on the PDF. Here's where the PDF generation happens.
    # See the ReportLab documentation for the full list of functionality.

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()

    return response
