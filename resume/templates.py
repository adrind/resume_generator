from reportlab.platypus import Paragraph, ListFlowable
from . import stylesheets
from reportlab.lib.pagesizes import letter

styles = stylesheets.create_template_1_stylesheet()
list_style = styles["UnorderedList"]

# Create your views here.
WIDTH, HEIGHT = letter

TOP_PADDING = HEIGHT - 50
PADDING = 50

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

    field.drawOn(canvas, starting_x, starting_height - h1)

    return starting_height - h1

def create_list(canvas, starting_height, starting_x, max_width, list, style):
    bullet_list = []
    for item in list['data']:
        bullet_list.append(Paragraph(item, style=style))
    list = ListFlowable(bullet_list, bulletType='bullet', start='bulletchar', bulletFontName='Times-Roman',
                                   bulletFontSize=16, style=list_style)

    w1, h1 = list.wrapOn(canvas, max_width, MAX_HEIGHT)
    list.drawOn(canvas, starting_x - w1, starting_height - h1)

    return starting_height - h1

def draw_line(canvas, starting_height):
    p = canvas.beginPath()
    p.moveTo(PADDING, starting_height)
    p.lineTo(WIDTH - PADDING, starting_height)
    canvas.drawPath(p)

#A resume field is a basic field that spans two columns: a header (left col) and body (right col)
def create_resume_field(canvas, starting_height, header_text, values, style):
    first_col = Paragraph(header_text, style=stylesheets['Field-Header'])
    second_col = []

    for field in values:
        if field['style'] != '':
            second_col_style = stylesheets[field['style']]
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
    first_col.drawOn(canvas, PADDING, starting_height - h1)

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

def build_resume_2(canvas, resume):
    starting_height = TOP_PADDING

    styles = stylesheets.create_template_2_stylesheet()
    name = fetch_field(resume, 'Name')

    starting_height = create_center_field(canvas, starting_height, name['data'], styles['Name'])
    starting_height -= SPACER
    create_left_field(canvas, starting_height, fetch_field(resume, 'Address')['data'], styles['Normal'])
    starting_height = create_right_field(canvas, starting_height, fetch_field(resume, 'Email')['data'], styles['right'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'City')['data'], styles['Normal'])
    starting_height -=SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Skills')['data']['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER
    starting_height = create_left_list(canvas, starting_height, fetch_field(resume, 'Skills')['data']['values'][0], styles['Normal'])
    starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Work')['data']['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for work in fetch_field(resume, 'Work')['data']['values']:
        create_left_field(canvas, starting_height, work['name']['data'] + ', ' + work['title']['data'], styles['Normal'])
        starting_height = create_right_field(canvas, starting_height, work['dates']['data'], styles['right'])
        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Education')['data']['header'], styles['h2-heading'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for ed in fetch_field(resume, 'Education')['data']['values']:
        create_left_field(canvas, starting_height, ed['name']['data'], styles['Normal'])
        starting_height = create_right_field(canvas, starting_height, ed['dates']['data'], styles['right'])

        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    return

def build_resume_1(canvas, resume):
    starting_height = TOP_PADDING

    styles = stylesheets.create_template_1_stylesheet()
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Name')['data'], styles['Header'])
    starting_height -= TITLE_SPACER

    canvas.setStrokeColor(stylesheets.RESUME2_HEADER_COLOR)
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Address')['data'] + ', ' + fetch_field(resume, 'City')['data'] + ' | ' + fetch_field(resume, 'Email')['data'], styles['SubHeader'])
    starting_height -= SPACER

    starting_height = create_center_field(canvas, starting_height, fetch_field(resume, 'Objective')['data']['values'][0]['data'], styles['Italic'])

    starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Education')['data']['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for ed in fetch_field(resume, 'Education')['data']['values']:
        starting_height = create_left_field(canvas, starting_height, ed['name']['data'] + ' | ' + ed['dates']['data'], styles['SubHeader'])

        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Work')['data']['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER

    for work in fetch_field(resume, 'Work')['data']['values']:
        starting_height = create_left_field(canvas, starting_height, work['name']['data'] + ' | ' + work['title']['data'] + ' | ' + work['dates']['data'], styles['SubHeader'])
        starting_height -= TITLE_SPACER
        starting_height = create_left_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Skills')['data']['header'], styles['SectionHeader'])
    draw_line(canvas, starting_height)
    starting_height -= TITLE_SPACER
    starting_height = create_left_list(canvas, starting_height, fetch_field(resume, 'Skills')['data']['values'][0], styles['Normal'])
    starting_height -= SPACER

def build_resume_3(canvas, resume):
    starting_height = TOP_PADDING
    styles = stylesheets.create_template_3_stylesheet()

    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Name')['data'], styles['Name'])
    starting_height -= TITLE_SPACER
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Address')['data'], styles['Normal'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'City')['data'], styles['Normal'])
    starting_height = create_left_field(canvas, starting_height, fetch_field(resume, 'Email')['data'], styles['Normal'])
    starting_height -=TITLE_SPACER

    canvas.setStrokeColor(stylesheets.RESUME3_HEADER_COLOR)

    draw_line(canvas, starting_height)
    starting_height -=SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Objective')['data']['header'], styles['SectionHeader'])
    starting_height = create_second_column_field(canvas, starting_height , fetch_field(resume, 'Objective')['data']['values'][0]['data'], styles['Normal'])
    starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Skills')['data']['header'], styles['SectionHeader'])
    starting_height = create_second_column_list(canvas, starting_height, fetch_field(resume, 'Skills')['data']['values'][0], styles['Normal'])
    starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Education')['data']['header'], styles['SectionHeader'])
    for ed in fetch_field(resume, 'Education')['data']['values']:
        starting_height = create_second_column_field(canvas, starting_height, ed['name']['data'], styles['Normal'])
        starting_height = create_second_column_field(canvas, starting_height, ed['dates']['data'], styles['Normal'])
        starting_height -= TITLE_SPACER
        starting_height = create_second_column_list(canvas, starting_height, ed['description'], styles['Normal'])
        starting_height -= SPACER

    create_first_column_field(canvas, starting_height, fetch_field(resume, 'Work')['data']['header'], styles['SectionHeader'])
    for work in fetch_field(resume, 'Work')['data']['values']:
        starting_height = create_second_column_field(canvas, starting_height, work['name']['data'], styles['Normal'])
        starting_height = create_second_column_field(canvas, starting_height, work['dates']['data'], styles['Normal'])
        starting_height -= TITLE_SPACER
        starting_height = create_second_column_list(canvas, starting_height, work['description'], styles['Normal'])
        starting_height -= SPACER
