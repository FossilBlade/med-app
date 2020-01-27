from flask import Flask, redirect, request, jsonify, send_file
from flask_awscognito import AWSCognitoAuthentication
from flask_awscognito.exceptions import TokenVerifyError

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
from email_manager import send_mail, send_mail_error, send_mail_support
from zipfile import ZipFile

log = logging.getLogger(__name__)
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ZIP_FOLDER'] = ZIP_FOLDER
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


def isAdmin(user_groups):
    if user_groups and len(user_groups) > 0 and AWS_COGNITO_ADMIN_GRP_NAME in user_groups:
        return True
    else:
        return False


def move_dcm_nii_files(extracted_dir_name, final_path):
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


@app.route('/verifytoken')
@aws_auth.authentication_required
def verify_toekn():
    return jsonify(success=True), 200


@app.route('/')
@aws_auth.authentication_required
def index():
    claims = aws_auth.claims  # also available through g.cognito_claims
    return jsonify({'claims': claims})


@app.route('/aws')
def get_access_token():
    access_token = aws_auth.get_access_token(request.args)
    user_data = get_cognito_user_detail(access_token)
    email = user_data.get('email')

    #### This is being done so that claims is set in teh aws_auth
    try:
        aws_auth.token_service.verify(access_token)
    except TokenVerifyError as e:
        return jsonify(success=False, error=str(e)), 401
    claims = aws_auth.token_service.claims
    user_groups = claims.get('cognito:groups') if claims else None

    return jsonify(success=True, access_token=access_token, email=email,
                   user_is_admin=isAdmin(user_groups)), 200


@app.route('/login')
def sign_in():
    # aws_auth.redirect_url = request.args.get('redirectUrl')
    return redirect(aws_auth.get_sign_in_url())


@app.route('/profile', methods=['GET'])
@aws_auth.authentication_required
def get_profile():
    access_token = request.headers.get('Authorization').split()[-1]
    user_data = get_cognito_user_detail(access_token)
    return jsonify(success=True, user_data=user_data), 200


@app.route('/supemail', methods=['POST'])
@aws_auth.authentication_required
def send_supp_email():
    req_data = request.get_json(force=True)

    user = request.headers.get('User')
    subject = req_data.get('subject')
    msg = req_data.get('msg')

    if user is None:
        return jsonify(success=False, error='user not supplied'), 400

    if subject is None:
        return jsonify(success=False, error='subject not supplied'), 400

    if msg is None:
        return jsonify(success=False, error='msg not supplied'), 400

    send_mail_support(user,subject, msg)

    return jsonify(success=True, error='mail sent'), 200




@app.route('/initupload', methods=['GET'])
@aws_auth.authentication_required
def get_algo():
    tnc = ""

    with open('TERMS_AND_CONDITION.txt', 'r', encoding="utf8"
              ) as f:
        tnc = f.read()

    return jsonify(success=True, algos=list(ALLOWED_ALGOS.keys()), tnc=tnc), 200


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
                        if 'result.json' in images[2]:
                            with open(os.path.join(x[0], ds, 'output', algo, 'result.json')) as json_file:
                                list_img = json.load(json_file)
                            # list_img = json.load(os.path.join(x[0], ds, 'output', algo,'result.json'))
                        else:
                            res = sorted(images[2])
                            list_img = [{'img': img, 'ans': None} for img in res if img != 'result.json']

                        data[ds].update({algo: list_img})
                        break
        break

    log.info(data)

    return jsonify(success=True, data=data), 200


@app.route('/alldataset', methods=['GET'])
@aws_auth.authentication_required
def get_all_dataset_algo():
    claims = aws_auth.claims
    user_groups = claims.get('cognito:groups') if claims else None
    if not isAdmin(user_groups):
        return jsonify(success=False, error='user is not an admin'), 400

    users = []
    for user in os.listdir(app.config['UPLOAD_FOLDER']):
        users.append(user)

    final_data = {}
    for user in users:
        data = {}
        final_data.update({user: data})
        scan_path = os.path.join(app.config['UPLOAD_FOLDER'], user)
        for x in os.walk(scan_path):
            for ds in x[1]:
                data[ds] = {}
                for algos in os.walk(os.path.join(x[0], ds, 'output')):
                    for algo in algos[1]:
                        for images in os.walk(os.path.join(x[0], ds, 'output', algo)):
                            if 'result.json' in images[2]:
                                with open(os.path.join(x[0], ds, 'output', algo, 'result.json')) as json_file:
                                    list_img = json.load(json_file)
                            else:
                                res = sorted(images[2])
                                list_img = [{'img': img, 'ans': None} for img in res if img != 'result.json']

                            data[ds].update({algo: list_img})
                            break
            break

    log.info(final_data)

    return jsonify(success=True, data=final_data), 200


@app.route('/download', methods=['GET'])
@aws_auth.authentication_required
def download():
    claims = aws_auth.claims
    user_groups = claims.get('cognito:groups') if claims else None

    if not isAdmin(user_groups):
        return jsonify(success=False, error='user is not an admin'), 400

    if request.args.get('user') is None:
        return jsonify(success=False, error='sser not supplied'), 400

    if request.args.get('algo') is None:
        return jsonify(success=False, error='algo empty or not present'), 400

    if request.args.get('dataset') is None:
        return jsonify(success=False, error='dataset empty or not present'), 400

    user = request.args.get('user')
    algo = request.args.get('algo')
    dataset = request.args.get('dataset')

    zip_path = os.path.join(app.config['ZIP_FOLDER'], '{}_{}_{}.zip'.format(user, dataset, algo))
    os.makedirs(app.config['ZIP_FOLDER'], exist_ok=True)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataset, 'output', algo)

    with ZipFile(zip_path, 'w') as zipObj:
        # Iterate over all the files in directory
        for folderName, subfolders, filenames in os.walk(file_path):
            for filename in filenames:
                filePath = os.path.join(folderName, filename)
                zipObj.write(filePath, filename)

    file_exists = os.path.exists(zip_path)

    if file_exists:
        return send_file(zip_path,
                         mimetype='application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip',
                         attachment_filename='{}_{}_{}.zip'.format(user, dataset, algo),
                         as_attachment=True)
    else:
        return jsonify(success=False, error="file not found"), 404


