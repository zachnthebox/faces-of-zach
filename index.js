const express = require('express');
const sharp = require('sharp');

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/image/:width/:height', (req, res) => {
  const width = parseInt(req.params.width, 10) || 300;
  const height = parseInt(req.params.height, 10) || 300;

  let image = 'images/1.jpg';

  sharp(image).resize(width, height).toBuffer().then(buffer => {
    res.header('Content-Disposition', 'inline; filename="zach.jpg"');
    res.header('Cache-Control', 'public, max-age=31536000');
    res.header('Content-Type', 'image/jpeg');
    res.send(buffer);
  }).catch(() => {
    res.status(500);
  });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
