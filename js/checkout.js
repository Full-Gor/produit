const stripe = Stripe('pk_test_51RGy61PQqougnU1CNivMCAiwJVnpZPPAafCKLVWiJZbD5rkqn5pFgJHXQMKSQRSSeqBzF2ZOaRvJeIipiwbisbzn00eqoHROHX');

async function processPayment(cartItems, orderId, total) {
  try {
    if (!window.firebaseAuth.currentUser) {
      window.showNotification('Veuillez vous connecter pour effectuer un paiement', 'error');
      return;
    }

    const items = cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: 1,
    }));

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        orderId,
        userId: window.firebaseAuth.currentUser.uid,
        email: window.firebaseAuth.currentUser.email,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Erreur lors du traitement du paiement:', error);
    window.showNotification('Erreur lors du paiement: ' + error.message, 'error');
    setTimeout(() => {
      window.location.href = 'payment-cancel.html';
    }, 1500);
  }
}

function formatAmount(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
}

window.processPayment = processPayment;
window.formatAmount = formatAmount;
window.calculateTotal = calculateTotal;

console.log('Module de paiement Stripe initialisé');