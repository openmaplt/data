import jinja2
import os

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))


class ObjectRenderer():
    @staticmethod
    def toHtml(obj, htmlTemplate, **kwargs):
        """ Render node, way or relation using some template.
            htmlTemplate could be 'toggle', 'diff', 'full' """
        return obj.renderWith(ObjectRenderer, htmlTemplate, **kwargs)

    @staticmethod
    def toMapJs(obj, mapVar, color=None):
        return obj.renderWith(
            ObjectRenderer,
            'map_js',
            mapVar=mapVar,
            color=color)

    @staticmethod
    def renderNode(node, htmlTemplate, **kwargs):
        template = jinja_environment.get_template(
            'template/node/%s.html' % htmlTemplate)
        template_values = {'node': node}
        template_values.update(kwargs)
        return template.render(template_values)

    @staticmethod
    def renderWay(way, htmlTemplate, **kwargs):
        template = jinja_environment.get_template(
            'template/way/%s.html' % htmlTemplate)
        template_values = {'way': way}
        template_values.update(kwargs)
        return template.render(template_values)

    @staticmethod
    def renderRelation(relation, htmlTemplate, **kwargs):
        template = jinja_environment.get_template(
            'template/relation/%s.html' % htmlTemplate)
        template_values = {'relation': relation}
        template_values.update(kwargs)
        return template.render(template_values)
