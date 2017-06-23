'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const usHotels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/us-hotels.json'), 'utf-8'));
const ukHotels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/uk-hotels.json'), 'utf-8'));

const apiKey = '&key=AIzaSyCb7q6ZEQc0V--BoG8scGYGs6-k_Whfn9Q';
let options = {
  hostname: 'maps.googleapis.com',
  port: 443,
  path: '/',
  method: 'GET'
};

exports.scoreAllHotels = (req, res, next) => {
  Promise.all(usHotels)
  .then(hotels => {
    hotels.forEach(hotel => {
      let address = hotel.addressline1 + ',' + hotel.zipcode + ',' + 'US';
      address.replace(/ /g,'+');
      options.path = '/maps/api/geocode/json' + '?address=' + encodeURI(address) + apiKey;

      console.log(options.path);
      let req = https.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      res.on('data', (d) => {
        process.stdout.write(d.results);
        //process.stdout.write(d.results.length ? d.results[0].geometry.location.lat + ':' + d.results[0].geometry.location.lng : 'not found');
        //process.stdout.write(d);
        //console.log(d[0].geometry.location.lgn);
      });
    });

    req.on('error', (e) => {
      console.error(e);
    });
    req.end();

    });
    return hotels;
  })
  .then(hotels => res.render('score/main') )
  .catch(e => next(e));
};
