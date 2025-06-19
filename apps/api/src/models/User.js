/**
 * User Model
 * Enterprise-level user management with comprehensive validation and security
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * User model definition
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Unique user identifier'
  },
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'Name must be between 2 and 100 characters'
      },
      notEmpty: {
        msg: 'Name is required'
      }
    },
    comment: 'User full name'
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'users_email_unique',
      msg: 'Email address already exists'
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    },
    comment: 'User email address (unique)'
  },
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [8, 255],
        msg: 'Password must be at least 8 characters long'
      },
      notEmpty: {
        msg: 'Password is required'
      }
    },
    comment: 'Encrypted user password'
  },
  
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Avatar must be a valid URL'
      }
    },
    comment: 'User profile picture URL'
  },
  
  role: {
    type: DataTypes.ENUM('user', 'admin', 'master'),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin', 'master']],
        msg: 'Role must be user, admin, or master'
      }
    },
    comment: 'User permission level'
  },
  
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'suspended', 'pending']],
        msg: 'Status must be active, inactive, suspended, or pending'
      }
    },
    comment: 'Account status'
  },
  
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Bio cannot exceed 1000 characters'
      }
    },
    comment: 'User biography'
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Location cannot exceed 100 characters'
      }
    },
    comment: 'User location'
  },
  
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Email verification timestamp'
  },
  
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Failed login attempts cannot be negative'
      }
    },
    comment: 'Security: count of failed login attempts'
  },
  
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Account lock expiration timestamp'
  },
  
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Password reset token'
  },
  
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Password reset token expiration'
  },
  
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'User preferences and settings'
  }
}, {
  tableName: 'users',
  paranoid: true, // Soft deletes
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique_idx'
    },
    {
      fields: ['role'],
      name: 'users_role_idx'
    },
    {
      fields: ['status'],
      name: 'users_status_idx'
    },
    {
      fields: ['last_login_at'],
      name: 'users_last_login_idx'
    }
  ],
  defaultScope: {
    attributes: { exclude: ['password', 'password_reset_token'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    },
    active: {
      where: { status: 'active' }
    },
    admins: {
      where: { role: ['admin', 'master'] }
    }
  }
});

/**
 * Instance Methods
 */

/**
 * Verify password against hash
 */
User.prototype.verifyPassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      throw new Error('Password not loaded. Use withPassword scope.');
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password verification failed');
  }
};

/**
 * Check if account is locked
 */
User.prototype.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

/**
 * Increment failed login attempts
 */
User.prototype.incrementFailedAttempts = async function() {
  // If first failed attempt or account is not yet locked
  if (this.failed_login_attempts === 0 || !this.isLocked()) {
    const updates = { failed_login_attempts: this.failed_login_attempts + 1 };
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failed_login_attempts + 1 >= 5) {
      updates.locked_until = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    
    return this.update(updates);
  }
};

/**
 * Reset failed login attempts
 */
User.prototype.resetFailedAttempts = async function() {
  return this.update({
    failed_login_attempts: 0,
    locked_until: null
  });
};

/**
 * Update last login timestamp
 */
User.prototype.updateLastLogin = async function() {
  return this.update({ last_login_at: new Date() });
};

/**
 * Get safe user data (without sensitive fields)
 */
User.prototype.toSafeJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  delete values.failed_login_attempts;
  delete values.locked_until;
  return values;
};

/**
 * Check if user has permission
 */
User.prototype.hasRole = function(role) {
  const roleHierarchy = ['user', 'admin', 'master'];
  const userRoleIndex = roleHierarchy.indexOf(this.role);
  const requiredRoleIndex = roleHierarchy.indexOf(role);
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Model Hooks
 */

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Normalize email before saving
User.beforeSave((user) => {
  if (user.changed('email')) {
    user.email = user.email.toLowerCase().trim();
  }
});

// Validate password strength (only on creation or password change)
User.beforeValidate((user) => {
  if (user.changed('password') && user.password) {
    const password = user.password;
    
    // Password strength requirements
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }
});

/**
 * Class Methods
 */

/**
 * Find user by email with password
 */
User.findByEmail = function(email) {
  return this.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });
};

/**
 * Find active users
 */
User.findActive = function(options = {}) {
  return this.scope('active').findAll(options);
};

/**
 * Find administrators
 */
User.findAdmins = function(options = {}) {
  return this.scope('admins').findAll(options);
};

module.exports = User; 