/**
 * Module de gestion des paiements pour la boutique en ligne
 * Cette version utilise une simulation de paiement pour les tests
 */

// Initialiser Stripe (pour référence future, non utilisé dans cette version simulée)
const stripe = Stripe('pk_test_51RGy61PQqougnU1CNivMCAiwJVnpZPPAafCKLVWiJZbD5rkqn5pFgJHXQMKSQRSSeqBzF2ZOaRvJeIipiwbisbzn00eqoHROHX');

// Fonction pour gérer le processus de paiement (simulation)
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
    
    // Simuler une interface de paiement
    // Créer un overlay pour afficher les détails du paiement
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    const paymentBox = document.createElement('div');
    paymentBox.style.backgroundColor = 'white';
    paymentBox.style.padding = '30px';
    paymentBox.style.borderRadius = '10px';
    paymentBox.style.maxWidth = '500px';
    paymentBox.style.width = '90%';
    
    // Créer le contenu de l'interface de paiement
    paymentBox.innerHTML = `
      <h2 style="text-align:center; margin-bottom:20px;">Paiement Simulé</h2>
      <p><strong>Montant total:</strong> ${total} €</p>
      <p><strong>Articles:</strong></p>
      <ul style="margin-bottom:20px;">
        ${cartItems.map(item => `<li>${item.name} - ${item.price} €</li>`).join('')}
      </ul>
      <p><strong>N° de commande:</strong> ${orderId}</p>
      <p style="margin-bottom:20px;"><strong>Client:</strong> ${window.firebaseAuth.currentUser.email}</p>
      
      <div style="margin-top:30px; text-align:center;">
        <div style="margin-bottom:10px; display:flex; align-items:center; justify-content:center;">
          <div class="loader" style="border:4px solid #f3f3f3; border-top:4px solid #3498db; border-radius:50%; width:20px; height:20px; animation:spin 2s linear infinite; margin-right:10px;"></div>
          <span id="statusMessage">Traitement en cours...</span>
        </div>
        <button id="cancelBtn" style="background-color:#e74c3c; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; margin-right:10px;">Annuler</button>
        <button id="confirmBtn" style="background-color:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">Confirmer le paiement</button>
      </div>
      
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    overlay.appendChild(paymentBox);
    document.body.appendChild(overlay);
    
    // Gérer les interactions
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      window.location.href = 'payment-cancel.html';
    });
    
    confirmBtn.addEventListener('click', () => {
      // Simuler un traitement
      statusMessage.textContent = "Paiement en cours...";
      cancelBtn.disabled = true;
      confirmBtn.disabled = true;
      
      // Simuler un ID de paiement
      const paymentId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      
      // Rediriger vers la page de succès après un délai
      setTimeout(() => {
        document.body.removeChild(overlay);
        window.location.href = `payment-success.html?order_id=${orderId}&payment_id=${paymentId}`;
      }, 2000);
    });
    
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
console.log("Module de paiement simulé initialisé");