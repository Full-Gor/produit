const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, orderId, userId, email } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Panier vide ou données incorrectes' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://produit-kuh6nusad-arnauds-projects-6031df14.vercel.app'}/payment-success.html?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://produit-kuh6nusad-arnauds-projects-6031df14.vercel.app'}/payment-cancel.html`,
      customer_email: email,
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
};