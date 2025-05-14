/**
 * Module de gestion des paiements pour la boutique en ligne
 * Cette version utilise Stripe Checkout en mode client uniquement
 */

// Initialiser Stripe avec votre clé publique (celle-ci est déjà dans l'index.html)
const stripe = window.stripeInstance;

/**
 * Traite le paiement avec Stripe Checkout en mode client uniquement
 * @param {Array} cartItems - Articles du panier
 * @param {string} orderId - ID de la commande dans Firestore
 * @param {string} email - Email du client
 */
async function processPayment(cartItems, orderId, email) {
  try {
    // Afficher un message à l'utilisateur
    window.showNotification("Redirection vers la page de paiement sécurisé...", "info");
    
    // Créer les line_items pour Stripe
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Article: ${item.name}`,
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: 1,
    }));
    
    // Créer une session de paiement Stripe en mode client
    // Dans cette approche, nous redirigerons l'utilisateur directement vers Stripe Checkout
    const session = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: lineItems,
      successUrl: `${window.location.origin}/payment-success.html?order_id=${orderId}`,
      cancelUrl: `${window.location.origin}/payment-cancel.html`,
      customerEmail: email,
    });
    
    if (session.error) {
      throw new Error(session.error.message);
    }
    
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    window.showNotification("Erreur lors du paiement: " + error.message, "error");
  }
}

/**
 * Alternative: utiliser Stripe Elements pour une intégration plus directe
 * Vous pouvez décommenter cette fonction pour l'utiliser à la place
 */
/*
async function processPaymentWithElements(cartItems, orderId, email) {
  try {
    // Créer un élément Card
    const elements = stripe.elements();
    const card = elements.create('card');
    
    // Monter l'élément Card dans le DOM
    const cardElement = document.createElement('div');
    cardElement.id = 'card-element';
    cardElement.style.padding = '10px';
    cardElement.style.border = '1px solid #ddd';
    cardElement.style.borderRadius = '4px';
    
    // Créer une modale pour afficher le formulaire de paiement
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.width = '400px';
    modalContent.style.maxWidth = '90%';
    
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    modalContent.innerHTML = `
      <h2>Paiement sécurisé</h2>
      <p>Total: ${total} €</p>
      <form id="payment-form">
        <div style="margin-bottom: 20px;">
          <label for="card-element">Carte de crédit</label>
          <div id="card-container"></div>
          <div id="card-errors" style="color: red; margin-top: 10px;"></div>
        </div>
        <button type="submit" style="background-color: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Payer</button>
        <button type="button" id="cancel-btn" style="background-color: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Annuler</button>
      </form>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Monter l'élément Card
    setTimeout(() => {
      card.mount('#card-container');
    }, 100);
    
    // Annuler le paiement
    document.getElementById('cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Soumettre le paiement
    document.getElementById('payment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
      });
      
      if (error) {
        document.getElementById('card-errors').textContent = error.message;
        return;
      }
      
      // Simuler un paiement réussi (dans un environnement réel, vous devriez communiquer avec votre backend)
      // Rediriger vers la page de succès
      window.location.href = `payment-success.html?order_id=${orderId}&payment_id=${paymentMethod.id}`;
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
    window.showNotification("Erreur lors du paiement: " + error.message, "error");
  }
}
*/

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
console.log("Module de paiement Stripe (client uniquement) initialisé");