from flask import Flask, render_template
from flask_socketio import SocketIO
from os import urandom
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*")

with open("settings.json", "r") as settings_file:
    settings = json.load(settings_file)

@app.route('/settings')
def get_settings():
    return settings

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('offer')
def on_offer(offer):
    print(f"got offer: {offer}")
    socketio.emit('offer', offer, include_self=False)

@socketio.on('answer')
def on_answer(answer):
    print(f"got answer: {answer}")
    socketio.emit('answer', answer, include_self=False)

@socketio.on('candidate')
def on_candidate(cnd):
    print(f"got candidate: {cnd}")
    socketio.emit('candidate', cnd, include_self=False)

if (__name__ == '__main__'):
    socketio.run(app, host=settings.get("flask_host", "0.0.0.0"), 
                 port=settings.get("port", 8000), 
                 debug=settings.get("debug", False), 
                 keyfile=settings.get("keyfile"), 
                 certfile=settings.get("certfile"))
