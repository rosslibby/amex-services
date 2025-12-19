async function getEventById(eventId) {
  return fetch(`http://event.com/getEventById/${eventId}`)
    .then((res) => res.json())
    .catch((err) => { throw new Error(err) });
}

module.exports = { getEventById };
