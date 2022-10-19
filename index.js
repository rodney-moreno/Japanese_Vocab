const http = require('http');
const Hogan = require('hogan.js');
const hostname = 'localhost';
const port = process.env.PORT || '8080';

let front_card_template = Hogan.compile('<html><head><meta charset="utf-8" name="viewport" content="width=device-width" initial-scale=1.0><style>body{margin-top: 100px; background-color: #ADD8e6;}#button{text-align: center; max-width: 500px; height: 250px; margin-left: auto; margin-right: auto; margin-top: 20px;}#cardDiv{max-width: 500px; height: 250px; margin-left: auto; margin-right: auto; display: flex; border: 8px solid #021691; justify-content: center; align-items: center; border-radius: 25px; font-family:"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro",Osaka, "メイリオ", Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif; font-size: 50px;}p{color: #021691;}#flip{background-color: #021691; color:#ADD8e6; font-size: 30px; padding: 15px 32px; text-align: center; border: none; border-radius: 12px;}</style></head><body><div id="cardDiv"><p>{{kanji}}</p></div><div id="button"><button id="flip" onclick="location.href=`./back/{{kanji}}`;">Flip</button></div></body></html>');
let back_card_template = Hogan.compile('<html><head><meta charset="utf-8"></head><body>{{#meaning.length}}{{#meaning}}<p>{{.}}</p>{{/meaning}}{{/meaning.length}}{{^meaning.length}}<p>{{meaning}}</p>{{/meaning.length}}<button onclick="location.href=`./../front`;">Next Card</button></body></html>');

const server = http.createServer((request, response) => {

  // set the response headers
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Access-Control-Allow-Origin' , '*');

  let url = `.${request.url}`;
  
  // Call end on the response
  if(url === "./front") {
    console.log("Front")
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