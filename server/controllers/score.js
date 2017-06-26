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
  hostname: 'riskarma.com',
  port: '80',
  path: '/',
  method: 'GET'
};


exports.scoreAllHotels = (req, res, next) => {
  Promise.all(usHotels)
  .then(hotels => {
    hotels.forEach(hotel => {
      let address = hotel.addressline1 + ',' + hotel.zipcode + ',' + 'US';
      address.replace(/ /g,'+');
      gmapOptions.path = '/maps/api/geocode/json' + '?address=' + encodeURI(address) + apiKey;

      https.get(gmapOptions, (res) => {

        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if(statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if(error) {
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);

            if(parsedData && parsedData.results && parsedData.results.length > 0) {
                rkOptions.path = '/api/score/cr/'
                  + parsedData.results[0].geometry.location.lat
                  + '/'
                  + parsedData.results[0].geometry.location.lng;

                http.get(rkOptions, (res) => {

                  const { statusCode } = res;
                  const contentType = res.headers['content-type'];

                  let error;
                  if(statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                                      `Status Code: ${statusCode}`);
                  }
                  if(error) {
                    console.error(error.message);
                    res.resume();
                    return;
                  }

                  res.setEncoding('utf8');
                  let rawData = '';
                  res.on('data', (chunk) => { rawData += chunk; });
                  res.on('end', () => {
                    try {
                      const scoreData = JSON.parse(rawData);
                      const geometry = {
                        location: {
                          lat: parsedData.results[0].geometry.location.lat,
                          lng: parsedData.results[0].geometry.location.lng
                        }
                      };

                      hotel['geometry'] = geometry;
                      hotel['score'] = scoreData.score;
                      console.log(hotel + ',');

                    } catch(e) {
                      console.error(e.message);
                    }
                  });
                }).on('error', (e) => {
                  console.error(`Got error: ${e.message}`);
                });
              }
              else {
                console.log(hotel + ',');
              }
          } catch(e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
    });
  })
  .then(hotels => res.render('score/main') )
  .catch(e => next(e));




  // Promise.all(ukHotels)
  // .then(hotels => {
  //   hotels.forEach(hotel => {
  //     let address = hotel.addressline1 + ',' + hotel.zipcode + ',' + 'US';
  //     address.replace(/ /g,'+');
  //     gmapOptions.path = '/maps/api/geocode/json' + '?address=' + encodeURI(address) + apiKey;
  //
  //     https.get(gmapOptions, (res) => {
  //
  //       const { statusCode } = res;
  //       const contentType = res.headers['content-type'];
  //
  //       let error;
  //       if(statusCode !== 200) {
  //         error = new Error('Request Failed.\n' +
  //                           `Status Code: ${statusCode}`);
  //       } else if (!/^application\/json/.test(contentType)) {
  //         error = new Error('Invalid content-type.\n' +
  //                           `Expected application/json but received ${contentType}`);
  //       }
  //       if(error) {
  //         console.error(error.message);
  //         // consume response data to free up memory
  //         res.resume();
  //         return;
  //       }
  //
  //       res.setEncoding('utf8');
  //       let rawData = '';
  //       res.on('data', (chunk) => { rawData += chunk; });
  //       res.on('end', () => {
  //         try {
  //           const parsedData = JSON.parse(rawData);
  //
  //             rkOptions.path = '/api/score/cr/'
  //               + parsedData.results[0].geometry.location.lat
  //               + '/'
  //               + parsedData.results[0].geometry.location.lng;
  //
  //             http.get(rkOptions, (res) => {
  //
  //               const { statusCode } = res;
  //               const contentType = res.headers['content-type'];
  //
  //               let error;
  //               if(statusCode !== 200) {
  //                 error = new Error('Request Failed.\n' +
  //                                   `Status Code: ${statusCode}`);
  //               }
  //               if(error) {
  //                 console.error(error.message);
  //                 res.resume();
  //                 return;
  //               }
  //
  //               res.setEncoding('utf8');
  //               let rawData = '';
  //               res.on('data', (chunk) => { rawData += chunk; });
  //               res.on('end', () => {
  //                 try {
  //                   const scoreData = JSON.parse(rawData);
  //                   const geometry = {
  //                     location: {
  //                       lat: parsedData.results[0].geometry.location.lat,
  //                       lng: parsedData.results[0].geometry.location.lng
  //                     }
  //                   };
  //
  //                   hotel['geometry'] = geometry;
  //                   hotel['score'] = scoreData.score;
  //                   console.log(hotel);
  //
  //                 } catch(e) {
  //                   console.error(e.message);
  //                 }
  //               });
  //             }).on('error', (e) => {
  //               console.error(`Got error: ${e.message}`);
  //             });
  //
  //         } catch(e) {
  //           console.error(e.message);
  //         }
  //       });
  //     }).on('error', (e) => {
  //       console.error(`Got error: ${e.message}`);
  //     });
  //   });
  // })
  // .then(hotels => res.render('score/main') )
  // .catch(e => next(e));
};
