import User from "../model/user.model.js";
import { ADMIN_WALLET } from "../constants.js";
import authMiddleware from "./jwt.middleware.js"; 

export const onlyAdmin = [
  authMiddleware, 
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.userWalletAddress?.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
        return res.status(403).json({ message: "User is not admin" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Admin check failed", error: error.message });
    }
  },
];
