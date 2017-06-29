
$( () => {
  var CREATE_PAYMENT_URL  = '/create-payment';
  var EXECUTE_PAYMENT_URL = '/execute-payment';

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
          return data.id;
      });
    },

    onAuthorize: function(data) {
        return paypal.request.post(EXECUTE_PAYMENT_URL, {
            paymentID: data.paymentID,
            payerID:   data.payerID
        }).then(function(resp) {
          console.log( resp );
          alert( 'check yo console for the response' );
        });
    }
  }, '#paypal-button');
 });
