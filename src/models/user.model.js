// src/models/user.model.js

export class UserModel {
  constructor() {
    this.users = [];
  }

  async findByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  async create(data) {
    const newUser = {
      id: this.users.length + 1,
      ...data,
    };

    this.users.push(newUser);
    return newUser;
  }
}
