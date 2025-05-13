/**
 * Module de gestion des paiements pour la boutique en ligne
 * Ce module simule un processus de paiement pour les tests
 * mais inclut également la configuration Stripe pour une future intégration complète
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
    window.showNotification("Traitement du paiement en cours...", "info");
    
    // Pour un système de test simple, simuler un paiement réussi
    // Dans un système réel, vous utiliseriez Stripe comme ceci:
    /*
    const { error } = await stripe.redirectToCheckout({
      sessionId: 'cs_test_XXXXXXXXXXXX' // Obtenu d'un appel à l'API Stripe
    });
    
    if (error) {
      throw new Error(error.message);
    }
    */
    
    // Simuler un ID de paiement (format similaire à Stripe pour la cohérence)
    const paymentId = 'pm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    
    // Enregistrer les informations de transaction
    const transactionInfo = {
      orderId: orderId,
      paymentId: paymentId,
      amount: total,
      items: cartItems,
      timestamp: new Date().toISOString(),
      customerEmail: window.firebaseAuth.currentUser.email
    };
    
    // Stocker l'information de transaction pour référence
    localStorage.setItem('lastTransaction', JSON.stringify(transactionInfo));
    
    // Afficher un log de débogage
    console.log("Transaction initiée:", transactionInfo);
    
    // Rediriger vers la page de succès après un court délai
    setTimeout(() => {
      window.location.href = `payment-success.html?order_id=${orderId}&payment_id=${paymentId}`;
    }, 2000);
    
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

/**
 * Génère un reçu de transaction au format texte
 * @param {Object} transaction - Informations de transaction
 * @returns {string} Reçu formaté
 */
function generateReceipt(transaction) {
  if (!transaction) return "Aucune information de transaction disponible";
  
  const dateOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  
  let receipt = `REÇU DE TRANSACTION\n`;
  receipt += `===================\n\n`;
  receipt += `Date: ${new Date(transaction.timestamp).toLocaleDateString('fr-FR', dateOptions)}\n`;
  receipt += `N° de Commande: ${transaction.orderId}\n`;
  receipt += `Référence de paiement: ${transaction.paymentId}\n`;
  receipt += `Client: ${transaction.customerEmail}\n\n`;
  receipt += `Articles:\n`;
  
  transaction.items.forEach(item => {
    receipt += `- ${item.name}: ${formatAmount(item.price)}\n`;
  });
  
  receipt += `\nTotal: ${formatAmount(transaction.amount)}\n`;
  receipt += `\nBoutique en ligne © 2025\n`;
  receipt += `Merci pour votre achat !`;
  
  return receipt;
}

// Exporter les fonctions pour les utiliser dans l'application
window.processPayment = processPayment;
window.formatAmount = formatAmount;
window.calculateTotal = calculateTotal;
window.generateReceipt = generateReceipt;

// Log pour confirmer que le module a été chargé
console.log("Module de paiement initialisé avec Stripe");