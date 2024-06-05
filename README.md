For at køre projektet skal man først skrive npm i.
Hvis den går igennem skal man oprette en .env fil.
Efter oprettelsen af .env skal man kopier det her ind

DB_HOSTNAME = 127.0.0.1

DB_PORT = 

DB_USER = root

DB_PASSWORD = 

DB_NAME = Jobsite

DB_CONNECTIONLIMIT = 100

TOKEN_SECRET = ""

FACEBOOK_clientID = ""

FACEBOOK_clientSecret = ""

GOOGLE_clientID = ""

GOOGLE_clientSecret = ""

ACCESS_TOKEN = ""

MAILTRAP_HOST = sandbox.smtp.mailtrap.io

MAILTRAP_PORT = 2525

MAILTRAP_USER = ""

MAILTRAP_PASS = ""

Værdier der ikke er udfyldt skal udfyldes med egen information. Eksempelvis
Ens google og facebook clientID og clientSecret fra facebook developer og google developer console
Derefter skal man lave en jwtsecret til TOKEN_SECRET og opret en hemmelig ACCESS_TOKEN, 
som også skal sættes i frontend af projektet. Til sidste skal man udfylde mailtrap oplysninger med 
sine egne informationer inde fra mailtrap.io, som er gratis at bruge.
