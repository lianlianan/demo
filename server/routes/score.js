'use strict';

const express = require('express');
const router = express.Router();

const scoreCtrl = require('../controllers/score');

router.get('/', scoreCtrl.scoreAllHotels);

module.exports = router;
