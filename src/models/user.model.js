class User {
  constructor(id, username, email, password, role, createdAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role || "user";
    this.createdAt = createdAt || new Date();
  }

  static fromDB(dbUser) {
    return new User(
      dbUser.id,
      dbUser.username,
      dbUser.email,
      dbUser.password,
      dbUser.role,
      dbUser.created_at
    );
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
