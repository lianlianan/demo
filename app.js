'use strict';

const express = require('express');
const path = require('path');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', path.join(__dirname, 'server', 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res, next) => res.render('/index.html') );

const score = require('./server/routes/score');
app.use('/score', score);

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
