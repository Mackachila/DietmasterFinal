// Error fetching user info
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// SELECT User Data route
router.get('/get-doctor-user', (req, res) => {
  // const email = req.session.email;
  const reg_number = req.session.reg_number;
  // console.log("The reg number is", reg_number);
  // console.log("The email is", email);
  const query = 'SELECT username, email, contact FROM doctors WHERE reg_number = ?';

  pool.promise().execute(query, [reg_number])
    .then(([results]) => {
      if (results.length > 0) {
        return res.json(results[0]);
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(error => {
      console.error('Error fetching user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

//updating user details routes
router.post('/update-details', async (req, res) => {
    const { allergies, health, favorites, age } = req.body; 
    const userEmail = req.session.email; 
  
    if (!userEmail) {
        return res.status(401).json({ error: 'Unauthorized: Session expired or user not logged in.' });
    }
  
    try {
        const updates = [];
        const values = [];
  
        // Check for each field and only add to query if it's not empty or 'NO' (the user input)
        if (allergies && allergies !== 'NO') {
            updates.push('allergies = ?');
            values.push(allergies); // Add allergies value
        }
        if (health && health !== 'NO') {
            updates.push('health_conditions = ?');
            values.push(health); // Add health conditions value
        }
        if (favorites && favorites !== 'NO') {
            updates.push('favorite_meals = ?');
            values.push(favorites); // Add favorite meals value
        }
        if (age && age !== 'NO') {
            updates.push('child_age = ?');
            values.push(age); // Add child age value
        }
  
        // If we have any fields to update
        if (updates.length > 0) {
            // Build the dynamic query to update only the fields with values
            const query = `UPDATE doctors SET ${updates.join(', ')} WHERE email = ?`;
            values.push(userEmail); // Add email to the query parameters to target the correct user
  
            // Execute the query
            const [result] = await pool.promise().execute(query, values);
  
            return res.status(200).json({ message: 'Details updated successfully!', updatedRows: result.affectedRows });
        } else {
            res.status(400).json({ error: 'No valid data to update.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the details. Please try again later.' });
    }
  });
  
  //route to delete user details
  router.post('/delete-details', async (req, res) => {
    const deletionupdate = "No data";
    const userEmail = req.session.email; 
  
    if (!userEmail) {
        return res.status(401).json({ error: 'Unauthorized: Session expired or user not logged in.' });
    }
  
    try {
       
      // Build the dynamic query to update only the fields with insert into
      const deletequery = `UPDATE doctors SET allergies = ?, health_conditions = ?, favorite_meals = ?, child_age = ? WHERE email = ?`;
      await pool.promise().execute(deletequery, [deletionupdate, deletionupdate, deletionupdate, deletionupdate, userEmail]);
      return res.status(200).json({ message: 'Data successfully deleted!'});
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting data. Please try again later.' });
    }
  });
  
  //route to handle user data e.g allergies, health etc
  router.get('/docter-user-data', async (req, res) => {
    const userEmail = req.session.email;
  
    try {
        const [rows] = await pool.promise().query(
            'SELECT allergies, health_conditions, favorite_meals, child_age FROM doctors WHERE email = ?',
            [userEmail]
        ); 
  
        if (rows.length > 0) {
            const allergiesList = rows[0].allergies
                ? rows[0].allergies.split(',').map(item => item.trim())
                : [];
            const healthConditionsList = rows[0].health_conditions
            ? rows[0].health_conditions.split(',').map(item => item.trim())
            : [];
  
            const favoriteMealsList = rows[0].favorite_meals
                ? rows[0].favorite_meals.split(',').map(item => item.trim())
                : [];
  
            const ageList = rows[0].child_age
                ? rows[0].child_age.split(',').map(item => item.trim())
                : [];
  
            res.status(200).json({ allergies: allergiesList, health_conditions: healthConditionsList, favoriteMeals: favoriteMealsList, child_age: ageList });
        } else {
            res.status(200).json({ allergies: [], health_conditions: [], favoriteMeals: [], child_age: [] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching user data' });
    }
  });
  
  //premium subscription handling
  router.get('/get-usersubscription', (req, res) => {
    const { subscryption } = req.query; 
    const email = req.session.email;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required to check subscription.' });
    }
  
    if (subscryption !== 'Monthly' && subscryption !== 'Yearly') {
      return res.status(400).json({ error: 'Invalid subscription type. Must be "monthly" or "yearly".' });
    }
  
    // Define the query based on the subscription type
    let query;
    if (subscryption === 'Monthly') {
      query = `
        SELECT monthy_payment AS ballance
        FROM dietmaster_subscriptions
        WHERE email = ?;
      `;
    } else if (subscryption === 'Yearly') {
      query = `
        SELECT yearly_payment AS ballance
        FROM dietmaster_subscriptions
        WHERE email = ?;
      `;
    }
  
    // Execute the query using the connection pool
    pool.promise().execute(query, [email])
      .then(([results]) => {
        if (results.length > 0) {
          res.json({ ballance: results[0].ballance }); // Return the correct balance depending on subscription
        } else {
          res.status(404).json({ error: 'Subscription details could not be found for this email.' });
        }
      })
      .catch(error => {
        console.error('Error querying balance:', error);
        res.status(500).json({ error: 'Internal server error.' });
      });
  });
  
  
  
//user registration handling route
router.post('/doctor_registration', async (req, res) => {
  const { fullname, email, reg_number, contact, password } = req.body;

  try {
    // Check if the email already exists
    const validateEmail = `SELECT * FROM doctors WHERE email = ?`;
    const [emailResults] = await pool.promise().execute(validateEmail, [email]);

    if (emailResults.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Validate contact
    const validateContact = `SELECT * FROM doctors WHERE contact = ?`;
    const [contactResults] = await pool.promise().execute(validateContact, [contact]);

    if (contactResults.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered.' });
    }

    // Validate contact
    const validateRegNumber = `SELECT * FROM doctors WHERE reg_number = ?`;
    const [regResults] = await pool.promise().execute(validateRegNumber, [reg_number]);

    if (regResults.length > 0) {
      return res.status(400).json({ error: 'Registration number already exist.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    // const verificationToken = crypto.randomBytes(20).toString('hex');

    // // Prepare the email
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.gmail.com',
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: 'onlinelearningclas@gmail.com',
    //     pass: 'fjaxelsjzejciyhp',
    //   },
    //   connectionTimeout: 60000, // 60 seconds timeout for email connections
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    // });

    // const mailOptions = {
    //   from: 'no-reply@yourdomain.com',
    //   to: email,
    //   subject: 'DIET MASTER Account Verification',
    //   html: `
    //     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
    //       <h2 style="color: #007BFF; margin-bottom: 20px;">Welcome to DIET MASTER.</h2>
    //       <p style="font-size: 16px;">Please click the button below to verify your email address:</p>
    //       <a href="http://192.168.130.103:3000/activate/${verificationToken}"
    //          style="
    //            display: inline-block;
    //            padding: 10px 20px;
    //            margin: 20px auto;
    //            color: #fff;
    //            background-color: #28a745;
    //            text-decoration: none;
    //            font-size: 16px;
    //            border-radius: 5px;
    //          ">
    //         Activate your account
    //       </a>
    //       <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
    //     </div>
    //   `,
    // };

    // // Function to retry email sending
    // async function sendEmailWithRetry(mailOptions, retries = 3) {
    //   for (let attempt = 1; attempt <= retries; attempt++) {
    //     try {
    //       await transporter.sendMail(mailOptions);
    //       return; // Email sent successfully
    //     } catch (error) {
    //       console.error(`Attempt ${attempt} failed:`, error);
    //       if (attempt === retries) throw error; // Rethrow after max retries
    //     }
    //   }
    // }

    // // Send the email with retry logic
    // await sendEmailWithRetry(mailOptions);

    // Insert the user into the database only if email sending succeeds
    // const insertQuery = `INSERT INTO doctors (username, email, contact, password, verification_token) VALUES (?, ?, ?, ?, ?)`;
    // await pool.promise().execute(insertQuery, [fullname, email, contact, hashedPassword, verificationToken]);

    const insertQuery = `INSERT INTO doctors (username, email, contact, reg_number, password) VALUES (?, ?, ?, ?, ?)`;
    await pool.promise().execute(insertQuery, [fullname, email, contact, reg_number,  hashedPassword]);
    // Insert the user into the database only if email sending succeeds
    const insertSubscriptions = `INSERT INTO dietmaster_subscriptions (email) VALUES (?)`;
    await pool.promise().execute(insertSubscriptions, [email]);

    res.status(200).json({ message: 'Registration successful! Please check your email for an activation link.' });
  } catch (error) {
    console.error('Detailed error during registration:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ error: 'Could not complete registration due to a technical issue. Please try again later.' });
  }
});


  // //loging handling route
  // router.post('/doctor_login', async (req, res) => {
  //   try {
   
  //     const { login_email, reg_number, login_password } = req.body;
  
  //     // Validate input fields
  //     if (!login_email || !reg_number || !login_password) {
  //       return res.status(400).json({ error: 'All fields are required.' });
  //     }
  
  //     // Get a database connection
  //     pool.getConnection((err, connection) => {
  //       if (err) {
  //         console.error('Connection error:', err);
  //         return res.status(500).json({ error: 'Database connection error.' });
  //       }
  
  //       // Query the database
  //       const sql = `SELECT * FROM doctors WHERE email = ? AND reg_number = ?`;
  //       connection.query(sql, [login_email, reg_number], async (err, results) => {
  //         connection.release(); // Ensure connection is released
  
  //         if (err) {
  //           console.error('Query error:', err);
  //           return res.status(500).json({ error: 'Database query error.' });
  //         }
  
  //         if (results.length === 0) {
  //           return res.status(400).json({ error: 'Invalid credentials.' });
  //         }
  
  //         const user = results[0];
  
  //         // // Check email verification
  //         // if (!user.isVerified) {
  //         //   return res.status(400).json({ error: 'Please verify your email address first.' });
  //         // }
  
  //         // Validate password
  //         const match = await bcrypt.compare(login_password, user.password);
  //         if (!match) {
  //           return res.status(400).json({ error: 'Invalid credentials.' });
  //         }
  
  //         // Store email in session
  //         req.session.email = login_email;
  //         req.session.reg_number = reg_number;
           
  //         res.status(200).json({ message: 'Login successful!' });
  //       });
  //     });
  //   } catch (err) {
  //     console.error('Error during login:', err);
  //     res.status(500).json({ error: 'An error occurred during login.' });
  //   }
  // });

  router.post('/doctor_login', async (req, res) => {
    try {
      const { login_email, reg_number, login_password } = req.body;
  
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Connection error:', err);
          return res.status(500).json({ error: 'Database connection error.' });
        }
  
        const sql = `SELECT email, reg_number, password FROM doctors WHERE email = ? AND reg_number = ?`;
        connection.query(sql, [login_email, reg_number], async (err, results) => {
          connection.release();
  
          if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: 'Database query error.' });
          }
  
          if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials.' });
          }
  
          const user = results[0];
  
          // Validate password
          const match = await bcrypt.compare(login_password, user.password);
          if (!match) {
            return res.status(400).json({ error: 'Invalid credentials.' });
          }
  
         
          // Store correct values in session
          // req.session.email = user.email;
          req.session.reg_number = user.reg_number;
  
          
  
          req.session.save((err) => {
            if (err) {
              console.error('Session save error:', err);
              return res.status(500).json({ error: 'Session storage error.' });
            }
            res.status(200).json({ message: 'Login successful!' });
          });
        });
      });
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'An error occurred during login.' });
    }
  });
  


// Logout route
router.get('/doctor_logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.redirect('/home');
  });
});

module.exports = router;
