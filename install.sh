sudo add-apt-repository -y ppa:certbot/certbot
sudo curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt -y update && sudo apt-get install -y python3 python3-dev python3-venv python3-pip python-certbot-nginx build-essential
sudo apt-get remove docker docker-engine docker.io
sudo apt install docker.io

sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ubuntu


rm -rf /appl/demo-app-api
sudo rm -rf /etc/systemd/system/api.service /etc/systemd/system/celery.service
sudo mkdir -p /appl/demo-app-api
sudo chown -R ubuntu:ubuntu /appl
cp -r api/* /appl/demo-app-api/
python3 -m venv /appl/demo-app-api/venv
/appl/demo-app-api/venv/bin/pip install -r /appl/demo-app-api/requirements.txt
sudo cp api.service /etc/systemd/system/api.service 
sudo cp celery.service /etc/systemd/system/celery.service

export NG_CLI_ANALYTICS=ci

cd app-ui && npm install
ng --prod build
cp -r dist/app-ui/* /var/www/html
cd ..

docker run --name redis --restart always -p 6379:6379 -d redis

sudo mv /etc/nginx/sites-available/default /etc/nginx/default.bck 
sudo cp nginx-no-ssl.conf /etc/nginx/sites-available/default

sudo systemctl enable nginx
sudo systemctl enable api
sudo systemctl enable celerey

sudo systemctl start nginx
sudo systemctl start api
sudo systemctl start celerey