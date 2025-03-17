// Please update your child's details first to get meal recommendations
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// Function to generate a balanced meal recommendation
async function generateDynamicMealWithAnalysis(email, mealType) {
    try {
      // Fetch user details
      const [userDetails] = await pool.promise().query(
        `SELECT child_age, allergies, health_conditions, favorite_meals FROM dietmaster_members WHERE email = ?`,
        [email]
      );
  
      if (!userDetails.length) {
        return { message: "User details not found." };
      }
  
      const { child_age, allergies, health_conditions, favorite_meals } = userDetails[0];
  
      if (child_age === "No data") {
        return { message: "Please update your child's details first to get meal recommendations." };
      }
  
      // Fetch meals recommended in the last 7 days
      const [pastRecommendations] = await pool.promise().query(
        `SELECT meal_name FROM recommendations WHERE email = ? AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        [email]
      );
  
      // Meals already recommended today
      const [recommendedMealsToday] = await pool.promise().query(
        `SELECT meal_name FROM recommendations WHERE email = ? AND DATE(recommendation_date) = CURDATE()`,
        [email]
      );
  
      const recommendedMealNames = recommendedMealsToday.map((meal) => meal.meal_name);
  
      // Filtering conditions
      let allergyConditions = "1=1";
      if (allergies !== "No data" && allergies) {
        allergyConditions = allergies
          .split(",")
          .map((allergy) => `nutrition_info NOT LIKE '%${allergy.trim().replace(" ", "_")}%'`)
          .join(" AND ");
      }
  
      let healthConditionConditions = "1=1";
      if (health_conditions !== "No data" && health_conditions) {
        healthConditionConditions = health_conditions
          .split(",")
          .map((condition) => `nutrition_info LIKE '%${condition.trim().replace(" ", "_")}%'`)
          .join(" OR ");
      }
  
      let favoriteCondition = "1=1";
      if (favorite_meals !== "No data" && favorite_meals) {
        favoriteCondition = favorite_meals
          .split(",")
          .map((meal) => `meal_name LIKE '%${meal.trim().replace(" ", "_")}%'`)
          .join(" OR ");
      }
  
      let ageCondition = "1=1";
      if (child_age === "Less than 1 Year old" || child_age === "1 Year old") {
        ageCondition = "meal_type IN ('breakfast', 'lunch') AND nutrition_info NOT LIKE '%sima%' AND nutrition_info NOT LIKE '%githeri%'";
      }
  
      // Base query
      let query = `
        SELECT * FROM meals
        WHERE meal_type = ?
        ${recommendedMealNames.length > 0 ? `AND meal_name NOT IN (${recommendedMealNames.map(() => '?').join(',')})` : ""}
        AND ${allergyConditions}
        AND (${healthConditionConditions})
        AND ${favoriteCondition}
        AND ${ageCondition}
        ORDER BY 
          CASE 
            WHEN ${favoriteCondition} THEN 1
            WHEN (${healthConditionConditions}) THEN 2
            ELSE 3
          END,
          RAND()
        LIMIT 1
      `;
  
      let params = recommendedMealNames.length > 0 ? [mealType, ...recommendedMealNames] : [mealType];
  
      // Execute query
      let [meals] = await pool.promise().query(query, params);
  
      // **Retry logic with relaxed conditions**
      if (!meals.length) {
        console.log("No exact match found. Relaxing conditions...");
  
        query = `
          SELECT * FROM meals
          WHERE meal_type = ?
          AND ${ageCondition}
          AND ${allergyConditions}
          ORDER BY 
            CASE 
              WHEN (${healthConditionConditions}) THEN 1
              ELSE 2
            END,
            RAND()
          LIMIT 1
        `;
  
        [meals] = await pool.promise().query(query, [mealType]);
      }
  
      // Final fallback: return any meal of the correct type
      if (!meals.length) {
        console.log("Still no match found. Returning any available meal.");
        query = `SELECT * FROM meals WHERE meal_type = ? ORDER BY RAND() LIMIT 1`;
        [meals] = await pool.promise().query(query, [mealType]);
      }
  
      if (!meals.length) {
        return { message: "No meals available at this time. Please try again later." };
      }
  
      // Parse nutrition_info JSON
      let generalInfo = "N/A";
      let ingredients = "N/A";
  
      if (meals[0].nutrition_info) {
        try {
          const nutritionInfo = JSON.parse(meals[0].nutrition_info);
          generalInfo = nutritionInfo.general_info || "N/A";
          ingredients = Array.isArray(nutritionInfo.ingredients)
            ? nutritionInfo.ingredients.join(", ")
            : "N/A";
        } catch (err) {
          console.error("Error parsing nutrition_info JSON:", err);
        }
      }
  
      return {
        mealName: meals[0].meal_name,
        generalInfo,
        ingredients,
        nutritionInfo: meals[0].nutrition_info,
      };
    } catch (err) {
      console.error(err);
      return { message: "Error generating recommendation." };
    }
  }
  
  
  
  // getting  meal recommendations route
  router.get("/recommend/:mealType", async (req, res) => {
    const { mealType } = req.params;
    const email = req.session.email;
  
    try {
      // Fetch today's recommendation
      const [existingRecommendation] = await pool.promise().query(
        `SELECT meal_name, general_info, ingredients 
         FROM recommendations 
         WHERE email = ? AND meal_type = ? AND DATE(recommendation_date) = CURDATE()`,
        [email, mealType]
      );
  
      if (existingRecommendation.length) {
        const { meal_name, general_info, ingredients } = existingRecommendation[0];
        return res.json({
          mealType,
          mealName: meal_name,
          generalInfo: general_info || "Sorry I could not load this data for now.",
          ingredients: ingredients || "Sorry I could not load this data for now.",
          description: `I suggest you feed your child ${meal_name} for ${mealType} today.`,
          description2: `${general_info || "Sorry I could not load this data for now."}`,
          description3: `${ingredients || "Sorry I could not load this data for now."}`,
        });
      }
  
      // Generate a new recommendation if none exists
      const meal = await generateDynamicMealWithAnalysis(email, mealType);
  
      if (meal.message) {
        return res.json({ message: meal.message });
      }
  
      // Insert the new recommendation into the database
      await pool.promise().query(
        `INSERT INTO recommendations (email, meal_type, meal_name, general_info, ingredients, recommendation_date) 
         VALUES (?, ?, ?, ?, ?, CURDATE())`,
        [email, mealType, meal.mealName, meal.generalInfo, meal.ingredients]
      );
  
      res.json({
        mealType,
        mealName: meal.mealName,
        generalInfo: meal.generalInfo,
        ingredients: meal.ingredients,
        nutritionInfo: meal.nutritionInfo,
        description: `I suggest you feed your child ${meal.mealName} for ${mealType} today.`,
        description2: `${meal.generalInfo}`,
        description3: `${meal.ingredients}`,
      });
    } catch (err) {
      console.error("Error in /recommend/:mealType:", err);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  });
  
  
  // Helper function to parse meals from comma-separated data
  const parseMealData = (rawMeals) => {
    if (!rawMeals || rawMeals === 'No data') return [];
    return rawMeals.split(',').map(meal => meal.trim().replace(/_/g, ' '));
  };  
  
  
  //geting weekly/Daily meal analysis
  router.get('/doctor_analysis/weekly', async (req, res) => {
    // const email = req.session.email;
    const email = req.query.email; // Get email from query
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const keywords = ["Carbohydrates", "Proteins", "Vitamins", "Fats", "Energy", "Sugar", "Omega"];
    const rdi = { Carbohydrates: 200, Proteins: 20, Vitamins: 20, Fats: 10 }; // Mock RDI percentages
    
    try {
      const [mealData, analysisData] = await Promise.all([
        pool.promise().query(
          `SELECT 
             meal_name, 
             recommendation_date, 
             COUNT(*) AS meal_count
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
           GROUP BY meal_name, recommendation_date
           ORDER BY recommendation_date DESC`,
          [email]
        ),
        pool.promise().query(
          `SELECT general_info, recommendation_date
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)
           ORDER BY recommendation_date DESC`,
          [email]
        ),
      ]);
  
      if (mealData[0].length === 0 || analysisData[0].length === 0) {
        return res.json({ noData: true });
      }
  
      // Meal Data Processing
      mealData[0].forEach(row => {
        row.meal_name = parseMealData(row.meal_name); // Apply your function here
      });
  
      const mealGroupedByDate = mealData[0].reduce((acc, row) => {
        const { meal_name, meal_count, recommendation_date } = row;
        const formattedDate = formatDate(recommendation_date); // Format the date here
        if (!acc[formattedDate]) acc[formattedDate] = {};
        acc[formattedDate][meal_name] = meal_count;
        return acc;
      }, {});
  
      const dates = Object.keys(mealGroupedByDate);
      const mealNames = [...new Set(mealData[0].map(item => item.meal_name))];
      const mealCounts = mealNames.map(meal =>
        dates.map(date => (mealGroupedByDate[date][meal] || 0))
      );
  
      const chartData = {
        labels: dates, // Use the formatted dates here
        datasets: mealCounts.map((counts, index) => ({
          label: mealNames[index],
          data: counts,
          backgroundColor: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Different colors for bars
        })),
      };
  
      // Nutrition Data Processing (analysisData)
      const nutritionStats = keywords.reduce((acc, nutrient) => {
        acc[nutrient] = 0;
        return acc;
      }, {});
  
      analysisData[0].forEach(row => {
        keywords.forEach(nutrient => {
          if (row.general_info.includes(nutrient)) {
            nutritionStats[nutrient] += 1;
          }
        });
      });
  
      const totalMeals = analysisData[0].length;
      const nutritionPercentages = Object.keys(nutritionStats).map(nutrient => ({
        nutrient,
        percentage: ((nutritionStats[nutrient] / totalMeals) * 100).toFixed(2),
        target: rdi[nutrient] || 0,
      }));
  
      res.json({ chartData, nutritionPercentages });
  
    } catch (err) {
      console.error('Error fetching weekly analysis:', err);
      res.status(500).json({ message: 'Error fetching data for weekly analysis' });
    }
  });
  
  // Helper function to format the date in 'Day dd/yyyy' format
  const formatDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  //geting Monthly meal analysis
  router.get('/doctor_analysis/monthly', async (req, res) => {
    // const email = req.session.email;
    const email = req.query.email; // Get email from query
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const keywords = ["Carbohydrates", "Proteins", "Vitamins", "Fats", "Energy", "Sugar", "Omega"];
    const rdi = { Carbohydrates: 50, Proteins: 100, Vitamins: 120, Fats: 10 }; // Mock RDI percentages
    
    try {
      const [mealData, analysisData] = await Promise.all([
        pool.promise().query(
          `SELECT 
             meal_name, 
             COUNT(*) AS meal_count, 
             DATE_FORMAT(recommendation_date, '%Y-%m') AS month
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
           GROUP BY meal_name, month
           ORDER BY month DESC`,
          [email]
        ),
        pool.promise().query(
          `SELECT general_info, DATE_FORMAT(recommendation_date, '%Y-%m') AS month
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
           ORDER BY month DESC`,
          [email]
        ),
      ]);
  
      if (mealData[0].length === 0 || analysisData[0].length === 0) {
        return res.json({ noData: true });
      }
  
      // Meal Data Processing
      mealData[0].forEach(row => {
        row.meal_name = parseMealData(row.meal_name); // Apply your function here
      });
  
      const mealGroupedByMonth = mealData[0].reduce((acc, row) => {
        const { meal_name, meal_count, month } = row;
        const formattedMonth = formatMonthYear(month); // Convert to 'Month Year'
        if (!acc[formattedMonth]) acc[formattedMonth] = {};
        acc[formattedMonth][meal_name] = meal_count;
        return acc;
      }, {});
  
      const months = Object.keys(mealGroupedByMonth);
      const mealNames = [...new Set(mealData[0].map(item => item.meal_name))];
      const mealCounts = mealNames.map(meal =>
        months.map(month => (mealGroupedByMonth[month][meal] || 0))
      );
  
      const chartData = {
        labels: months, // Use the formatted months here
        datasets: mealCounts.map((counts, index) => ({
          label: mealNames[index],
          data: counts,
          backgroundColor: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Different colors for bars
        })),
      };
  
      // Nutrition Data Processing (analysisData)
      const nutritionStats = keywords.reduce((acc, nutrient) => {
        acc[nutrient] = 0;
        return acc;
      }, {});
  
      analysisData[0].forEach(row => {
        keywords.forEach(nutrient => {
          if (row.general_info.includes(nutrient)) {
            nutritionStats[nutrient] += 1;
          }
        });
      });
  
      const totalMeals = analysisData[0].length;
      const nutritionPercentages = Object.keys(nutritionStats).map(nutrient => ({
        nutrient,
        percentage: ((nutritionStats[nutrient] / totalMeals) * 100).toFixed(2),
        target: rdi[nutrient] || 0,
      }));
  
      res.json({ chartData, nutritionPercentages });
  
    } catch (err) {
      console.error('Error fetching monthly analysis:', err);
      res.status(500).json({ message: 'Error fetching data for monthly analysis' });
    }
  });
  
  // Helper function to convert 'YYYY-MM' to 'Month Year'
  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };
  
  //geting Yearly meal analysis
  router.get('/doctor_analysis/yearly', async (req, res) => {
    // const email = req.session.email;
    const email = req.query.email; // Get email from query
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const keywords = ["Carbohydrates", "Proteins", "Vitamins", "Fats", "Energy", "Sugar", "Omega"];
    const rdi = { Carbohydrates: 50, Proteins: 20, Vitamins: 20, Fats: 10 }; // Mock RDI percentages
    
    try {
      const [mealData, analysisData] = await Promise.all([
        pool.promise().query(
          `SELECT 
             meal_name, 
             COUNT(*) AS meal_count, 
             YEAR(recommendation_date) AS year
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
           GROUP BY meal_name, year
           ORDER BY year DESC`,
          [email]
        ),
        pool.promise().query(
          `SELECT general_info, YEAR(recommendation_date) AS year
           FROM recommendations
           WHERE email = ?
           AND recommendation_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
           ORDER BY year DESC`,
          [email]
        ),
      ]);
  
      if (mealData[0].length === 0 || analysisData[0].length === 0) {
        return res.json({ noData: true });
      }
  
      // Meal Data Processing
      mealData[0].forEach(row => {
        row.meal_name = parseMealData(row.meal_name); // Applying the function here
      });
  
      const mealGroupedByYear = mealData[0].reduce((acc, row) => {
        const { meal_name, meal_count, year } = row;
        if (!acc[year]) acc[year] = {};
        acc[year][meal_name] = meal_count;
        return acc;
      }, {});
  
      const years = Object.keys(mealGroupedByYear);
      const mealNames = [...new Set(mealData[0].map(item => item.meal_name))];
      const mealCounts = mealNames.map(meal =>
        years.map(year => (mealGroupedByYear[year][meal] || 0))
      );
  
      const chartData = {
        labels: years,
        datasets: mealCounts.map((counts, index) => ({
          label: mealNames[index],
          data: counts,
          backgroundColor: `hsl(${(index * 50) % 360}, 70%, 60%)`, // Bars will have different colors
        })),
      };
  
      // Nutrition Data Processing (analysisData)
      const nutritionStats = keywords.reduce((acc, nutrient) => {
        acc[nutrient] = 0;
        return acc;
      }, {});
  
      analysisData[0].forEach(row => {
        keywords.forEach(nutrient => {
          if (row.general_info.includes(nutrient)) {
            nutritionStats[nutrient] += 1;
          }
        });
      });
  
      const totalMeals = analysisData[0].length;
      const nutritionPercentages = Object.keys(nutritionStats).map(nutrient => ({
        nutrient,
        percentage: ((nutritionStats[nutrient] / totalMeals) * 100).toFixed(2),
        target: rdi[nutrient] || 0,
      }));
  
      res.json({ chartData, nutritionPercentages });
  
    } catch (err) {
      console.error('Error fetching yearly analysis:', err);
      res.status(500).json({ message: 'Error fetching data for yearly analysis' });
    }
  });
  

  // History Route
  router.get("/history", async (req, res) => {
    const email = req.session.email;
  
    try {
      const [history] = await pool.promise().query(
        `SELECT meal_type, meal_name, recommendation_date 
         FROM recommendations WHERE email = ? ORDER BY recommendation_date DESC`,
        [email]
      );
  
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  module.exports = router;