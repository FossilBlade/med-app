
################
### THESE ARE PROD SETTINGS
################




# UPLOAD SETTINGS
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'zip'}

# EMAIL SETTINGS

sender_email = "no.reply.vg.showapp@gmail.com"
password = "vg_Super@123"

# COGNITO SETTINGS
AWS_DEFAULT_REGION = 'us-east-1'
AWS_COGNITO_DOMAIN = 'auth.vasognosis.com'
AWS_COGNITO_USER_POOL_ID = 'us-east-1_MsSYezvzn'
AWS_COGNITO_USER_POOL_CLIENT_ID = '698cc0ufsvh074rm4ti6ch3cl3'
AWS_COGNITO_USER_POOL_CLIENT_SECRET = '16mbklprm6383lr27sss751kg5jh2ajs617kn0779lggdm23k31l'
AWS_COGNITO_REDIRECT_URL = 'https://demo.vasognosis.com/login'
AWS_COGNITO_TESTING = False

# ALGO CONFIG
ALLOWED_ALGOS = {
    'ResNet100': {'docker_run_template': 'docker run --rm -v "{}:/input" -v "{}:/output" {}',
               'docker_image_name': 'res-net-100'}
   }