@app.route('/ans', methods=['POST'])
@aws_auth.authentication_required
def save_ans():
    req_data = request.get_json(force=True)

    if request.headers.get('User') is None:
        return jsonify(success=False, error='User not supplied'), 400

    if req_data.get('dataset') is None:
        return jsonify(success=False, error='dataset not supplied'), 400

    if req_data.get('algo') is None:
        return jsonify(success=False, error='algo not supplied'), 400

    if req_data.get('data') is None:
        return jsonify(success=False, error='data not supplied'), 400

    user = request.headers.get('User')
    dataset = req_data.get('dataset')
    algo = req_data.get('algo')
    data = req_data.get('data')

    result_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataset, 'output', algo, 'result.json')

    with open(result_path, 'w') as outfile:
        json.dump(data, outfile, indent=2)

    return jsonify(success=True, data='saved successfully'), 200


@app.route('/image', methods=['GET'])
def get_images():
    if not AWS_COGNITO_TESTING:
        if 'token' not in request.args or request.args.get('token') is None:
            return jsonify(success=False, error='User not supplied'), 400
        else:
            access_token = request.args.get('token')
            try:
                aws_auth.token_service.verify(access_token)
            except TokenVerifyError as e:
                return jsonify(success=False, error=str(e)), 401

    if request.args.get('user') is None:
        return jsonify(success=False, error='User not supplied'), 400

    if request.args.get('algo') is None:
        return jsonify(success=False, error='algo empty or not present'), 400

    if request.args.get('dataset') is None:
        return jsonify(success=False, error='dataset empty or not present'), 400

    if request.args.get('img') is None:
        return jsonify(success=False, error='img empty or not present'), 400

    user = request.args.get('user')
    algo = request.args.get('algo')
    dataset = request.args.get('dataset')
    img = request.args.get('img')

    img_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataset, 'output', algo, img)

    print(img_path)

    return send_file(img_path, mimetype='image/gif')

@app.route('/upload', methods=['POST'])
@aws_auth.authentication_required
def upload_file_and_run():
    algos = []
    dataset = None

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

    if not request.form.get('algosToRun'):
        return jsonify(success=False, error='algos to run empty or not present'), 400
    else:
        algos = json.loads(request.form.get('algosToRun'))
        print(algos)

    if not request.form.get('dataset'):
        return jsonify(success=False, error='dataset empty or not present'), 400
    else:
        dataset = request.form.get('dataset')
        print(dataset)

    if not request.form.get('gamma'):
        return jsonify(success=False, error='gamma empty or not present'), 400
    else:
        gamma = request.form.get('gamma')
        print(dataset)

    if not request.form.get('confidence'):
        return jsonify(success=False, error='confidence empty or not present'), 400
    else:
        confidence = request.form.get('confidence')
        print(dataset)

    if file and allowed_file(fileName):
        filename = secure_filename(file.filename)
        zip_save_path = os.path.join(app.config['UPLOAD_FOLDER'], user, dataset, filename)
        os.makedirs(os.path.dirname(zip_save_path), exist_ok=True)
        file.save(zip_save_path)
    else:
        return jsonify(success=False, error='file not valid'), 400

    job = (group(
        run_docker.s(user, dataset, algo,confidence,gamma, zip_save_path) for algo in algos

    ) | send_email.s(user, dataset))

    job.apply_async()

    return jsonify(success=True), 200


@celery.task
def run_docker(username, data_set_name, algo,confidence,gamma, zip_file_path):
    log.info('Input Received: {}, {}, {}, {}'.format(username, data_set_name, algo,confidence,gamma, zip_file_path))
    algo_data = ALLOWED_ALGOS.get(algo)
    docker_img_name = algo_data.get('docker_image_name')
    docker_template = algo_data.get('docker_run_template')
    zip_base_path = os.path.dirname(zip_file_path)
    zip_extracted = os.path.join(zip_base_path, 'extracted',algo)
    zip_extracted_temp = os.path.join(zip_base_path, 'extracted_temp',algo)
    output_path = os.path.join(zip_base_path, 'output', algo)
    os.makedirs(zip_extracted, exist_ok=True)
    os.makedirs(output_path, exist_ok=True)
    os.makedirs(zip_extracted_temp, exist_ok=True)

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(zip_extracted_temp)

    try:
        move_dcm_nii_files(zip_extracted_temp, zip_extracted)
    except Exception as e:
        return 'ERROR: ' + str(e)

    dok_comd = docker_template.format(gamma,confidence,os.path.abspath(zip_extracted), os.path.abspath(output_path), docker_img_name)
    log.info(dok_comd)

    try:
        output = subprocess.check_output(
            dok_comd, stderr=subprocess.STDOUT, shell=True,
            universal_newlines=True)
    except subprocess.CalledProcessError as exc:
        output = "ERROR: {} - {}".format(exc.returncode, exc.output)
    else:
        print("Output: \n{}\n".format(output))

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
                return

    log.info('Data is ready for: ' + username + " " + data_set_name)
    if not isError:
        send_mail(username, data_set_name)
    else:
        log.error('ERROR WITH GENERATING DATA. PLEASE REFER THE LOGS.')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
