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

@app.route('/old')
def old():
    return render_template('old.html')

@socketio.on('offer')
def on_offer(to_id, from_id, offer):
    print(f"got offer for {to_id} from {from_id}")
    socketio.emit('offer', {"to_id": to_id, "from_id": from_id, "offer": offer}, include_self=False, to=to_id)

@socketio.on('answer')
def on_answer(to_id, from_id, answer):
    print(f"got answer for {to_id} from {from_id}")
    socketio.emit('answer', {"to_id": to_id, "from_id": from_id, "answer": answer}, include_self=False, to=to_id)

@socketio.on('candidate')
def on_candidate(to_id, from_id, cnd):
    print(f"got candidate for {to_id} from {from_id}")
    socketio.emit('candidate', {"to_id": to_id, "from_id": from_id, "cnd": cnd}, include_self=False, to=to_id)

@socketio.on('watcher')
def on_watcher(to_id, from_id):
    print(f"got watcher for {to_id} from {from_id}")
    socketio.emit('watcher', {"to_id": to_id, "from_id": from_id}, include_self=False, to=to_id)

if (__name__ == '__main__'):
    socketio.run(app, host=settings.get("flask_host", "0.0.0.0"), 
                 port=settings.get("port", 8000), 
                 debug=settings.get("debug", False), 
                 keyfile=settings.get("keyfile"), 
                 certfile=settings.get("certfile"))
