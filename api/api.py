from flask import Flask, redirect, request, jsonify, flash
from flask_awscognito import AWSCognitoAuthentication
from config import *
import os
import logging
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
import requests
from hashlib import md5

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


@app.route('/aws')
def aws_cognito_redirect():
    args = {}
    if not request.args.get('code'):
        return jsonify(success=False, error='no code present'), 400
    if not request.args.get('state'):
        args.update(
            {'state': md5(f"{AWS_COGNITO_USER_POOL_CLIENT_ID}:{AWS_COGNITO_USER_POOL_ID}".encode("utf-8")).hexdigest()})

    args.update({'code': request.args.get('code')})
    access_token = aws_auth.get_access_token(args)
    user = get_cognito_user_detail(access_token)
    return jsonify(access_token=access_token, email=user.get('email')), 200


@app.route('/login')
def sign_in():
    aws_auth.redirect_url = request.args.get('redirectUrl')
    return redirect(aws_auth.get_sign_in_url())


def get_cognito_user_detail(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f'https://{AWS_COGNITO_DOMAIN}/oauth2/userInfo'
    respon = requests.get(url, headers=headers)
    return respon.json()


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
@aws_auth.authentication_required
def upload_file_and_run():
    algos = []
    dataSetName = None

    print(request.files)
    print(request.form)
    if 'file' not in request.files:
        return jsonify(success=False, error='file not present'), 400

    if 'User' not in request.headers or request.headers.get('User') is None:
        return jsonify(success=False, error='User not supplied'), 400

    user = request.headers.get('User')

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
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataSetName, filename)
        os.makedirs(save_path,exist_ok=True)
        file.save(save_path)
        return jsonify(success=True), 200
    else:
        return jsonify(success=False, error='file not valid'), 400


@app.route('/algo', methods=['GET'])
@aws_auth.authentication_required
def get_algo():
    return jsonify(success=True, algos=ALLOWED_ALGOS), 200


if __name__ == '__main__':
    app.run(debug=True)
