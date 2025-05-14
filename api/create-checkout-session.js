// API route serverless pour créer une session Stripe Checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, orderId, userId, email } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Panier vide ou données incorrectes' });
    }
    
    // Créer les line_items pour Stripe
    const lineItems = items.map(item => ({
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
    
    // Déterminer l'URL de base
    const domain = req.headers.origin || 'https://produit-kuh6nusad-arnauds-projects-6031df14.vercel.app';
    
    // Créer une session Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${domain}/payment-success.html?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/payment-cancel.html`,
      customer_email: email,
      metadata: {
        orderId: orderId,
        userId: userId
      },
    });
    
    // Renvoyer l'ID de session au client
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};