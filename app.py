from ssl import OP_ALL
from flask import Flask, render_template, jsonify, request
from dataProcessor.utils import load_json_data, load_SF_data

app = Flask(__name__)

@app.route("/")
def index():
   return render_template("index.html")

@app.route("/getTGData", methods=['POST'])
def getTGData():
    return jsonify(load_json_data('jungtelziemniak'))    # VortexWithMin HeatedFlowVelocity IonizationFront jungtelziemniak

@app.route("/getScalarFields", methods=['POST'])
def getScalarFields():
    ''' return the scalar fields data according to the give timstamps
    Args: 
        tDict: {'LL-SF': t-2, 'L-SF': t-1, 'SF': t, 'SF-R': t+1, 'SF-RR': t+2}
    
    Returns:
        {'LL-SF': [scalar filed], 'L-SF': [], 'SF': t, []: t+1, 'SF-RR': []}
    '''
    paras = request.get_json()
    print('paras', paras)
    for key in paras:
        paras[key] = -1 if paras[key] == -1 else load_SF_data('jungtelziemniak', paras[key])
    return jsonify(paras)


if __name__ == '__main__':
   app.run(debug = True)