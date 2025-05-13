/**
 * Module de gestion des paiements pour la boutique en ligne
 * Ce module intègre Stripe Checkout pour des paiements tests
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

    // Stocker dans localStorage pour un accès plus facile
    localStorage.setItem('pendingOrderId', orderId);
    localStorage.setItem('cartTotal', total);
    
    // Afficher un message à l'utilisateur
    window.showNotification("Redirection vers la page de paiement...", "info");
    
    // Préparer les données des articles pour Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: 1,
    }));
    
    // Configuration de la session Stripe Checkout
    const checkoutOptions = {
      mode: 'payment',
      lineItems: lineItems,
      successUrl: `${window.location.origin}/payment-success.html?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment-cancel.html`,
      customerEmail: window.firebaseAuth.currentUser.email,
    };
    
    console.log("Redirection vers Stripe avec options:", checkoutOptions);
    
    // Rediriger vers Stripe Checkout
    const { error } = await stripe.redirectToCheckout(checkoutOptions);
    
    // Si une erreur survient, la traiter
    if (error) {
      throw new Error(error.message);
    }
    
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    window.showNotification("Erreur lors du paiement: " + error.message, "error");
    
    // En cas d'erreur, rediriger vers la page d'annulation
    setTimeout(() => {
      window.location.href = 'payment-cancel.html';
    }, 1500);
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
console.log("Module de paiement initialisé avec Stripe Checkout");