const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');
const { logger } = require('../utils/logger');
const { createEventPayload, getEventById } = require('./helpers');
const { Resilience } = require('./resilience');

const resilience = new Resilience();

fastify.get('/getUsers', async (request, reply) => {
  return fetch('http://event.com/getUsers')
    .then((res) => res.json())
    .then((data) => reply.send(data))
    .catch((err) => { throw new Error(err) });
});

fastify.post('/addEvent', async (request, reply) => {
  /**
   * If system is consistently failing, determine whether
   * eligible to retry. If not, prevent the request and
   * send meaningful feedback to the user
   */
  if (resilience.failing && !resilience.shouldRetry()) {
    logger.warn([
      `🐞 [resilience:fail] Throwing error`,`--> Attempts: ${resilience.attempts}`,
      `--> Delay: ${resilience.retryDelayMs}ms`,
      `--> Since: ${Date.now() - resilience.failures[resilience.failures.length - 1]}`,
      `--> Remaining: ${resilience.retryDelayMs - (Date.now() - resilience.failures[resilience.failures.length - 1])}ms`,
    ].join('\n'));

    return reply.status(503).send({
      success: false,
      message: '⚠️ Event API is experiencing high load and is currently unavailable.',
      error: 'Service temporarily unavailable',
    });
  }

  try {
    const event = await createEventPayload(
      request.body.userId,
      request.body.name,
      request.body.details,
    );
    return fetch('http://event.com/addEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    }).then(resilience.detectFailure)
      .then((res) => res.json())
      .then((data) => reply.send(data))
      .catch((err) => { throw new Error(err) });
  } catch(err) {
    throw new Error(err);
  }
});

fastify.get('/getEvents', async (request, reply) => {  
  return fetch('http://event.com/getEvents')
    .then((res) => res.json())
    .then((data) => reply.send(data))
    .catch((err) => { throw new Error(err) });
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
    const { id } = request.params;
    return fetch(`http://event.com/getUserById/${id}`)
      .then((res) => res.json())
      .then(({ events }) => Promise.all(events.map(getEventById)))
      .then((events) => reply.send(events))
      .catch((err) => { throw new Error(err) });
});

fastify.listen({ port: 3000 }, (err) => {
    listenMock();
    if (err) {
      fastify.log.error(err);
      process.exit();
    }
});
