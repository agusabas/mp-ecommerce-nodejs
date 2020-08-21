var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const axios = require('axios');
const url = require('url');

var mercadopago = require('mercadopago');
const { query } = require('express');
const APP_URL = 'https://felipe-mp-ecommerce-nodejs.herokuapp.com/';
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
  'access_token': TEST_USER_VENDEDOR.accessToken,
  'integrator_id': INTEGRATOR_ID
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
  if (body) {
    if (Object.hasOwnProperty.call(body,'installments') && body.installments > 6) {
      var queryParams = {
        img: body.img,
        title: body.title,
        price: body.price,
        unit: 1
      };
      res.redirect(url.format({
        pathname: '/checkout',
        query: queryParams
      }));
    }
  }

  var payment = {
    token: body.token,
    description: body.description,
    transaction_amount: body.transaction_amount,
    payment_method_id: body.payment_method_id,
    payer: {
      email: TEST_USER_COMPRADOR.email,
      identification: {
        type: body.docType,
        number: body.docNumber
      }
    }
  };
  mercadopago.payment.create({...payment}).then((response) => {
    console.log('successfull payment');
    console.log(response);
    res.send({response, payment})
  }).catch(e => {
    console.error('failure payment');
    console.error(e);
    res.status(400);
    res.send(e);
  })
  // res.send({body, payment});
});

// app.post('/procesar_pago', function (req, res) {
//   var body = req.body;
//   if (body) {
//     if (Object.hasOwnProperty.call(body,'installments') && body.installments > 6) {
//       var queryParams = {
//         img: body.img,
//         title: body.title,
//         price: body.price,
//         unit: 1
//       };
//       res.redirect(url.format({
//         pathname: '/checkout',
//         query: queryParams
//       }));
//     }
//   }
//   var payment = {
//     "token": body.token,
//     "installments": body.installments,
//     "transaction_amount": body.transaction_amount,
//     "description": body.description,
//     "payment_method_id": body.payment_method_id,
//     "payer": {
//       "email": TEST_USER_COMPRADOR.email,
//       "identification": {
//         "number": body.docNumber,
//         "type": body.docType
//       }
//     },
//     "notification_url": `${APP_URL}notificaciones`,
//     "sponsor_id":null,
//     "binary_mode":false,
//     "external_reference": "felipeblan@gmail.com",
//     "statement_descriptor":"MercadoPago",
//     "additional_info": {
//       "items": [
//         {
//           "id": "1234",
//           "title": body.description,
//           "description": "Dispositivo móvil de Tienda e-commerce",
//           "picture_url": body.img,
//           "category_id": "phones",
//           "quantity": 1,
//           "unit_price": body.transaction_amount
//         }
//       ],
//       "payer": {
//         name: "Lalo",
//         surname: "Landa",
//         email: TEST_USER_COMPRADOR.email,
//         phone: {
//           area_code: "11",
//           number: "22223333"
//         },
        
//         identification: {
//           type: body.docType,
//           number: body.docNumber
//         },
//         address: {
//           street_name: "False",
//           street_number: "123",
//           zip_code: "111"
//         }
//       },
//       "back_urls": {
//         "success": `${APP_URL}back_url/success`,
//         "failure": `${APP_URL}back_url/failure`,
//         "pending": `${APP_URL}back_url/pending`
//       },
//       "auto_return": "approved",
//     }
//   };
//   mercadopago.configure({
//     integrator_id: INTEGRATOR_ID
//   });
//   res.send({body, payment});
// });

// app.get('/test', (req, res) => {
//   const url = `https://api.mercadopago.com/v1/payment_methods?access_token=${TEST_USER_VENDEDOR.accessToken}`;
//   const headers = {
//     'x-integrator-id': INTEGRATOR_ID
//   };
//   axios.get(url, headers).then(r => {
//     console.log(r);
//     res.send(r.data);
//   }).catch(e => {
//     res.status(400).send(e);
//   });
// });

//Backurls view
app.get('/back_url/:type', (req, res) => {
  var queryParams = req.query;
  var types = ['failure','pending', 'success'];
  if (!types.includes(req.params.type)) {
    res.redirect('/');
    return;
  }
  // if (Object.values(queryParams).length <= 0) {
  //   res.redirect('/');
  //   return;
  // }
  var response = {
    "pageTitle": req.params.type.toUpperCase(),
    "collection_id": queryParams.collection_id,
    "collection_status": queryParams.collection_id,
    "external_reference": queryParams.external_reference,
    "payment_type": queryParams.payment_type,
    "preference_id": queryParams.preference_id,
    "site_id": queryParams.site_id,
    "processing_mode": queryParams.processing_mode,
    "merchant_account_id": queryParams.merchant_account_id,
  };
  res.render('backUrl', response);
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('app running');
  // console.log(mercadopago.payment);
});