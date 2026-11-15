# HTTPS en el servidor de AWS (saesu.duckdns.org)

En local nada cambia: `docker compose up -d --build` sigue usando `nginx.conf` con HTTP.
En el servidor se agrega `docker-compose.https.yml`, que monta `nginx-https.conf`, abre el
puerto 443 y usa un certificado gratuito de Let's Encrypt.

## Una sola vez

1. **AWS → Security group** de la instancia: reglas de entrada **HTTP 80** y **HTTPS 443**
   con origen `0.0.0.0/0`.
2. **DuckDNS**: `saesu.duckdns.org` debe apuntar a la IP pública de la instancia.
3. En el servidor, traer los cambios y sacar el certificado (el frontend se apaga ~1 minuto
   porque certbot necesita el puerto 80):

   ```bash
   cd ~/saesu/FrontEnd
   git pull
   sudo mkdir -p /var/www/certbot
   docker compose down
   docker run --rm -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot \
     certonly --standalone -d saesu.duckdns.org --agree-tos --no-eff-email -m TU_CORREO
   ```

   Debe terminar en `Successfully received certificate`.

4. Dejar activado HTTPS en esta carpeta (así `docker compose` y el CD lo usan siempre):

   ```bash
   echo "COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml" >> .env
   docker compose up -d --build
   ```

5. En el `.env` del backend: `APP_URL=https://saesu.duckdns.org` y `docker compose up -d`.

6. Probar: `https://saesu.duckdns.org` (candado) y `http://saesu.duckdns.org` (redirige a HTTPS).

## Renovación automática

El certificado dura 90 días. Para renovarlo solo, cada lunes a las 3 a. m.:

```bash
sudo crontab -e
```

y agregar esta línea:

```
0 3 * * 1 docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker exec saesu-frontend nginx -s reload
```

## Volver a HTTP

Quitar la línea `COMPOSE_FILE=...` del `.env` de esta carpeta y `docker compose up -d --build`.
