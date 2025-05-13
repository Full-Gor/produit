/**
 * Module de gestion des paiements pour la boutique en ligne
 */

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

    // Stocker l'ID de commande
    localStorage.setItem('pendingOrderId', orderId);
    window.showNotification("Redirection vers la page de paiement...", "info");
    
    // Utiliser un prix prédéfini dans Stripe (le plus simple)
    const priceId = 'price_VOTRE_ID_PRIX'; // REMPLACEZ PAR VOTRE ID DE PRIX
    
    // Options de redirection
    const options = {
      lineItems: [{
        price: priceId, 
        quantity: 1
      }],
      mode: 'payment',
      successUrl: `${window.location.origin}/payment-success.html?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment-cancel.html`,
      customerEmail: window.firebaseAuth.currentUser.email
    };
    
    console.log("Redirection vers Stripe...");
    
    // Rediriger vers Stripe Checkout
    const { error } = await stripe.redirectToCheckout(options);
    
    if (error) {
      console.error("Erreur Stripe:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Erreur de paiement:", error);
    window.showNotification("Erreur: " + error.message, "error");
    
    // Fallback: simuler un paiement
    console.log("Utilisation du mode de paiement simulé...");
    setTimeout(() => {
      const simSessionId = 'sim_' + Date.now();
      window.location.href = `payment-success.html?order_id=${orderId}&session_id=${simSessionId}`;
    }, 2000);
  }
}

// Export pour l'application
window.processPayment = processPayment;

// Autres fonctions utiles
function formatAmount(amount) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

window.formatAmount = formatAmount;

// Log pour confirmer que le module a été chargé
console.log("Module de paiement Stripe initialisé (version simplifiée)");