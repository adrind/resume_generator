from reportlab.lib import colors
from reportlab.lib.styles import ListStyle, ParagraphStyle, StyleSheet1

RESUME1_HEADER_COLOR = colors.Color(.75, .12, .12)
RESUME1_FIELD_HEADER_COLOR = colors.Color(0, .5, .5)


def create_template_2_stylesheet():
    stylesheet = StyleSheet1()
    stylesheet.add(ParagraphStyle(name = 'Normal',
                                  fontName = 'Times-Roman',
                                  fontSize = 16,
                                  leading = 18,
                                  spaceAfter=5))

    stylesheet.add(ParagraphStyle(name = 'Name',
                                  parent=stylesheet['Normal'],
                                  fontSize = 28,
                                  leading = 32,
                                  fontName = 'Times-Roman',
                                  alignment = 1
                                  ))

    stylesheet.add(ParagraphStyle(name = 'h2-heading',
                                  parent=stylesheet['Normal'],
                                  fontSize = 22,
                                  leading = 24,
                                  fontName = 'Times-Roman',
                                  alignment = 0
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

    stylesheet.add(ParagraphStyle(name = 'bold',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  fontName='Times-Bold',
                                  leading = 18))

    stylesheet.add(ParagraphStyle(name = 'Field-Header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18,
                                  fontName='Times-Bold',
                                  textColor = RESUME1_FIELD_HEADER_COLOR
                                  ))

    stylesheet.add(ParagraphStyle(name = 'centered',
                                  parent=stylesheet['Normal'],
                                  fontSize = 16,
                                  leading = 18,
                                  fontName = 'Times',
                                  alignment = 1
                                  ))

    stylesheet.add(ParagraphStyle(name = 'template2-header',
                                  parent=stylesheet['Normal'],
                                  fontSize = 22,
                                  leading = 18,
                                  fontName = 'Times',
                                  alignment = 1
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

