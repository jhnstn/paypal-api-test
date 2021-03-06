const express = require( 'express' );
const socketIO = require('socket.io');
const paypal = require('paypal-rest-sdk');
const logger = require('debug')('PAYPAL_TEST');
const bodyParser = require('body-parser');

// set up express
const app = express();
const port = process.env.PORT || 3333;
app.set('port', port );
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// set up sockets
const server = require('http').Server(app);
const io = socketIO(server);

// set up paypal sdk
paypal.configure();

const defaultPayee = 'jason.johnston@automattic.com';
const price = '.01';

const paypalConfig = {
  mode: 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
  headers: {
    "PayPal-Partner-Attribution-Id" : "123123123"
  }
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
    price,
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
      email: formData.payee || defaultPayee
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

app.post( '/hook', (req, resp) => {
  io.emit('hook', req.body);
  resp.send('OK');
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Simple Payments Demo',
    mode:  paypalConfig.mode,
    price: `${price} USD`,
    payee: defaultPayee } );
} );

server.listen(port);




