// Modified: src/repositories/user.repository.js (sebagai contoh)
const { connectDB, sql } = require("../config/db");
const User = require("../models/user.model");
const { logger } = require("../config/logger");

class UserRepository {
  async findAll() {
    try {
      logger.debug("Fetching all users");
      const pool = await connectDB();
      const result = await pool.request().query("SELECT * FROM users");
      logger.debug(`Retrieved ${result.recordset.length} users`);
      return result.recordset.map(User.fromDB);
    } catch (error) {
      logger.error("Error fetching users", { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      logger.debug(`Fetching user with id ${id}`);
      const pool = await connectDB();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM users WHERE id = @id");

      if (result.recordset.length === 0) {
        logger.debug(`User with id ${id} not found`);
        return null;
      }

      logger.debug(`Retrieved user with id ${id}`);
      return User.fromDB(result.recordset[0]);
    } catch (error) {
      logger.error(`Error fetching user with id ${id}`, {
        error: error.message,
      });
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      logger.debug(`Fetching user with email ${email}`);
      const pool = await connectDB();
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query("SELECT * FROM users WHERE email = @email");

      if (result.recordset.length === 0) {
        logger.debug(`User with email ${email} not found`);
        return null;
      }

      logger.debug(`Retrieved user with email ${email}`);
      return User.fromDB(result.recordset[0]);
    } catch (error) {
      logger.error(`Error fetching user with email ${email}`, {
        error: error.message,
      });
      throw error;
    }
  }

  async create(user) {
    try {
      logger.debug("Creating new user", { email: user.email });
      const pool = await connectDB();
      const result = await pool
        .request()
        .input("username", sql.VarChar, user.username)
        .input("email", sql.VarChar, user.email)
        .input("password", sql.VarChar, user.password)
        .input("role", sql.VarChar, user.role).query(`
          INSERT INTO users (username, email, password, role, created_at)
          OUTPUT INSERTED.*
          VALUES (@username, @email, @password, @role, GETDATE())
        `);

      logger.info("User created successfully", {
        id: result.recordset[0].id,
        email: user.email,
      });

      return User.fromDB(result.recordset[0]);
    } catch (error) {
      logger.error("Error creating user", {
        error: error.message,
        email: user.email,
      });
      throw error;
    }
  }

  async update(id, userData) {
    try {
      logger.debug(`Updating user with id ${id}`);
      const pool = await connectDB();
      const updateFields = [];
      const request = pool.request().input("id", sql.Int, id);

      // Build dynamic update query
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && key !== "id") {
          updateFields.push(`${key} = @${key}`);
          request.input(key, sql.VarChar, value);
        }
      });

      if (updateFields.length === 0) {
        const error = new Error("No fields to update");
        logger.warn(`No fields to update for user ${id}`);
        throw error;
      }

      const query = `
        UPDATE users 
        SET ${updateFields.join(", ")}
        OUTPUT INSERTED.*
        WHERE id = @id
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        logger.warn(`User with id ${id} not found during update`);
        return null;
      }

      logger.info(`User with id ${id} updated successfully`);
      return User.fromDB(result.recordset[0]);
    } catch (error) {
      logger.error(`Error updating user with id ${id}`, {
        error: error.message,
      });
      throw error;
    }
  }

  async delete(id) {
    try {
      logger.debug(`Deleting user with id ${id}`);
      const pool = await connectDB();
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM users WHERE id = @id");

      const deleted = result.rowsAffected[0] > 0;

      if (deleted) {
        logger.info(`User with id ${id} deleted successfully`);
      } else {
        logger.warn(`User with id ${id} not found during delete`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Error deleting user with id ${id}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mencari user dengan pagination dan filter
   * @param {Object} options - Filter dan pagination options
   * @param {number} options.page - Halaman yang diinginkan
   * @param {number} options.limit - Jumlah item per halaman
   * @param {string} options.search - Pencarian berdasarkan username atau email
   * @param {string} options.role - Filter berdasarkan role
   * @returns {Promise<{users: Array, totalUsers: number, totalPages: number, currentPage: number}>}
   */
  async findWithFilters(options) {
    try {
      const { page = 1, limit = 10, search = "", role = "" } = options;

      logger.debug("Finding users with filters", { options });

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build query and request
      const pool = await connectDB();
      let query = `
      SELECT * FROM users
      WHERE 1=1
    `;

      let countQuery = `
      SELECT COUNT(*) as total FROM users
      WHERE 1=1
    `;

      const request = pool.request();
      const countRequest = pool.request();

      // Add search filter if provided
      if (search) {
        query += ` AND (username LIKE @search OR email LIKE @search)`;
        countQuery += ` AND (username LIKE @search OR email LIKE @search)`;

        const searchParam = `%${search}%`;
        request.input("search", sql.VarChar, searchParam);
        countRequest.input("search", sql.VarChar, searchParam);
      }

      // Add role filter if provided
      if (role) {
        query += ` AND role = @role`;
        countQuery += ` AND role = @role`;

        request.input("role", sql.VarChar, role);
        countRequest.input("role", sql.VarChar, role);
      }

      // Add pagination
      query += `
      ORDER BY id
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

      request.input("offset", sql.Int, offset);
      request.input("limit", sql.Int, limit);

      // Execute queries
      const [usersResult, countResult] = await Promise.all([
        request.query(query),
        countRequest.query(countQuery),
      ]);

      const users = usersResult.recordset.map(User.fromDB);
      const totalUsers = countResult.recordset[0].total;
      const totalPages = Math.ceil(totalUsers / limit);

      logger.debug(`Found ${users.length} users out of ${totalUsers} total`);

      return {
        users,
        totalUsers,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      logger.error("Error finding users with filters", {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new UserRepository();
