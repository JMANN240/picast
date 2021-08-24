from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from os import urandom

app = Flask(__name__)
app.config['SECRET_KEY'] = urandom(24)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('candidate')
def on_candidate(cnd):
    print(f"got candidate: {cnd}")
    emit('candidate', cnd)

if (__name__ == '__main__'):
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
