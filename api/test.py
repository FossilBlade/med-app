from config import AWS_COGNITO_USER_POOL_CLIENT_ID, AWS_COGNITO_USER_POOL_ID

from hashlib import md5
print(md5(f"{AWS_COGNITO_USER_POOL_CLIENT_ID}:{AWS_COGNITO_USER_POOL_ID}".encode("utf-8")).hexdigest())