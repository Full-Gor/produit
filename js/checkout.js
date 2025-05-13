// Initialiser Stripe avec votre clé publique
const stripe = Stripe('pk_test_51RGy61PQqougnU1CNivMCAiwJVnpZPPAafCKLVWiJZbD5rkqn5pFgJHXQMKSQRSSeqBzF2ZOaRvJeIipiwbisbzn00eqoHROHX');

// Fonction pour gérer le processus de paiement
async function processPayment(cartItems, orderId, total) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!window.firebaseAuth.currentUser) {
      showNotification("Veuillez vous connecter pour effectuer un paiement", "error");
      return;
    }

    // Préparer les données pour la session Stripe
    const items = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price
    }));

    // Stocker l'ID de commande pour référence
    localStorage.setItem('pendingOrderId', orderId);

    // Appeler l'API route pour créer une session Stripe
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items,
        orderId: orderId,
        userId: window.firebaseAuth.currentUser.uid,
        userEmail: window.firebaseAuth.currentUser.email
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
    }

    const { sessionId } = await response.json();

    // Rediriger vers la page de paiement Stripe
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    showNotification("Erreur lors du paiement: " + error.message, "error");
  }
}

// Exporter la fonction pour l'utiliser dans app.js
window.processPayment = processPayment;