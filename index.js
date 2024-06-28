require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const bodyParser = require('body-parser')
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let dbUrl = []
let shortCount = 1;

app.post('/api/shorturl' , (req ,res) =>{
  const { url: inputUrl } = req.body;

  try {
    const parsedUrl = new URL(inputUrl);
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, (err, address) => {
      if (err || !address) {
        return res.json({ error: 'invalid url' });
      } else {
        shortCount++;
        dbUrl.push({ original_url: inputUrl , short_url:shortCount });
        return res.json({ original_url: inputUrl , short_url:shortCount });

      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

})

app.get("/api/shorturl/:short_url" , (req ,res) =>{
  const shortUrl = parseInt(req.params.short_url);
  const urlMapping = dbUrl.find(entry => entry.short_url === shortUrl);

  if(urlMapping){
    return res.redirect(urlMapping.original_url);
  } else {
    // Handle case where short URL is not found
    return res.json({ error: 'No short URL found for the given input' });
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
