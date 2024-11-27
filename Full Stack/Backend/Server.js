const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'defaultSecretKey';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'HRMSYSTEM',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Centralized Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Login Route
// app.post('/login', async (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: "Email and password are required" });
//     }

//     try {
//         const [rows] = await db.query(`SELECT * FROM Employee WHERE email = ?`, [email]);
//         if (rows.length === 0) {
//             return res.status(401).json({ message: 'User not found' });
//         }

//         const user = rows[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         const token = jwt.sign(
//             { id: user.employeeId, name: user.name, email: user.email },
//             SECRET_KEY,
//             { expiresIn: '1h' }
//         );
//         res.json({ message: 'Login successful', token });
//     } catch (error) {
//         next(error);
//     }
// });

// Login Route
app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Query to check for user
        const [rows] = await db.query('SELECT * FROM Employee WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.employeeId, name: user.name, email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Send response with user details and token
        res.json({
            message: 'Login successful',
            user: { id: user.employeeId, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        // Pass error to middleware
        next(error);
    }
});

// Add Employee with Salary
app.post('/addEmployeeWithSalary', async (req, res, next) => {
    const {
        name, password, email, departmentId, dateOfJoining, designationId,
        panNumber, phoneNumber, dob, basicSalary, hra, da, salaryGrade, bonus
    } = req.body;

    if (!name || !password || !email || !departmentId || !dateOfJoining ||
        !designationId || !dob || !basicSalary || !hra || !da || !salaryGrade) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        const [employeeResult] = await connection.query(
            `INSERT INTO Employee (name, password, email, departmentId, dateOfJoining, designationId, panNumber, phoneNumber, dob)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, hashedPassword, email, departmentId, dateOfJoining, designationId, panNumber || null, phoneNumber || null, dob]
        );

        const employeeId = employeeResult.insertId;

        await connection.query(
            `INSERT INTO Salary (employeeId, basicSalary, hra, da, salaryGrade, bonus)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employeeId, basicSalary, hra, da, salaryGrade, bonus || 0.0]
        );

        await connection.commit();
        res.status(201).json({ message: "Employee and salary added successfully", employeeId });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// Fetch Employees
app.get('/employees', async (req, res, next) => {
    try {
        const [employees] = await db.query(
            `SELECT e.employeeId, e.name, e.email, e.departmentId, d.departmentName, 
             e.designationId, dg.designationName, e.panNumber, e.phoneNumber, e.dob, e.dateOfJoining 
             FROM Employee e
             LEFT JOIN Department d ON e.departmentId = d.departmentId
             LEFT JOIN Designations dg ON e.designationId = dg.designationId
             WHERE e.status = 'Active'`
        );
        res.json({ employees });
    } catch (error) {
        next(error);
    }
});

// Update Employee
app.put('/updateEmployee/:id', async (req, res, next) => {
  const { id } = req.params; // Employee ID from the route parameter
  const {
      name,
      email,
      departmentId,
      designationId,
      panNumber,
      phoneNumber,
      dob,
      dateOfJoining
  } = req.body;

  // Validation: Check for required fields
  if (!name || !email || !departmentId || !designationId || !dateOfJoining ) {
      return res.status(400).json({ message: "Name, Email, Department, Designation and Date of Joining are required." });
  }

  try {
      const [result] = await db.query(
          `UPDATE Employee
           SET name = ?, email = ?, departmentId = ?, designationId = ?, panNumber = ?, 
               phoneNumber = ?, dob = ?, dateOfJoining = ?
           WHERE employeeId = ?`,
          [name, email, departmentId, designationId, panNumber || null, phoneNumber || null, dob || null, dateOfJoining, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Employee not found or no changes made." });
      }

      res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
      next(error);
  }
});

// Delete (Mark as Inactive) Employee
app.delete('/deleteEmployee/:id', async (req, res, next) => {
  const { id } = req.params; // Employee ID from the route parameter

  try {
    const [result] = await db.query(
      `UPDATE Employee
       SET status = 'Inactive'
       WHERE employeeId = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found or already inactive." });
    }

    res.status(200).json({ message: "Employee status updated to inactive successfully." });
  } catch (error) {
    next(error);
  }
});


// Fetch all departments
app.get('/departments', async (req, res, next) => {
    try {
        const [departments] = await db.query(
            'SELECT departmentId, departmentName, description, status FROM Department'
        );
        res.json({ departments });
    } catch (error) {
        next(error);
    }
});

app.delete('/deleteDepartment/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM Department WHERE departmentId = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found or already deleted." });
    }

    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    // Pass error to the error-handling middleware
    next(error);
  }
});



// Fetch jobs
app.get('/jobs', async (req, res, next) => {
  try {
      const [jobs] = await db.query(
          `SELECT * FROM Recruitment`
      );
      res.json({ jobs });
  } catch (error) {
      next(error);
  }
});


// Add Job
app.post('/addJob', async (req, res, next) => {
  const { jobType, jobTitle, departmentId, numberOfOpenings, applicationId } = req.body;

  // Validation
  if (!jobType || !jobTitle || !departmentId || !numberOfOpenings) {
      return res.status(400).json({ message: "Job Type, Job Title, Department, and Number of Openings are required." });
  }

  try {
      const [result] = await db.query(
          `INSERT INTO Recruitment (jobType, jobTitle, departmentId, numberOfOpenings, applicationId, isActive)
           VALUES (?, ?, ?, ?, ?, TRUE)`,
          [jobType, jobTitle, departmentId, numberOfOpenings, applicationId || null]
      );
      res.status(201).json({ message: "Job added successfully.", jobId: result.insertId });
  } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
          res.status(400).json({ message: "Application ID must be unique." });
      } else {
          next(error);
      }
  }
});


// Update Job
app.put('/updateJob/:id', async (req, res, next) => {
  const { id } = req.params; // jobId
  const { jobType, jobTitle, departmentId, numberOfOpenings, applicationId, isActive } = req.body;

  // Validation
  if (!jobType || !jobTitle || !departmentId || !numberOfOpenings) {
      return res.status(400).json({ message: "Job Type, Job Title, Department, Number of Openings, and Active Status are required." });
  }

  try {
      const [result] = await db.query(
          `UPDATE Recruitment
           SET jobType = ?, jobTitle = ?, departmentId = ?, numberOfOpenings = ?, applicationId = ?, isActive = ?
           WHERE jobId = ?`,
          [jobType, jobTitle, departmentId, numberOfOpenings, applicationId || null, isActive, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Job not found." });
      }

      res.status(200).json({ message: "Job updated successfully." });
  } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
          res.status(400).json({ message: "Application ID must be unique." });
      } else {
          next(error);
      }
  }
});



// Update department details
app.put('/updateDepartment/:id', async (req, res, next) => {
  const departmentId = req.params.id;
  const { departmentName, description } = req.body;

  if (!departmentName) {
      return res.status(400).json({ message: 'Department name is required' });
  }

  try {
      const [result] = await db.query(
          `UPDATE Department
           SET departmentName = ?, description = ?
           WHERE departmentId = ?`,
          [departmentName, description, departmentId]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Department not found' });
      }
      res.status(200).json({ message: 'Department updated successfully' });
  } catch (error) {
      next(error);
  }
});

// Fetch all designations
app.get('/designations', async (req, res, next) => {
    try {
        const [designations] = await db.query(
            'SELECT designationId, designationName, description FROM Designations'
        );
        res.json({ designations });
    } catch (error) {
        next(error);
    }
});

// Add a new department
app.post('/addDepartment', async (req, res, next) => {
    const { departmentName, description } = req.body;

    if (!departmentName) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO Department (departmentName, description)
             VALUES (?, ?)`,
            [departmentName, description]
        );
        res.status(201).json({ message: 'Department added successfully', departmentId: result.insertId });
    } catch (error) {
        next(error);
    }
});

// Update department details
app.put('/updateDepartment/:id', async (req, res, next) => {
    const departmentId = req.params.id;
    const { departmentName, description } = req.body;

    if (!departmentName) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const [result] = await db.query(
            `UPDATE Department
             SET departmentName = ?, description = ?
             WHERE departmentId = ?`,
            [departmentName, description, departmentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json({ message: 'Department updated successfully' });
    } catch (error) {
        next(error);
    }
});

app.post('/addDesignation', async (req, res, next) => {
  const { designationName, description } = req.body;

  if (!designationName) {
      return res.status(400).json({ message: 'Department name is required' });
  }

  try {
      const [result] = await db.query(
          `INSERT INTO Designations (designationName, description)
           VALUES (?, ?)`,
          [designationName, description]
      );
      res.status(201).json({ message: 'Designations added successfully', designationId: result.insertId });
  } catch (error) {
      next(error);
  }
});

// Update Designation (PUT)
app.put('/updateDesignation/:id', async (req, res, next) => {
  const { id } = req.params;
  const { designationName, description } = req.body;

  if (!designationName) {
      return res.status(400).json({ message: 'Designation name is required' });
  }

  try {
      const [result] = await db.query(
          `UPDATE Designations
           SET designationName = ?, description = ?
           WHERE designationId = ?`,
          [designationName, description, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Designation not found' });
      }

      res.status(200).json({ message: 'Designation updated successfully' });
  } catch (error) {
      next(error);
  }
});

// Delete Designation (DELETE)
app.delete('/deleteDesignation/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
      const [result] = await db.query(
          `DELETE FROM Designations WHERE designationId = ?`,
          [id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Designation not found' });
      }

      res.status(200).json({ message: 'Designation deleted successfully' });
  } catch (error) {
      next(error);
  }
});

// Fetch all salaries
app.get('/salaries', async (req, res, next) => {
  try {
      const [salaries] = await db.query(
          `SELECT s.employeeId, e.name, e.email, s.basicSalary, s.hra, s.da, 
                  s.salaryGrade, s.bonus
           FROM Salary s
           INNER JOIN Employee e ON s.employeeId = e.employeeId`
      );
      res.json({ salaries });
  } catch (error) {
      next(error);
  }
});

// Update Salary
app.put('/updateSalary/:id', async (req, res, next) => {
  const { id } = req.params; // employeeId from the route parameter
  const { basicSalary, hra, da, salaryGrade, bonus } = req.body;

  // Validation
  if (!basicSalary || !hra || !da || !salaryGrade) {
      return res.status(400).json({ message: "Basic Salary, HRA, DA, and Salary Grade are required." });
  }

  try {
      const [result] = await db.query(
          `UPDATE Salary
           SET basicSalary = ?, hra = ?, da = ?, salaryGrade = ?, bonus = ?
           WHERE employeeId = ?`,
          [basicSalary, hra, da, salaryGrade, bonus || 0.0, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Salary record not found for this employee." });
      }

      res.status(200).json({ message: "Salary updated successfully." });
  } catch (error) {
      next(error);
  }
});


app.get('/attendance', async (req, res, next) => {
  try {
    const [records] = await db.query(
      `SELECT a.* 
       FROM Attendance a
       JOIN Employee e ON a.employeeId = e.employeeId
       WHERE e.status = 'Active'
       ORDER BY a.date DESC`
    );
    res.json({ records });
  } catch (error) {
    next(error);
  }
});



app.post('/addAttendance', async (req, res, next) => {
  const { employeeId, date, checkInTime, checkOutTime, lateArrival, earlyDeparture, shiftTime, workingHours } = req.body;

  if (!employeeId || !date || !checkInTime || !shiftTime) {
    return res.status(400).json({ message: "Employee ID, Date, Check-In Time, and Shift Time are required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Attendance (employeeId, date, checkInTime, checkOutTime, lateArrival, earlyDeparture, shiftTime, workingHours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, date, checkInTime, checkOutTime || null, lateArrival || false, earlyDeparture || false, shiftTime, workingHours || 0.0]
    );
    res.status(201).json({ message: "Attendance record added successfully.", attendanceId: result.insertId });
  } catch (error) {
    next(error);
  }
});

app.put('/updateAttendance/:id', async (req, res, next) => {
  const { id } = req.params;
  const { employeeId, date, checkInTime, checkOutTime, lateArrival, earlyDeparture, shiftTime, workingHours } = req.body;

  if (!employeeId || !date || !checkInTime || !shiftTime) {
    return res.status(400).json({ message: "Employee ID, Date, Check-In Time, and Shift Time are required." });
  }

  try {
    const [result] = await db.query(
      `UPDATE Attendance
       SET employeeId = ?, date = ?, checkInTime = ?, checkOutTime = ?, lateArrival = ?, earlyDeparture = ?, shiftTime = ?, workingHours = ?
       WHERE attendanceId = ?`,
      [employeeId, date, checkInTime, checkOutTime || null, lateArrival || false, earlyDeparture || false, shiftTime, workingHours || 0.0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.status(200).json({ message: "Attendance record updated successfully." });
  } catch (error) {
    next(error);
  }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
