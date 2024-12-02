require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const rateLimit = require("express-rate-limit");

//Auth middleware
const authMiddleware = require("./auth");

//Route files
const adminRoutes = require("./routes/admin");
const merchantRoutes = require("./routes/merchant");
const userRoutes = require("./routes/user");
const utilsRoutes = require("./routes/utils");

const app = express();

// ------- Middleware ---------

//Sets cors permissions
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], //allowed origin
  methods: ["GET", "POST"], //Allowed methods
};
//Defines rate limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, //Limit each IP to 100 requests per window
});

app.use(
  //options [combined || tiny || short || dev]
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(cors(corsOptions));
app.use(authMiddleware);
app.use(express.json());
app.use(limiter);

const PORT = process.env.PORT || 3000;

//Use Route Files
app.use("/api", adminRoutes);
app.use("/api", merchantRoutes);
app.use("/api", userRoutes);
app.use("/api", utilsRoutes);

//Winston - Logger logic
logger.info("Server is starting...");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
