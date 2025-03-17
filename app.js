//imports

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { app_port } = require('./config');
const { generateRandomKey } = require('./utils/helpers');
const pageRoutes = require('./routes/pageroutes');
const userRoutes = require('./routes/userroutes');
const doctorRoutes = require('./routes/doctorroutes');
const recommendationRoutes = require('./routes/recomendations');
const doctorrecommendationRoutes = require('./routes/doctorrecommendations');
const notificationRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const searchRoutes = require('./routes/search');
const mealsRoutes = require('./routes/meals');
const { pool } = require('./config/db');

//creating server
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
const secretKey = generateRandomKey(32);
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true }
}));

// Routes
app.use(pageRoutes);
app.use(userRoutes);
app.use(recommendationRoutes);
app.use(mealsRoutes);
app.use(recommendationRoutes);
app.use(notificationRoutes);
app.use(doctorrecommendationRoutes);
app.use(doctorRoutes);
app.use(reportsRoutes);
// Register routes
app.use('/api', searchRoutes);

// Start Server
server.listen(app_port, () => {
  console.log(`Server is running on port ${app_port}`);
});

