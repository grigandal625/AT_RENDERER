# Средства управления визуализацией пользовательских интерфейсов

## Установка

```bash
pip install git+https://github.com/grigandal625/AT_RENDERER.git@master
```

Можно также использовать утилиты `pipenv`, `poetry`

## Запуск и использование

Перед запуском убедитесь, что у вас запущени или есть возможность запустить RabbitMQ.

1. Запустить пакет [AT_QUEUE](https://github.com/grigandal625/AT_QUEUE)

```bash
python -m at_queue
```

2. Запуск основных средств

```bash
python -m at_renderer
```

После запуска можно открыть главную страницу (по умолчанию адрес http://127.0.0.1:8000), а также пользоваться методами в других компонентах, например:

```python
from at_queue.core.at_registry import ATRegistryInspector
from at_queue.core.session import ConnectionParameters
import asyncio

# класс ATRegistryInspector отнаследован от ATComponent, поэтому он может вызывать вешние методы

async def main():
    connection_parameters = ConnectionParameters('amqp://localhost:5672/') # Параметры подключения к RabbitMQ

    inspector = ATRegistryInspector(connection_parameters)
    await inspector.initialize()
    await inspector.register()

    renderer_registered = await inspector.check_external_registered('ATRenderer')

    rendered = await inspector.exec_external_method('ATRenderer', 'render_page', {
        'page': {
            'grid': {
                'rows': [
                    {
                        "props": { "style": { "height": "99.5vh" } },
                        "cols": [
                            {
                                "src": "http://....",
                                "props": { "span": 17 }
                            },
                            {
                                "src": "http://....",
                                "props": { "span": 7 }
                            }
                        ]
                    }
                ]
            }
        }
    },
    auth_token="default")
```

После этого по адресу http://127.0.0.1:8000/?auth_token=default отобразится страница с двумя ё `iframe` на которых загрузятся указанные в полях `"src"` адреса.

При повторном вызове метода `render_page` изменения в расположении, количестве и содержимого `iframe` произойдут автоматически
