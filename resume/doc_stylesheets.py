import os

from docx import Document
from docx.shared import Pt
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

EMU_PER_INCH = 91440

def set_doc_2_styles(styles):
    styles['Heading 1'].font.size = Pt(16)
    first_col_style = styles.add_style('First Col', WD_STYLE_TYPE.PARAGRAPH)
    first_col_style.base_style = styles['Normal']
    first_col_style.paragraph_format.alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT


def init_resume_data(resume):
    return lambda id: next(field for field in resume if field['id'] == id)['data']

def fetch_section(resume, field_id):
    return next(field for field in resume if field['id'] == field_id)['data']

def build_doc_1(resume):
    fetch_field = init_resume_data(resume)

    file_name = os.path.dirname(os.path.abspath(__file__))+'/tmp/test.docx'
    document = Document()

    document.add_heading(fetch_field('Name'), 0)

    document.add_paragraph(fetch_field('Address') + ' | ' + fetch_field('City'), style='Normal')
    document.add_paragraph(fetch_field('Objective')['values'][0]['data'], style='Normal')

    document.add_heading('Education & Certificates', 1)

    for ed in fetch_section(resume, 'Education')['values']:
        document.add_heading(ed['name']['data'] + ' | ' + ed['dates']['data'], 2)
        for item in ed['description']['data']:
            document.add_paragraph(item, style='ListBullet')

    document.add_heading('Experience', 1)

    for work in fetch_section(resume, 'Work')['values']:
        document.add_heading(work['name']['data'] + ' | ' + work['title']['data'] + ' | ' + work['dates']['data'], 2)
        for item in work['description']['data']:
            document.add_paragraph(item, style='ListBullet')

    document.add_heading('Skills', 1)
    for skill in fetch_section(resume, 'Skills')['values'][0]['data']:
        document.add_paragraph(skill, style='ListBullet')

    document.save(file_name)

    return file_name

def build_doc_2(resume):
    fetch_field = init_resume_data(resume)
    file_name = os.path.dirname(os.path.abspath(__file__))+'/tmp/test.docx'
    document = Document()

    document.add_heading(fetch_field('Name'), 0)
    table = document.add_table(rows=2, cols=2)

    address, email = table.rows[0].cells
    city, phone = table.rows[1].cells

    address.text = fetch_field('Address')
    email.paragraphs[0].text = fetch_field('Email')
    email.paragraphs[0].alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT

    city.text = fetch_field('City')
    phone.paragraphs[0].text = fetch_field('Phone')
    phone.paragraphs[0].alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT

    document.add_heading('SKILLS AND ABILITIES', 1)
    skills_table = document.add_table(rows=1, cols=2)
    first_cell, second_cell = skills_table.rows[0].cells

    for i, skill in enumerate(fetch_section(resume, 'Skills')['values'][0]['data']):
        if not (i % 2):
            first_cell.add_paragraph(skill, style='ListBullet')
        else:
            second_cell.add_paragraph(skill, style='ListBullet')

    document.add_heading('WORK AND EXPERIENCE', 1)

    for work in fetch_section(resume, 'Work')['values']:
        work_table = document.add_table(rows=1, cols=2)
        company, dates = work_table.rows[0].cells

        company.text = work['name']['data'] + ', ' + work['title']['data']
        dates.paragraphs[0].text = work['dates']['data']
        dates.paragraphs[0].alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT

    document.add_heading('EDUCATION AND CERTIFICATES', 1)

    for ed in fetch_section(resume, 'Education')['values']:
        education_table = document.add_table(rows=1, cols=2)
        name, dates = education_table.rows[0].cells

        name.text = ed['name']['data']
        dates.paragraphs[0].text = ed['dates']['data']
        dates.paragraphs[0].alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT

    document.save(file_name)
    return file_name

def build_doc_3(resume):
    fetch_field = init_resume_data(resume)
    file_name = os.path.dirname(os.path.abspath(__file__))+'/tmp/test3.docx'
    document = Document()

    document.add_heading(fetch_field('Name'), 0)
    document.add_heading(fetch_field('Address'), 2)
    document.add_heading(fetch_field('City'), 2)
    document.add_heading(fetch_field('Email'), 2)
    document.add_heading(fetch_field('Phone'), 2)

    table = document.add_table(rows=4, cols=2)
    table.allow_autofit = False
    cols = table.columns
    total_width = cols[0].width + cols[1].width
    first_col_width = EMU_PER_INCH * 2
    second_col_width = total_width - EMU_PER_INCH * 2

    objective, skills, education, work = table.rows

    objective.cells[0].text = 'Objective'
    objective.cells[1].text = fetch_field('Objective')['values'][0]['data']
    objective.cells[0].width = first_col_width
    objective.cells[1].width = second_col_width


    skills.cells[0].text = 'Skills and Abilities'
    skills.cells[0].width = first_col_width
    skills.cells[1].width = second_col_width

    for skill in fetch_section(resume, 'Skills')['values'][0]['data']:
        skills.cells[1].add_paragraph(skill, style='ListBullet')

    education.cells[0].text = 'Education and Certificates'
    education.cells[0].width = first_col_width
    education.cells[1].width = second_col_width

    for ed in fetch_section(resume, 'Education')['values']:
        education.cells[1].add_paragraph(ed['name']['data'])
        education.cells[1].add_paragraph(ed['dates']['data'])
        for item in ed['description']['data']:
            education.cells[1].add_paragraph(item, style='ListBullet')

    work.cells[0].text = 'Work and Experience'
    work.cells[0].width = first_col_width
    work.cells[1].width = second_col_width

    for work_item in fetch_section(resume, 'Work')['values']:
        work.cells[1].add_paragraph(work_item['name']['data'])
        work.cells[1].add_paragraph(work_item['title']['data'])
        work.cells[1].add_paragraph(work_item['dates']['data'])
        for item in work_item['description']['data']:
            work.cells[1].add_paragraph(item, style='ListBullet')

    document.save(file_name)
    return file_name

