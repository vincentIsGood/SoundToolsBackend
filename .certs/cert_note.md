```sh
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout domain.key -out domain.crt -subj '/CN=example.com' \
  -addext 'subjectAltName=DNS:example.com,DNS:example.net'
```