// Initialiser Stripe avec votre clé publique
const stripe = Stripe('pk_test_51RGy61PQqougnU1CNivMCAiwJVnpZPPAafCKLVWiJZbD5rkqn5pFgJHXQMKSQRSSeqBzF2ZOaRvJeIipiwbisbzn00eqoHROHX');

// Fonction pour gérer le processus de paiement
async function processPayment(cartItems, orderId, total) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!window.firebaseAuth.currentUser) {
      window.showNotification("Veuillez vous connecter pour effectuer un paiement", "error");
      return;
    }

    // Stocker l'ID de commande dans localStorage pour le récupérer après paiement
    localStorage.setItem('pendingOrderId', orderId);

    // Utiliser directement Stripe Checkout sans passer par l'API
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: cartItems.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe utilise les centimes
        },
        quantity: 1,
      })),
      successUrl: `${window.location.origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancelUrl: `${window.location.origin}/payment-cancel.html`,
      customerEmail: window.firebaseAuth.currentUser.email,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    window.showNotification("Erreur lors du paiement: " + error.message, "error");
  }
}

// Exporter la fonction pour l'utiliser dans app.js
window.processPayment = processPayment;