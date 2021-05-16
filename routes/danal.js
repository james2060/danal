var express = require('express');
var router = express.Router();

  
const danal_controller = require("../controller/danal_controller");
router.get('/api/ready',danal_controller.DanalReady);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  
  module.exports = router;