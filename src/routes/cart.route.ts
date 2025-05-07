// import express from "express";
// import {
//   addToCart,
//   getCartProducts,
//   removeAllFromCart,
//   updateQuantity,
// } from "../controllers/Cart.controller";
// import { protectRoute } from "../middleware/auth.mw";

// const router = express.Router();

// router.get("/", protectRoute, getCartProducts);
// router.post("/", protectRoute, addToCart);
// router.delete("/", protectRoute, removeAllFromCart);
// router.put("/:id", protectRoute, updateQuantity);

// export default router;






















import express from "express";
import { protectRoute } from "../middleware/auth.mw";
import {
  getCartProducts,
  addToCart,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/Cart.controller";

const router = express.Router();

// Route to get cart products
router.get("/cart/:userId", protectRoute, getCartProducts);

// Route to add a product to the cart
router.post("/cart/addcart", protectRoute, addToCart);

// Route to remove all or specific products from the cart
router.delete("/cart/remove", protectRoute, removeAllFromCart);

// Route to update the quantity of a specific product in the cart
router.put("/cart/update/:id", protectRoute, updateQuantity);

export default router;
