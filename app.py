from flask import Flask, render_template, jsonify
from dataProcessor.utils import load_json_data

app = Flask(__name__)

@app.route("/")
def index():
   return render_template("index.html")

@app.route("/getTGData", methods=['POST'])
def getTGData():
    return jsonify(load_json_data('HeatedFlowVelocity'))

if __name__ == '__main__':
   app.run(debug = True)