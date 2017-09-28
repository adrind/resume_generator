from reportlab.platypus import Paragraph, ListFlowable
from . import stylesheets
from reportlab.lib.pagesizes import letter

styles = stylesheets.create_template_1_stylesheet()
list_style = styles["UnorderedList"]

# Create your views here.
WIDTH, HEIGHT = letter

TOP_PADDING = HEIGHT - 50
PADDING = 30

LIST_LEFT_INDENT = 10

SPACER = 20
TITLE_SPACER = 10

MAX_HEIGHT = 100
MAX_FIELD_WIDTH = WIDTH - PADDING

FIRST_COL_WIDTH = (WIDTH - PADDING)/3
SECOND_COL_WIDTH = (WIDTH - PADDING) * 2/3 - PADDING
SECOND_COL_START = FIRST_COL_WIDTH + PADDING


def create_center_field(canvas, starting_height, body, style):
    return create_basic_field(canvas, starting_height, 0, WIDTH, body, style)
def create_left_field(canvas, starting_height, body, style):
    return create_basic_field(canvas, starting_height, PADDING, MAX_FIELD_WIDTH, body, style)
def create_right_field(canvas, starting_height, body, style):
    return create_basic_field(canvas, starting_height, 0, MAX_FIELD_WIDTH, body, style)

def create_first_column_field(canvas, starting_height, body, style):
    return create_basic_field(canvas, starting_height, PADDING, FIRST_COL_WIDTH, body, style)
def create_second_column_field(canvas, starting_height, body, style):
    return create_basic_field(canvas, starting_height, SECOND_COL_START, SECOND_COL_WIDTH, body, style)

def create_left_list(canvas, starting_height, body, style):
    return create_list(canvas, starting_height, WIDTH+PADDING+LIST_LEFT_INDENT, WIDTH, body, style)

def create_second_column_list(canvas, starting_height, body, style):
    return create_list(canvas, starting_height, SECOND_COL_START + SECOND_COL_WIDTH, SECOND_COL_WIDTH, body, style)

#Header fields are simple fields used at the top of a resume
def create_basic_field(canvas, starting_height, starting_x, max_width, body, style):
    field = Paragraph(body, style=style)
    w1, h1 = field.wrap(max_width, MAX_HEIGHT)

    if starting_height - h1 < 0:
        canvas.showPage()
        starting_height = TOP_PADDING

    field.drawOn(canvas, starting_x, starting_height - h1)

    return starting_height - h1

def create_list(canvas, starting_height, starting_x, max_width, list, style):
    bullet_list = []
    for item in list['data']:
        bullet_list.append(Paragraph(item, style=style))
    list = ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
                                   bulletFontSize=16, style=list_style)

    w1, h1 = list.wrapOn(canvas, max_width, MAX_HEIGHT)
    if starting_height - h1 < 0:
        canvas.showPage()
        starting_height = TOP_PADDING

    list.drawOn(canvas, starting_x - w1, starting_height - h1)

    return starting_height - h1

def draw_line(canvas, starting_height):
    p = canvas.beginPath()
    p.moveTo(PADDING, starting_height)
    p.lineTo(WIDTH - PADDING, starting_height)
    canvas.drawPath(p)

def fetch_field(resume, field_id):
    field_result = next(field for field in resume if field['id'] == field_id)
    return field_result['data']

def build_resume_2(canvas, resume):
    starting_height = TOP_PADDING

    styles = stylesheets.create_template_2_stylesheet()

    starting_height = create_center_field(canvas, starting_height, fetch_field(resume, 'Name'), styles['Name'])
    starting_height -= SPACER
    create_left_field(canvas, starting_height, fetch_field(resume, 'Address'), styles['Normal'])
    starting_height = create_right_field(canvas, starting_height, fetch_field(resume, 'Email'), styles['right'])
    create_left_field(canvas, starting_height, fetch_field(resume, 'City'), styles['Normal'])
    starting_height = create_right_field(canvas, starting_height, fetch_field(resume, 'Phone'), styles['right'])
    starting_height -=SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Skills')['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER
    starting_height = create_left_list(canvas, starting_height, fetch_field(resume, 'Skills')['values'][0], styles['Normal'])
    starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Work')['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for work in fetch_field(resume, 'Work')['values']:
        create_left_field(canvas, starting_height, work['name']['data'] + ', ' + work['title']['data'], styles['Normal'])
        starting_height = create_right_field(canvas, starting_height, work['dates']['data'], styles['right'])
        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Education')['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for ed in fetch_field(resume, 'Education')['values']:
        create_left_field(canvas, starting_height, ed['name']['data'], styles['Normal'])
        starting_height = create_right_field(canvas, starting_height, ed['dates']['data'], styles['right'])

        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    return


