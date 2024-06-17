from flask import current_app, Blueprint, render_template
front = Blueprint('front', __name__)


@front.route('/')
@front.route('/play')
def index():
    return render_template('game.html')

@front.route('/create')
def create():
    return render_template('create.html')