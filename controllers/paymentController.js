import Payment from "../models/Payment.js";
import Cart from "../models/Cart.js";
import stripe from "stripe";

// Initialize Stripe with your secret key
const stripeClient = stripe("your_stripe_secret_key_here");



// Controller for processing the payment
const payForCart = async (req, res) => {
  const { cartId, paymentMethod, paymentToken } = req.body; // paymentToken: Token from frontend (Stripe token or PayPal token)

  try {
    // Fetch the cart details
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the total price matches the amount provided
    if (cart.totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid total price" });
    }

    // Create a payment intent (Stripe example)
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: cart.totalPrice * 100, // Amount in cents (Stripe expects the amount in the smallest currency unit)
      currency: "usd", // Change this to your currency
      payment_method: paymentToken, // Token from frontend (Stripe token or PayPal token)
      confirmation_method: "manual", // Use manual confirmation
      confirm: true, // Automatically confirm the payment
    });

    // Check the payment status
    if (paymentIntent.status === "succeeded") {
      // Create the payment record in the database
      const payment = new Payment({
        user: req.user._id, // Assuming user is authenticated
        cart: cartId,
        amount: cart.totalPrice,
        paymentMethod: paymentMethod, // e.g., "Stripe"
        paymentStatus: "Completed", // You can change this dynamically based on payment status
        transactionId: paymentIntent.id, // Stripe payment ID
      });

      // Save payment record
      await payment.save();

      // Optionally, update cart status or other related records
      // Example: mark the cart as paid or processed

      return res.status(200).json({
        message: "Payment successful",
        payment: payment,
      });
    } else {
      return res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    console.error("Payment error: ", error);
    return res.status(500).json({ message: "Payment processing error", error: error.message });
  }
};

export {  payForCart };
