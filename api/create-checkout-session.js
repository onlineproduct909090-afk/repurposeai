import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, successUrl, cancelUrl } = req.body;

    // ✅ Real Stripe Price IDs inserted
    const prices = {
      pro: 'price_1TvJ10Jlo9dfjVmBEaf1Jg56',    // $29 Pro Plan
      studio: 'price_1TvJ4TJlo9dfjVmB45paACMy',  // $89 Studio Plan
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: prices[planId], quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
}