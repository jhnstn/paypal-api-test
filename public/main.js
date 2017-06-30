
$( () => {
  var CREATE_PAYMENT_URL  = '/create-payment';
  var EXECUTE_PAYMENT_URL = '/execute-payment';

  var responses = 0;
  function appendResponse( resp, step ) {
    var id = `response-${++responses}`;
    $('#responses')
      .append( $('<hr>'))
      .append('<h1>').html( step )
      .append( $(`<pre class="response" id="${id}">`).html(JSON.stringify(resp, null, 2)));
  }

  paypal.Button.render({
    env: 'sandbox', // Or 'sandbox'
    commit: true, // Show a 'Pay Now' button
    payment: function() {
      var formData = $('#simple-payment input').toArray().reduce(  (data, input) => {
        if (input.value) {
          data[input.name] = input.value;
        }
        return data;
      }, {});
      return paypal.request.post(CREATE_PAYMENT_URL, formData ).then(function(data) {
        appendResponse(data, 'CREATE');
        return data.id;
      });
    },

    onAuthorize: function(data) {
        return paypal.request.post(EXECUTE_PAYMENT_URL, {
            paymentID: data.paymentID,
            payerID:   data.payerID
        }).then(function(resp) {
          appendResponse(resp, 'EXECUTE');
        });
    }
  }, '#paypal-button');

  var socket = io.connect('/');
  socket.on( 'webhook', (msg) => console.log( msg) );
 });
