Como criar um server:
(os comandos no terminal estão escritos com >> antes)

pode ser criado na pasta antes dos repos:
>> yarn add json-server

Confirma que esta bem instalado:
>> json-server --version
Resposta: 0.17.0

>>json-server --watch db_stores.json
//A porta pre-definida é a 3000

se quiseres criar vários, abre outro terminal e define a porta a usar:
>>json-server -p 3001 --watch db_clients.json


Na directoria onde fizemos o "add json-server", colocar os db_clients.json e db.json


