const crypto = require('crypto');

async function getEventById(eventId) {
  return fetch(`http://event.com/getEventById/${eventId}`)
    .then((res) => res.json())
    .catch((err) => { throw new Error(err) });
}

/**
 * I created this method in case I was NOT supposed to
 * touch the mock-service.
 * 
 * This event-creation method performs validation by
 * verifying that the passed userId is associated with
 * an existing user account.
 */
async function createEventPayload(userId, name, details) {
  // ensure the user exists
  return fetch(`http://event.com/getUserById/${userId}`)
    .then((res) => {
      if (res.status === 404) {
        throw new Error(`Unable to finder user with ID ${userId}`);
      } else {
        return res;
      }
    }).then(() => {
      const id = crypto.randomUUID();
      const event = { id, userId, name, details };
      return event;
    })
}


module.exports = { createEventPayload, getEventById };
