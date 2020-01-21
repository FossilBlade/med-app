from flask import Flask, redirect, request, jsonify, send_file
from flask_awscognito import AWSCognitoAuthentication
from config import *
import os
import logging
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
import requests
from hashlib import md5
from celery import Celery, group
import zipfile
import subprocess
from email_manager import send_mail, send_mail_error
import glob

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
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
app.config['TESTING'] = AWS_COGNITO_TESTING

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

aws_auth = AWSCognitoAuthentication(app)
CORS(app, origins="*", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials", "User"],
     supports_credentials=True)

DCM_NII_FILE_NOT_FOUND_MSG = '.dcm or .nii file not found in zip'


def move__dcm_nii_files(extracted_dir_name, final_path):
    file = None

    for dirpath, dirnames, filenames in os.walk(extracted_dir_name):
        for filename in [f for f in filenames if f.endswith(".dcm") or f.endswith(".nii")]:
            file = os.path.join(dirpath, filename)
            break;
        if file:
            break;

    if not file:
        raise Exception(DCM_NII_FILE_NOT_FOUND_MSG)
    else:
        parent_path = os.path.dirname(file)
        subprocess.call("mv {}/* {}/".format(parent_path, final_path), shell=True)


def get_cognito_user_detail(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f'https://{AWS_COGNITO_DOMAIN}/oauth2/userInfo'
    respon = requests.get(url, headers=headers)
    return respon.json()


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


#
#
# def get_user(request_args):


@app.route('/')
@aws_auth.authentication_required
def index():
    claims = aws_auth.claims  # also available through g.cognito_claims

    return jsonify({'claims': claims})


@app.route('/aws')
def aws_cognito_redirect():
    access_token = aws_auth.get_access_token(request.args)
    user = get_cognito_user_detail(access_token)
    return jsonify(access_token=access_token, email=user.get('email')), 200


@app.route('/login')
def sign_in():
    aws_auth.redirect_url = request.args.get('redirectUrl')
    return redirect(aws_auth.get_sign_in_url())


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
        zip_save_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataSetName, filename)
        os.makedirs(os.path.dirname(zip_save_path), exist_ok=True)
        file.save(zip_save_path)
    else:
        return jsonify(success=False, error='file not valid'), 400

    job = (group(
        run_docker.s(user, dataSetName, algo, zip_save_path) for algo in algos

    ) | send_email.s(user, dataSetName))

    job.apply_async()

    return jsonify(success=True), 200


@app.route('/algo', methods=['GET'])
@aws_auth.authentication_required
def get_algo():
    return jsonify(success=True, algos=list(ALLOWED_ALGOS.keys())), 200


@app.route('/dataset', methods=['GET'])
@aws_auth.authentication_required
def get_dataset_algo():
    if 'User' not in request.headers or request.headers.get('User') is None:
        return jsonify(success=False, error='User not supplied'), 400
    user = request.headers.get('User')
    data = {}
    scan_path = os.path.join(app.config['UPLOAD_FOLDER'], user)
    for x in os.walk(scan_path):
        for ds in x[1]:
            data[ds] = {}
            # algo_img_data = {}
            for algos in os.walk(os.path.join(x[0], ds, 'output')):
                for algo in algos[1]:
                    for images in os.walk(os.path.join(x[0], ds, 'output', algo)):
                        list_img = [img for img in images[2]]
                        data[ds].update({algo: list_img})
                        break
        break

    log.info(data)

    return jsonify(success=True, data=data), 200


@app.route('/image', methods=['GET'])
# @aws_auth.authentication_required
def get_images():
    if 'user' not in request.args or request.args.get('user') is None:
        return jsonify(success=False, error='User not supplied'), 400

    if 'algo' not in request.args or not request.args.get('algo'):
        return jsonify(success=False, error='algo empty or not present'), 400

    if 'dataSetName' not in request.args or not request.args.get('dataSetName'):
        return jsonify(success=False, error='dataSetName empty or not present'), 400

    if 'img' not in request.args or not request.args.get('img'):
        return jsonify(success=False, error='img empty or not present'), 400

    user = request.args.get('user')
    algo = request.args.get('algo')
    dataSetName = request.args.get('dataSetName')
    img = request.args.get('img')

    img_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataSetName, 'output', algo, img)

    print(img_path)

    return send_file(img_path, mimetype='image/gif')


@celery.task
def run_docker(username, data_set_name, algo, zip_file_path):
    log.info('Input Received: {}, {}, {}, {}'.format(username, data_set_name, algo, zip_file_path))
    algo_data = ALLOWED_ALGOS.get(algo)
    docker_img_name = algo_data.get('docker_image_name')
    docker_template = algo_data.get('docker_run_template')
    zip_base_path = os.path.dirname(zip_file_path)
    zip_extracted = os.path.join(zip_base_path, 'extracted')
    zip_extracted_temp = os.path.join(zip_base_path, 'extracted_temp')
    output_path = os.path.join(zip_base_path, 'output', algo)
    os.makedirs(zip_extracted, exist_ok=True)
    os.makedirs(output_path, exist_ok=True)
    os.makedirs(zip_extracted_temp, exist_ok=True)

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(zip_extracted_temp)

    try:
        move__dcm_nii_files(zip_extracted_temp, zip_extracted)
    except Exception as e:
        return 'ERROR: ' + str(e)

    dok_comd = docker_template.format(os.path.abspath(zip_extracted), os.path.abspath(output_path), docker_img_name)
    log.info(dok_comd)
    com_output = subprocess.run([dok_comd],
                                shell=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output = None

    if com_output.stdout:
        output = com_output.stdout.decode('utf-8')
    if com_output.stderr:
        output = 'ERROR: ' + com_output.stderr.decode('utf-8')
        log.error(output)
    return output


@celery.task
def send_email(outputs, username, data_set_name):
    log.info('Input Received for: {}, {}'.format(username, data_set_name))
    isError = False
    for idx, output in enumerate(outputs):

        log.info('Output {} : {}'.format(idx, output))
        if output.startswith('ERROR'):
            isError = True
            if DCM_NII_FILE_NOT_FOUND_MSG in output:
                send_mail_error(username, data_set_name, DCM_NII_FILE_NOT_FOUND_MSG)

    log.info('Data is ready for: ' + username + " " + data_set_name)
    if not isError:
        send_mail(username, data_set_name)
    else:
        log.error('ERROR WITH GENERATING DATA. PLEASE REFER THE LOGS.')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
