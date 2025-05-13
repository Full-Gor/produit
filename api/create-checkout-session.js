// Ce fichier est une API route Vercel serverless
import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, userId, userEmail, orderId } = req.body;

    // Vérifier les données requises
    if (!items || !items.length || !userId) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Créer les line_items pour Stripe
    const lineItems = items.map(item => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe utilise les centimes
        },
        quantity: 1,
      };
    });

    // Déterminer l'URL de base pour les redirections
    const origin = req.headers.origin || 'https://produit-delta.vercel.app';

    // Créer une session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel.html`,
      client_reference_id: orderId,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId,
        orderId: orderId,
      },
    });

    // Renvoyer l'ID de session au client
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}