# Deployment

## Build
```bash
npm ci
npm run build
```

## Nginx /blues/
```nginx
location /blues/ {
  alias /var/www/blues/;
  try_files $uri $uri/ /blues/index.html;
}
```

## Publish static files
```bash
sudo mkdir -p /var/www/blues
sudo rsync -av --delete dist/ /var/www/blues/
sudo nginx -t && sudo systemctl reload nginx
```
