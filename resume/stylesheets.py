from reportlab.lib import colors
from reportlab.lib.styles import ListStyle, ParagraphStyle, StyleSheet1

RESUME1_HEADER_COLOR = colors.Color(.75, .12, .12)
RESUME1_FIELD_HEADER_COLOR = colors.Color(0, .5, .5)

RESUME2_HEADER_COLOR = colors.Color(.18, .48, .52)

RESUME3_HEADER_COLOR = colors.Color(.72, .52, .04)

def create_base_stylesheet():
    stylesheet = StyleSheet1()
    stylesheet.add(ParagraphStyle(name = 'Normal',
                                  fontName = 'Times-Roman',
                                  fontSize = 16,
                                  leading = 18,
                                  spaceAfter=5))
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

def create_template_1_stylesheet():
    stylesheet = create_base_stylesheet()

    stylesheet.add(ParagraphStyle(name = 'Header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 28,
                                  leading = 32,
                                  fontName = 'Times-Roman',
                                  textTransform='uppercase',
                                  textColor=RESUME2_HEADER_COLOR
                                  ))

    stylesheet.add(ParagraphStyle(name = 'SectionHeader',
                                  parent=stylesheet['Normal'],
                                  fontSize = 24,
                                  leading = 28,
                                  fontName = 'Times-Roman',
                                  textColor=RESUME2_HEADER_COLOR
                                  ))

    stylesheet.add(ParagraphStyle(name = 'SubHeader',
                                  parent=stylesheet['Normal'],
                                  fontSize = 18,
                                  leading = 22,
                                  fontName = 'Times-Bold',
                                  ))

    stylesheet.add(ParagraphStyle(name = 'Italic',
                                  parent=stylesheet['Normal'],
                                  fontSize = 18,
                                  leading = 22,
                                  fontName = 'Times-Italic',
                                  alignment= 1
                                  ))

    return stylesheet


def create_template_2_stylesheet():
    stylesheet = create_base_stylesheet()

    stylesheet.add(ParagraphStyle(name = 'Name',
                                  parent=stylesheet['Normal'],
                                  fontSize = 28,
                                  leading = 32,
                                  fontName = 'Times-Roman',
                                  alignment = 1,
                                  textTransform='uppercase'
                                  ))

    stylesheet.add(ParagraphStyle(name = 'right',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18,
                                  fontName = 'Times-Roman',
                                  alignment = 2
                                  ))

    stylesheet.add(ParagraphStyle(name = 'h2-heading',
                                  parent=stylesheet['Normal'],
                                  fontSize = 22,
                                  leading = 24,
                                  fontName = 'Times-Roman',
                                  alignment = 0,
                                  textTransform = 'uppercase'
                                  ))
    return stylesheet

def create_template_3_stylesheet():
    stylesheet = create_base_stylesheet()

    stylesheet.add(ParagraphStyle(name = 'Name',
                                  parent=stylesheet['Normal'],
                                  fontSize = 28,
                                  leading = 32,
                                  fontName = 'Times-Bold',
                                  textColor = RESUME3_HEADER_COLOR
                                  ))

    stylesheet.add(ParagraphStyle(name = 'SectionHeader',
                                  parent=stylesheet['Normal'],
                                  fontSize = 18,
                                  leading = 26,
                                  fontName = 'Times-Bold',
                                  textColor = RESUME3_HEADER_COLOR
                                  ))
    return stylesheet
