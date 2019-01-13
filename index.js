const express = require('express');
const Jimp = require('jimp');
const fs = require('fs');
const util = require('util');

const app = express();

const PORT = process.env.PORT || 3000;

function getRequestedImageSize(req) {
  const width = parseInt(req.params.width, 10) || 300;
  const height = parseInt(req.params.height, 10) || 300;
  return {
    width,
    height
  };
}

function getRandomImageFileName() {
  const i = Math.floor(Math.random() * 11) + 1;
  return `${__dirname}/images/${i}.jpg`;
}

function checkSizes(width, height) {
  if (parseFloat(width) < 1 || parseFloat(height) < 1) {
    throw 'Bad Request';
  } else if (width > 3500 || height > 3500) {
    throw 'Too Large';
  }
}

async function saveImage(width, height, buffer) {
  await util.promisify(fs.writeFile)(`/tmp/${width}x${height}.jpg`, buffer);
}

function getImage(width, height) {
  const path = `/tmp/${width}x${height}.jpg`;
  return fs.existsSync(path) && path || null;
}

app.get('/image/:width/:height', (req, res) => {
  const {
    width,
    height
  } = getRequestedImageSize(req);

  checkSizes(width, height);


  let filename = getImage(width, height);
  if (filename) {
    res.header('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filename);
    return;
  }
  filename = getRandomImageFileName();

  Jimp.read(filename).then(image => {
    return image.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
  }).then(buffer => {
    res.header('Content-Disposition', `inline; filename="${width}x${height}.jpg"`);
    res.header('Cache-Control', 'public, max-age=31536000');
    res.header('Content-Type', 'image/jpeg');
    saveImage(width, height, buffer);
    res.send(buffer);
  }).catch(err => {
    res.send({
      err: 'An unknown error occured.',
    });
  });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
