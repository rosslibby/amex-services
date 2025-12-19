const crypto = require('crypto');
const { logger } = require('../utils/logger');

const userStore = {
  users: {
    '68f80eb5-8e90-471c-a426-fafa67badcc3': {
      userName: 'user1',
      id: '68f80eb5-8e90-471c-a426-fafa67badcc3',
      email: 'hello@gmail.com',
      events: [ '6356fa2b-167e-48a3-84b5-40e6979832b3', 'f502041c-e701-4921-9823-9286df7c27f8' ]
    },
    'cac3e9c3-c9a1-4d0d-a0b2-8369884b6e27': {
      userName: 'user2',
      id: 'cac3e9c3-c9a1-4d0d-a0b2-8369884b6e27',
      email: 'hello2@gmail.com',
      events: [ '11432a24-23e9-4b52-9830-d45da7c027b8' ]
    },
    'e25ec7f1-7570-40ee-9c58-2d64d48b9b05': {
      userName: 'user3',
      id: 'e25ec7f1-7570-40ee-9c58-2d64d48b9b05',
      email: 'hello3@gmail.com',
      events: [ '35487d06-a6f8-41be-ad5f-3a8cf65be72c' ]
    }
  },
  addUser(username, email) {
    username = username.toLowerCase();
    email = email.toLowerCase();

    try {
      const emailExists = Object.values(this.users)
        .find((user) => user.email === email);

      if (emailExists) {
        throw new Error(`User with email ${email} is already registered.`);
      }

      const usernameExists = Object.values(this.users)
        .find(({ userName }) => userName === username);

      if (usernameExists) {
        throw new Error(`The username "${username}" is not available.`);
      }

      const userId = crypto.randomUUID();
      const user = {
        id: userId,
        userName: username,
        email,
        events: [],
      }
      this.users[userId] = user;
      return user;
    } catch (err) {
      logger.error(err)
      return null;
    }
  },
  getUser(id) {
    try {
      const user = this.users[id];

      if (!user) {
        throw new Error(`Unable to find user with ID ${id}`);
      }

      return user;
    } catch (err) {
      logger.error(err);
      return null;
    }
  },
  getUsers() {
    return Object.values(this.users);
  },
  addEventToUser(userId, eventId) {
    try {
      if (!this.users[userId]) {
        throw new Error(`Unable to find user with ID ${userId}`);
      }

      this.users[userId].events.push(eventId);
    } catch (err) {
      logger.error(err);
    }
  },
}

const eventStore = {
  events: {
    '6356fa2b-167e-48a3-84b5-40e6979832b3': {
      id: '6356fa2b-167e-48a3-84b5-40e6979832b3',
      name: 'Event 1',
      userId: '68f80eb5-8e90-471c-a426-fafa67badcc3',
      details: 'This is the first event'
    },
    '11432a24-23e9-4b52-9830-d45da7c027b8': {
      id: '11432a24-23e9-4b52-9830-d45da7c027b8',
      name: 'Event 2',
      userId: 'cac3e9c3-c9a1-4d0d-a0b2-8369884b6e27',
      details: 'This is the first event'
    },
    'f502041c-e701-4921-9823-9286df7c27f8': {
      id: 'f502041c-e701-4921-9823-9286df7c27f8',
      name: 'Event 1',
      userId: '68f80eb5-8e90-471c-a426-fafa67badcc3',
      details: 'This is the first event'
    },
    '35487d06-a6f8-41be-ad5f-3a8cf65be72c': {
      id: '35487d06-a6f8-41be-ad5f-3a8cf65be72c',
      name: 'Event 4',
      userId: 'e25ec7f1-7570-40ee-9c58-2d64d48b9b05',
      details: 'This is the first event'
    }
  },
  addEvent({ userId, name, details }) {
    try {
      if (!userStore.getUser(userId)) {
        throw new Error(`Unable to find user ${userId}`);
      }

      const eventId = crypto.randomUUID();
      const event = {
        id: eventId,
        userId,
        name,
        details,
      };

      this.events[eventId] = event;
      return event;
    } catch (err) {
      logger.error(err);
      return null;
    }
  },
  getEvent(id) {
    try {
      const event = this.events[id];

      if (!event) {
        throw new Error(`Unable to find event ${id}`);
      }

      return event;
    } catch (err) {
      logger.error(err);
      return null;
    }
  },
  getEvents() {
    return Object.values(this.events);
  },
};

module.exports = { userStore, eventStore };
