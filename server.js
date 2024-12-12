require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");
const {cacheTotalProducts} = require("./utils/cacheHandler");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cron = require("node-cron");
//Auth middleware
const authMiddleware = require("./auth");

//Route files
const adminRoutes = require("./routes/admin");
const merchantRoutes = require("./routes/merchant");
const userRoutes = require("./routes/user");
const utilsRoutes = require("./routes/utils");
const authRoutes = require("./routes/auth");

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
app.use(express.static(path.join(__dirname, "public")));
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

//Landing page
app.get("/", (req, res) =>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Use Route Files
app.use("/api", adminRoutes);
app.use("/api", merchantRoutes);
app.use("/api", userRoutes);
app.use("/api", utilsRoutes);
app.use("/api/auth", authRoutes);

//Winston - Logger logic
logger.info("Server is starting...");

//Scheduling tasks to run every day at 11:59 PM
cron.schedule("08 18 * * *", async() =>{
  console.log("Refreshing total product count cache...");
  try{
    await cacheTotalProducts();
    console.log("Total products count cache refreshed successfully.");
  }catch(error){
    console.error("Failed to refresh total product count cache: ", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
