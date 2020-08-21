var express = require('express');
var exphbs  = require('express-handlebars');

var mercadopago = require('mercadopago');

const INTEGRATOR_ID = "dev_24c65fb163bf11ea96500242ac130004";
const TEST_USER_VENDEDOR = {
  "collectorId": 469485398,
  "publicKey": "APP_USR-7eb0138a-189f-4bec-87d1-c0504ead5626",
  "accessToken": "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398"
};

const TEST_USER_COMPRADOR = {
  "id": 471923173,
  "email": "test_user_63274575@testuser.com",
  "password": "qatest2417"
};

mercadopago.configure({
  sandbox: true,
  'access_token': TEST_USER_VENDEDOR.accessToken
});

var app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    console.log(req.query);
    res.render('detail', req.query);
});

app.get('/checkout', function (req, res) {
  var params = {
    ...req.query,
    ...TEST_USER_COMPRADOR,
    ...TEST_USER_VENDEDOR
  };
  res.render('checkout', params);
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('app running');
  console.log(mercadopago.payment);
});