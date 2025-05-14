/**
 * Module de gestion des paiements pour la boutique en ligne
 * Cette version utilise Stripe Checkout pour les paiements sécurisés
 */

// Initialiser Stripe
const stripe = Stripe('pk_test_51RGy61PQqougnU1CNivMCAiwJVnpZPPAafCKLVWiJZbD5rkqn5pFgJHXQMKSQRSSeqBzF2ZOaRvJeIipiwbisbzn00eqoHROHX');

/**
 * Traite le paiement avec Stripe Checkout
 * @param {Array} cartItems - Articles du panier
 * @param {string} orderId - ID de la commande dans Firestore
 * @param {string} email - Email du client
 */
async function processPayment(cartItems, orderId, email) {
  try {
    // Afficher un message à l'utilisateur
    window.showNotification("Redirection vers la page de paiement sécurisé...", "info");
    
    // Préparer les données pour l'API
    const requestData = {
      items: cartItems,
      orderId: orderId,
      userId: window.firebaseAuth.currentUser.uid,
      email: email
    };
    
    // Appel à l'API pour créer une session Stripe
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
    }
    
    const { sessionId } = await response.json();
    
    // Rediriger vers Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });
    
    if (result.error) {
      // En cas d'erreur pendant la redirection
      throw new Error(result.error.message);
    }
    
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    window.showNotification("Erreur lors du paiement: " + error.message, "error");
  }
}

/**
 * Format un montant pour l'affichage
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté avec 2 décimales et symbole €
 */
function formatAmount(amount) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Calcule le total du panier
 * @param {Array} items - Articles du panier
 * @returns {number} Total du panier
 */
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

// Exporter les fonctions pour les utiliser dans l'application
window.processPayment = processPayment;
window.formatAmount = formatAmount;
window.calculateTotal = calculateTotal;

// Log pour confirmer que le module a été chargé
console.log("Module de paiement Stripe initialisé");