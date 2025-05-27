import express from "express";
// import { payForCart } from "../controllers/PaymentController.js";
import { verifyUser } from "../middlewares/auth.js"; // Assuming you have an authentication middleware

const router = express.Router();


// Route to handle the payment process
router.post("/checkout", verifyUser);

export default router;
