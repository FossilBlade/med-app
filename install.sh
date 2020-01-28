sudo add-apt-repository -y ppa:certbot/certbot
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt -y update && apt-get install -y python3 python3-dev python3-venv python-certbot-nginx install build-essential nodejs


rm -rf /appl/demo-app-api
rm -rf /etc/systemd/system/api.service /etc/systemd/system/celery.service
mkdir -p /appl/demo-app-api
cp -r api/* /appl/demo-app-api/
python3 -m venv /appl/demo-app-api/venv
/appl/demo-app-api/venv/bin/pip install -r /appl/demo-app-api/requirements.txt
cp api.service /etc/systemd/system/api.service 
cp celery.service /etc/systemd/system/celery.service

cd app-ui && npm install
ng --prod build
cp -r dist/app-ui/* /var/www/html
cd ..


sudo mv /etc/nginx/sites-available/default /etc/nginx/default.bck 
sudo cp nginx-no-ssl.conf /etc/nginx/sites-available/default

sudo systemctl enable nginx
sudo systemctl enable api
sudo systemctl enable celerey

sudo systemctl start nginx
sudo systemctl start api
sudo systemctl start celerey