import os

from flask import current_app, Blueprint, render_template
api = Blueprint('api', __name__)

from .game import generate_positions, generate_board


@api.route('/api/get/<string:seed>')
def get_puzzle(seed: str):
    if (seed == 'today'):
        seed = seed + os.getenv('TODAY_SECRET_KEY', '8c81238s1')
    points = generate_positions(8, 8, seed)
    return {
        'width': 8,
        'height': 8,
        'board': generate_board(8, 8, points)
    }