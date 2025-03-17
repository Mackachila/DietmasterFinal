// no /schedule-meals
const express = require('express');
const path = require('path');
const { pool } = require('../config/db');
//const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// //meal scheduling endpoint
// router.post("/schedule-meals", async (req, res) => {
//     if (!req.session.email) {
//         return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }
//       const { meals } = req.body; 
//     const email = req.session.email;
  
//     if (!meals || meals.length === 0) {
//         return res.status(400).json({ message: "No meals provided" });
//     }
  
//     try {
//         const values = meals.map(meal => [email, meal.date, meal.meal_type, meal.meal_name]);
  
//         const sql = "INSERT INTO meal_schedule (email, meal_date, meal_type, meal_name) VALUES ?";
//         await pool.promise().query(sql, [values]);
  
//         res.json({ message: "Meals scheduled successfully!" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Database error" });
//     }
//   });
  
  
//   //geting the scheduled meals route
//   router.get("/scheduled-meals", async (req, res) => {
//     if (!req.session.email) {
//         return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }
  
//     const email = req.session.email;
  
//     try {
//         const [meals] = await pool.promise().query(
//             "SELECT id, meal_date, meal_type, meal_name FROM meal_schedule WHERE email = ? ORDER BY meal_date ASC",
//             [email]
//         );
  
//         res.json(meals);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Database error" });
//     }
//   });
  
  
//   //route to hanndle deleting scheduled meals
//   router.post("/delete-scheduled-meal", async (req, res) => {
//     if (!req.session.email) {
//         return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }
  
//     const { meal_id } = req.body;
//     const email = req.session.email; 
  
//     if (!meal_id) {
//         return res.status(400).json({ message: "Meal ID is required" });
//     }
  
//     try {
//         const [result] = await pool.promise().query(
//             "DELETE FROM meal_schedule WHERE id = ? AND email = ?",
//             [meal_id, email]
//         );
  
//         if (result.affectedRows > 0) {
//             res.json({ message: "Meal deleted successfully!" });
//         } else {
//             res.status(404).json({ message: "Meal not found!" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Database error" });
//     }
//   });
  

router.post("/schedule-meals", async (req, res) => {
  // Ensure user is logged in
  if (!req.session.email) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { meal_date, meal_type, meal_name } = req.body;
  const email = req.session.email; // Get email from session

  // Validate input
  if (!meal_date || !meal_type || !meal_name) {
      return res.status(400).json({ message: "Please provide all meal details." });
  }

  try {
      // Insert meal into database
      const sql = "INSERT INTO meal_schedule (email, meal_date, meal_type, meal_name) VALUES (?, ?, ?, ?)";
      await pool.promise().query(sql, [email, meal_date, meal_type, meal_name]);

      res.json({ message: "Meal scheduled successfully!" });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Database error" });
  }
});


router.get("/scheduled-meals", async (req, res) => {
  if (!req.session.email) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const email = req.session.email;

  try {
      const [meals] = await pool.promise().query(
          "SELECT id, meal_date, meal_type, meal_name FROM meal_schedule WHERE email = ? ORDER BY meal_date ASC",
          [email]
      );

      res.json(meals); // Send scheduled meals as JSON
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database error" });
  }
});


router.post("/delete-scheduled-meal", async (req, res) => {
  if (!req.session.email) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { meal_id } = req.body; // Get meal ID from request
  const email = req.session.email; // Get logged-in user's email

  if (!meal_id) {
      return res.status(400).json({ message: "Meal ID is required" });
  }

  try {
      const [result] = await pool.promise().query(
          "DELETE FROM meal_schedule WHERE id = ? AND email = ?",
          [meal_id, email]
      );

      if (result.affectedRows > 0) {
          res.json({ message: "Meal deleted successfully!" });
      } else {
          res.status(404).json({ message: "Meal not found or not yours!" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Database error" });
  }
});


  // Route to handle the form submission
  router.post('/add-meal2', async (req, res) => {
    const { meal_name, meal_type, nutrition_info } = req.body;
  
    // Ensure nutrition_info is a valid JSON object (just in case)
    let nutritionInfo;
    try {
      nutritionInfo = JSON.parse(nutrition_info);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid nutrition info format.' });
    }
  
    const { general_info, ingredients } = nutritionInfo;
  
    try {
      // Insert the data into the meals table
      const query = `
        INSERT INTO meals (meal_name, meal_type, nutrition_info)
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.promise().query(query, [meal_name, meal_type, JSON.stringify(nutritionInfo)]);
  
      // Return a success response
      res.json({ success: true, message: 'Meal added successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error adding meal to database.' });
    }
  });
  
  // Delete meal route
  router.delete('/delete-meal', async (req, res) => {
    const { meal_name } = req.body;
  
    try {
      // Delete meal from the database
      const [result] = await pool.promise().query(
        `DELETE FROM meals WHERE meal_name = ?`,
        [meal_name]
      );
  
      if (result.affectedRows === 0) {
        return res.json({ success: false });
      }
  
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting meal:", err);
      res.json({ success: false });
    }
  });
  
  module.exports = router;