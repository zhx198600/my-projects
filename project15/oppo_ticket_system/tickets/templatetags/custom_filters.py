from django import template

register = template.Library()

@register.filter(name='get')
def get_item(dictionary, key):
    if isinstance(dictionary, dict):
        return dictionary.get(key, '')
    return ''
