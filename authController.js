const User = require('../models/User');
const Employee = require('../models/Employee');

// Register new user — DISABLED (only Warehouse Manager can register employees)
exports.register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Registration is not allowed. Only the Warehouse Manager can register employees through the system. Please contact your Warehouse Manager.'
  });
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // 1. Try admin User collection first
    const user = await User.findOne({ username });

    if (user) {
      // Check password (direct comparison since no hashing)
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data (excluding password)
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        dashboardType: user.dashboardType,
        lastLogin: user.lastLogin
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });
    }

    // 2. Try Employee collection (login by employeeId)
    const employee = await Employee.findOne({ employeeId: username });

    if (employee) {
      // Check if employee is active
      if (employee.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact your administrator.'
        });
      }

      // Check password
      if (employee.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Return employee data with role 'user' for EmployeeManagementDashboard
      const employeeResponse = {
        id: employee._id,
        username: employee.employeeId,
        employeeId: employee.employeeId,
        email: employee.email,
        fullName: employee.name,
        phone: employee.phone || '',
        role: 'user',
        dashboardType: 'Employee Dashboard',
        lastLogin: new Date()
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: employeeResponse
      });
    }

    // 3. No match found in either collection
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, current password, and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
