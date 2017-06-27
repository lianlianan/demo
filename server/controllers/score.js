'use strict';

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const usHotels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/us-hotels.json'), 'utf-8'));
const ukHotels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/uk-hotels.json'), 'utf-8'));

const apiKey = '&key=AIzaSyCb7q6ZEQc0V--BoG8scGYGs6-k_Whfn9Q';

let gmapOptions = {
  hostname: 'maps.googleapis.com',
  port: '443',
  path: '/',
  method: 'GET'
};
let rkOptions = {
  hostname: '59.110.228.51', //'riskarma.com',
  port: '80',
  path: '/',
  method: 'GET'
};


exports.scoreAllHotels = (req, res, next) => {
  Promise.all(ukHotels)
  .then(hotels => {
    hotels.forEach(hotel => {

      rkOptions['path'] = '/api/score/cr/'
        + hotel.latitude
        + '/'
        + hotel.longitude;

      http.get(rkOptions, (res) => {

        const { statusCode } = res;

        let error;
        if(statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }
        if(error) {
          //console.error(error.message);
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const scoreData = JSON.parse(rawData);

            hotel['score'] = scoreData.score;
            console.log(JSON.stringify(hotel, null, 2));
            console.log(',');

          } catch(e) {
            //console.error(e.message);
          }
        });
      }).on('error', (e) => {
        //console.error(`Got error: ${e.message}`);
      });
      sleep(1000);
    });
  })
  .then(hotels => res.render('score/main') )
  .catch(e => next(e));





};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
