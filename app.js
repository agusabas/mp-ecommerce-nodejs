var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const axios = require('axios');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array()); 

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
  var pageTitle = 'Pagar la Compra';
  var params = {
    pageTitle,
    ...req.query,
    publicKey: TEST_USER_VENDEDOR.publicKey,
    email: TEST_USER_COMPRADOR.email
  };
  res.render('checkout', params);
});

app.post('/procesar_pago', function (req, res) {
  var body = req.body;
  // var payment = {
  //   token: body.token,
  //   installments: body.installments,
  //   transaction_amount: body.transaction_amount,
  //   description: body.description,
  //   payment_method_id: body.payment_method_id,
  //   payer: {
  //     email: TEST_USER_COMPRADOR.email,
  //     identification: {
  //       number: body.docNumber,
  //       type: body.docType
  //     }
  //   }
  // };
  res.send(body);
});

app.get('/test', (req, res) => {
  const url = `https://api.mercadopago.com/v1/payment_methods?access_token=${TEST_USER_VENDEDOR.accessToken}`;
  axios.get(url).then(r => {
    console.log(r);
    res.send(r.data);
  }).catch(e => {
    res.status(400).send(e);
  });
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('app running');
  // console.log(mercadopago.payment);
});