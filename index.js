const express = require( 'express' );
const paypal = require('paypal-rest-sdk');
const logger = require('debug')('PAYPAL TEST');
const bodyParser = require('body-parser');

// set up express
const app = express();
app.set('port', process.env.PORT || 3333);
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// set up paypal sdk
paypal.configure();

const defaultPayee = 'jason.johnston@automattic.com';
const paypalConfig = {
  mode: 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
};
paypal.configure( paypalConfig );


function createPaymentPayload( formData = {} ) {

  // payment defaults
  const paymentInfo = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: { return_url: '/', cancel_url: '/' }, // these are not used but are required params
  };

  // build item
  const item = {
    name: 'two tickets to paradise',
    price: '.99',
    currency: 'USD',
    quantity: formData.qty || 1,
  };

  // build transaction
  const transaction = {
    amount: {
      total: (item.price * item.quantity).toFixed(2), // total must contain exaclty 2 decimal places
      currency: item.currency,
    },
    payment_options: {
      allowed_payment_method: "INSTANT_FUNDING_SOURCE"
    },
    payee: {
      email: formData.email || defaultPayee
    },
    note_to_payee: formData.note_to_payee || '',
    item_list: {
      items: [ item ]
    },
  };

  paymentInfo.transactions = [transaction];
  return paymentInfo;
}

function executePaymentPayload( payment ) {
  return {
    payer_id: payment.payerID
  };
}

app.post( '/create-payment', (req, resp) => {
  const paymentInfo = createPaymentPayload(req.body);
  paypal.payment.create(paymentInfo, (err, payment) => {
    if (err) {
      logger(err)
      resp.status(500);
      resp.json(err);
    } else {
      resp.json(payment);
    }
  });
});

app.post( '/execute-payment', (req, resp) => {
  const paymentInfo = executePaymentPayload( req.body );
  paypal.payment.execute(req.body.paymentID, paymentInfo, (err, payment) => {
    if (err) {
      logger(err);
      resp.status(500);
      resp.json(err);
    } else {
      resp.json(payment)
    }
  });
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Simple Payments Demo',
    mode:  paypalConfig.mode,
    payee: defaultPayee } );
} );

app.listen(app.get('port'),() => {
  logger(`node app up and running on port ${app.get('port')}`);
});
