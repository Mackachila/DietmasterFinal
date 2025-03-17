// scheduled-meals
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();



// Search Route
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query is required' });
  
    try {
      const [rows] = await pool.promise().execute(
        `SELECT id, meal_name, meal_type, nutrition_info
         FROM meals
         WHERE meal_name LIKE ? 
           OR meal_type LIKE ? 
           OR JSON_UNQUOTE(JSON_EXTRACT(nutrition_info, '$.general_info')) LIKE ?
           OR JSON_SEARCH(JSON_EXTRACT(nutrition_info, '$.ingredients'), 'one', ?) IS NOT NULL`,
        [`%${query}%`, `%${query}%`, `%${query}%`, query]
      );
  
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: 'No results found.' });
      }
  
      res.json(rows);
    } catch (error) {
      console.error('Error during search:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  router.get('/meal/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.promise().execute(
        `SELECT id, meal_name, meal_type, nutrition_info FROM meals WHERE id = ?`,
        [id]
      );
  
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Meal not found.' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching meal details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  
  
  
  module.exports = router;