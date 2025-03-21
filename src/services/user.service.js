const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async createUser(userData) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password = hashedPassword;

    return await userRepository.create(userData);
  }

  async updateUser(id, userData) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // If updating email, check if new email is already taken
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(userData.email);
      if (userWithEmail) {
        throw new Error("Email already in use");
      }
    }

    // If updating password, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    return await userRepository.update(id, userData);
  }

  async deleteUser(id) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    return await userRepository.delete(id);
  }

  /**
   * Mendapatkan daftar user dengan filter dan pagination
   * @param {Object} options - Filter dan pagination options
   * @returns {Promise<{users: Array, pagination: Object}>}
   */
  async getUsersWithFilters(options) {
    const result = await userRepository.findWithFilters(options);

    return {
      users: result.users,
      pagination: {
        total: result.totalUsers,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: options.limit || 10,
      },
    };
  }
}

module.exports = new UserService();
