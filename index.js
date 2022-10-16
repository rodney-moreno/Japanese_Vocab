const http = require('http');
const Hogan = require('hogan.js');
const hostname = '127.0.0.1';
const port = process.env.PORT || '8080';

let front_card_template = Hogan.compile('<html><head><meta charset="utf-8"></head><body><p>{{kanji}}</p><button onclick="location.href=`./back/{{kanji}}`;">Flip</button></body></html>');
let back_card_template = Hogan.compile('<html><head><meta charset="utf-8"></head><body>{{#meaning.length}}{{#meaning}}<p>{{.}}</p>{{/meaning}}{{/meaning.length}}{{^meaning.length}}<p>{{meaning}}</p>{{/meaning.length}}<button onclick="location.href=`./../front`;">Next Card</button></body></html>');

const server = http.createServer((request, response) => {

  // set the response headers
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Access-Control-Allow-Origin' , '*');

  let url = `.${request.url}`;
  
  // Call end on the response
  if(url === "./front") {

    function getAllKanji(res) {
      let charKanji = '';
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
    
      res.on('end', () => {
        allKanji = JSON.parse(rawData);

        let numElements = 0;
        for(let c in allKanji) {
          numElements++;
        }
    
        let i = Math.floor(Math.random() * numElements);
        charKanji = allKanji[i];

        let kanjiData = {
          kanji: charKanji,
        };
  
        let front_card = front_card_template.render(kanjiData);
        response.end(front_card);
      });
    }

    http.get("http://kanjiapi.dev/v1/kanji/all", getAllKanji);

    
  } else if(url.includes("./back")){
    let values = url.split('/');

    function getDefinition(res) {
      let rawData = '';
      let meaningTemplate = []
    
      res.on('data', (chunk) => {
        rawData += chunk;
      });
    
      res.on('end', () => {
        allReadings = JSON.parse(rawData);
        meaningTemplate = allReadings['meanings'];
        
        let data = {
          meaning: meaningTemplate,
        };
    
        let back_card = back_card_template.render(data);
        response.end(back_card);
      });
    }

    http.get("http://kanjiapi.dev/v1/kanji/" + values[2], getDefinition);
  } else {

    response.end();
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})