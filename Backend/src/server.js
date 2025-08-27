import app from "./app.js";
import connectDB from "./config/db.config.js";
import {PORT} from "./constants.js"

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});