from flask import Flask, redirect, request, jsonify, flash
from flask_awscognito import AWSCognitoAuthentication
from config import *
import os
import logging
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json

log = logging.getLogger(__name__)
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AWS_DEFAULT_REGION'] = AWS_DEFAULT_REGION
app.config['AWS_COGNITO_DOMAIN'] = AWS_COGNITO_DOMAIN
app.config['AWS_COGNITO_USER_POOL_ID'] = AWS_COGNITO_USER_POOL_ID
app.config['AWS_COGNITO_USER_POOL_CLIENT_ID'] = AWS_COGNITO_USER_POOL_CLIENT_ID
app.config['AWS_COGNITO_USER_POOL_CLIENT_SECRET'] = AWS_COGNITO_USER_POOL_CLIENT_SECRET
app.config['AWS_COGNITO_REDIRECT_URL'] = AWS_COGNITO_REDIRECT_URL
app.config['CORS_ENABLED'] = True

aws_auth = AWSCognitoAuthentication(app)
CORS(app, origins="*", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     supports_credentials=True)


@app.route('/')
@aws_auth.authentication_required
def index():
    claims = aws_auth.claims  # also available through g.cognito_claims
    return jsonify({'claims': claims})


@app.route('/aws_cognito_redirect')
def aws_cognito_redirect():
    access_token = aws_auth.get_access_token(request.args)
    return jsonify({'access_token': access_token})


@app.route('/sign_in')
def sign_in():
    return redirect(aws_auth.get_sign_in_url())


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def upload_file():
    algos = []
    dataSetName = None

    print(request.files)
    print(request.form)
    if 'file' not in request.files:
        return jsonify(success=False, error='file not present'), 400

    file = request.files.get('file')
    fileName = file.filename

    if fileName == '':
        return jsonify(success=False, error='filename not present'), 400

    if 'algosToRun' not in request.form or not request.form.get('algosToRun'):
        return jsonify(success=False, error='algos to run empty or not present'), 400
    else:
        algos = json.loads(request.form.get('algosToRun'))
        print(algos)

    if 'dataSetName' not in request.form or not request.form.get('dataSetName'):
        return jsonify(success=False, error='dataSetName empty or not present'), 400
    else:
        dataSetName = request.form.get('dataSetName')
        print(dataSetName)

    if file and allowed_file(fileName):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify(success=True), 200
    else:
        return jsonify(success=False, error='file not valid'), 400


@app.route('/algo', methods=['GET'])
def get_algo():
    return jsonify(success=True, algos=ALLOWED_ALGOS), 200


if __name__ == '__main__':
    app.run(debug=True)
