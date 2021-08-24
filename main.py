from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from os import urandom
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = urandom(24)
socketio = SocketIO(app)

with open("settings.json", "r") as settings_file:
    settings = json.load(settings_file)

@app.route('/settings')
def get_settings():
    return settings

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('candidate')
def on_candidate(cnd):
    print(f"got candidate: {cnd}")
    emit('candidate', cnd)

if (__name__ == '__main__'):
    socketio.run(app, host=settings.get("flask_host", "0.0.0.0"), 
                 port=settings.get("port", 8000), 
                 debug=settings.get("debug", False), 
                 keyfile=settings.get("keyfile"), 
                 certfile=settings.get("certfile"))
