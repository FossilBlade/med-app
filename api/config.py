# UPLOAD SETTINGS
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'zip'}

# COGNITO SETTINGS
AWS_DEFAULT_REGION= 'eu-west-1'
AWS_COGNITO_DOMAIN= 'domain.com'
AWS_COGNITO_USER_POOL_ID= 'eu-west-1_XXX'
AWS_COGNITO_USER_POOL_CLIENT_ID= 'YYY'
AWS_COGNITO_USER_POOL_CLIENT_SECRET= 'ZZZZ'
AWS_COGNITO_REDIRECT_URL= 'http://localhost:5000/aws_cognito_redirect'


#ALGO CONFIG
ALLOWED_ALGOS = ['Algo D', 'ALGO B']