def build_resume_1(canvas, resume):
    starting_height = TOP_PADDING

    styles = stylesheets.create_template_1_stylesheet()
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Name'), styles['Header'])
    starting_height -= TITLE_SPACER

    canvas.setStrokeColor(stylesheets.RESUME2_HEADER_COLOR)
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    address = fetch_field(resume, 'Address')
    city = fetch_field(resume, 'City')
    email = fetch_field(resume, 'Email')
    phone = fetch_field(resume, 'Phone')

    address_line = address
    contact_line = email
    sub_head_line = ''

    if city:
        if address_line:
            address_line = address_line + ', ' + city
        else:
            address_line += city

    if phone:
        if contact_line:
            contact_line = contact_line + ' | ' + phone
        else:
            contact_line += phone

    if address_line and contact_line:
        sub_head_line = address_line + ' | ' + contact_line
    else:
        sub_head_line = address_line + contact_line

    starting_height = create_left_field(canvas, starting_height, sub_head_line, styles['SubHeader'])
    starting_height -= SPACER

    starting_height = create_center_field(canvas, starting_height, fetch_field(resume, 'Objective')['values'][0]['data'], styles['Italic'])

    starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Education')['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for ed in fetch_field(resume, 'Education')['values']:
        starting_height = create_left_field(canvas, starting_height, ed['name']['data'] + ' | ' + ed['dates']['data'], styles['SubHeader'])

        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Work')['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for work in fetch_field(resume, 'Work')['values']:
        starting_height = create_left_field(canvas, starting_height, work['name']['data'] + ' | ' + work['title']['data'] + ' | ' + work['dates']['data'], styles['SubHeader'])
        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Skills')['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER
    starting_height = create_left_list(canvas, starting_height, fetch_field(resume, 'Skills')['values'][0], styles['Normal'])
    starting_height -= SPACER

def build_resume_3(canvas, resume):
    starting_height = TOP_PADDING
    styles = stylesheets.create_template_3_stylesheet()

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Name'), styles['Name'])
    starting_height -= TITLE_SPACER
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Address'), styles['Normal'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'City'), styles['Normal'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Email'), styles['Normal'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Phone'), styles['Normal'])
    starting_height -=TITLE_SPACER

    canvas.setStrokeColor(stylesheets.RESUME3_HEADER_COLOR)

    draw_line(canvas, starting_height)
    starting_height -=SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Objective')['header'], styles['SectionHeader'])
    starting_height = create_second_column_field(canvas, starting_height , fetch_field(resume, 'Objective')['values'][0]['data'], styles['Normal'])
    starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Skills')['header'], styles['SectionHeader'])
    starting_height = create_second_column_list(canvas, starting_height, fetch_field(resume, 'Skills')['values'][0], styles['Normal'])
    starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Education')['header'], styles['SectionHeader'])
    for ed in fetch_field(resume, 'Education')['values']:
        starting_height = create_second_column_field(canvas, starting_height, ed['name']['data'], styles['Normal'])
        starting_height = create_second_column_field(canvas, starting_height, ed['dates']['data'], styles['Normal'])
        starting_height -= TITLE_SPACER
        starting_height = create_second_column_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Work')['header'], styles['SectionHeader'])
    for work in fetch_field(resume, 'Work')['values']:
        starting_height = create_second_column_field(canvas, starting_height, work['name']['data'], styles['Normal'])
        starting_height = create_second_column_field(canvas, starting_height, work['dates']['data'], styles['Normal'])
        starting_height -= TITLE_SPACER
        starting_height = create_second_column_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER
