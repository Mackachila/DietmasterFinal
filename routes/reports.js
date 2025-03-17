const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { pool } = require('../config/db');


// Insert medical report
router.post("/insert-report", async (req, res) => {
    if (!req.session.reg_number) return res.status(401).json({ message: "Unauthorized" });

    const { email, title, category, content } = req.body;
    const withWhom = req.session.reg_number;
    const report_id = uuidv4();

    try {
        // Check if the provided email exists in 'demantia_users'
        const [userResult] = await pool.promise().query(
            "SELECT email FROM dietmaster_members WHERE email = ?",
            [email]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found. Please check the email and try again." });
        }

        // Fetch username where email = req.session.email
        const [sessionUserResult] = await pool.promise().query(
            "SELECT username FROM doctors WHERE reg_number = ?",
            [withWhom]
        );

        if (sessionUserResult.length === 0) {
            return res.status(404).json({ message: "Seems you are not a doctor." });
        }

        const username = sessionUserResult[0].username; // Extract username of the logged-in user

        // Insert the report with the username of the logged-in user
        await pool.promise().query(
            "INSERT INTO reports (report_id, email, doctor, sender_id, title, category, content) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [report_id,  email, username, withWhom, title, category, content]
        );

        res.json({ message: "Medical report updated successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});




// // Fetch reports sent by the logged-in user (as sender)
// router.get("/fetch-sent-reports", async (req, res) => {
//     if (!req.session.reg_number) return res.status(401).json({ message: "Unauthorized" });

//     const sender_id = req.session.reg_number;

//     try {
//         const [reports] = await pool.promise().query(
//             "SELECT * FROM reports WHERE sender_id = ? ORDER BY date DESC",
//             [sender_id]
//         );

//         res.json(reports);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Database error" });
//     }
// });

// Fetch reports sent by the logged-in user (as sender) with pagination
router.get("/fetch-sent-reports", async (req, res) => {
    if (!req.session.reg_number) return res.status(401).json({ message: "Unauthorized" });

    const sender_id = req.session.reg_number;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    try {
        // First, get the total count of reports
        const [countResult] = await pool.promise().query(
            "SELECT COUNT(*) AS total FROM reports WHERE sender_id = ?",
            [sender_id]
        );
        
        const totalReports = countResult[0].total;
        const totalPages = Math.ceil(totalReports / limit);
        
        // Then fetch the paginated reports
        const [reports] = await pool.promise().query(
            "SELECT * FROM reports WHERE sender_id = ? ORDER BY date DESC LIMIT ? OFFSET ?",
            [sender_id, limit, offset]
        );

        // Return both the reports and pagination metadata
        res.json({
            reports,
            currentPage: page,
            totalPages,
            totalReports,
            reportsPerPage: limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});

// Fetch reports sent by the logged-in user (as sender) with pagination
router.get("/fetch-usersent-reports", async (req, res) => {
    if (!req.session.email) return res.status(401).json({ message: "Unauthorized" });

    const email = req.session.email;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    try {
        // First, get the total count of reports
        const [countResult] = await pool.promise().query(
            "SELECT COUNT(*) AS total FROM reports WHERE email = ?",
            [email]
        );
        
        const totalReports = countResult[0].total;
        const totalPages = Math.ceil(totalReports / limit);
        
        // Then fetch the paginated reports
        const [reports] = await pool.promise().query(
            "SELECT * FROM reports WHERE email = ? ORDER BY date DESC LIMIT ? OFFSET ?",
            [email, limit, offset]
        );

        // Return both the reports and pagination metadata
        res.json({
            reports,
            currentPage: page,
            totalPages,
            totalReports,
            reportsPerPage: limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});

// Server-side routes for report management

// Edit report route
router.put("/edit-report/:id", async (req, res) => {
    if (!req.session.reg_number) return res.status(401).json({ message: "Unauthorized" });

    const reportId = req.params.id;
    const sender_id = req.session.reg_number;
    const { title, category, content } = req.body;
    console.log("The report id is", reportId);

    // Validate input
    if (!title || !category || !content) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // First, check if this report belongs to the current user
        const [report] = await pool.promise().query(
            "SELECT * FROM reports WHERE report_id = ? AND sender_id = ?",
            [reportId, sender_id]
        );

        if (report.length === 0) {
            return res.status(403).json({ message: "You don't have permission to edit this report" });
        }

        // Update the report
        await pool.promise().query(
            "UPDATE reports SET title = ?, category = ?, content = ? WHERE report_id = ?",
            [title, category, content, reportId]
        );

        res.json({ message: "Report updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});

// Delete report route
router.delete("/delete-report/:id", async (req, res) => {
    if (!req.session.reg_number) return res.status(401).json({ message: "Unauthorized" });

    const reportId = req.params.id;
    const sender_id = req.session.reg_number;

    try {
        // First, check if this report belongs to the current user
        const [report] = await pool.promise().query(
            "SELECT * FROM reports WHERE report_id = ? AND sender_id = ?",
            [reportId, sender_id]
        );

        if (report.length === 0) {
            return res.status(403).json({ message: "You don't have permission to delete this report" });
        }

        // Delete the report
        await pool.promise().query(
            "DELETE FROM reports WHERE report_id = ?",
            [reportId]
        );

        res.json({ message: "Report deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});



// Fetch reports sent by the logged-in user (as sender)
router.get("/fetch-sent-reports2", async (req, res) => {
    if (!req.session.email) return res.status(401).json({ message: "Unauthorized" });

    const senderEmail = req.session.email;

    try {
        const [reports2] = await pool.promise().query(
            "SELECT * FROM reports WHERE email = ? ORDER BY date DESC",
            [senderEmail]
        );

        res.json(reports2);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});



// Update a report (only the sender can update)
router.post("/update-report", async (req, res) => {
    if (!req.session.email) return res.status(401).json({ message: "Unauthorized" });

    const { report_id, description, status } = req.body;
    const senderEmail = req.session.email;

    try {
        // Ensure the report exists and was sent by the logged-in user
        const [report] = await pool.promise().query(
            "SELECT * FROM reports WHERE report_id = ? AND withWhom = ?",
            [report_id, senderEmail]
        );

        if (report.length === 0) {
            return res.status(403).json({ message: "You can only edit reports you sent." });
        }

        // Update report
        await pool.promise().query(
            "UPDATE reports SET description = ?, status = ? WHERE report_id = ?",
            [description, status, report_id]
        );

        res.json({ message: "Report updated successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});


module.exports = router;