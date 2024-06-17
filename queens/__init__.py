from flask import Flask

from dotenv import load_dotenv


def create_app():
    load_dotenv()
    app = Flask(__name__)

    from .front import front
    app.register_blueprint(front)

    from .api import api
    app.register_blueprint(api)

    return app
