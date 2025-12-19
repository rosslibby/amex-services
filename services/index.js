const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');
const { getEventById } = require('./helpers');

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch('http://event.com/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    const resp = await fetch('http://event.com/addEvent', {
      method: 'POST',
      body: JSON.stringify({
        id: new Date().getTime(),
        ...request.body
      })
    });
    const data = await resp.json();
    reply.send(data);
  } catch(err) {
    reply.error(err);
  }
});

fastify.get('/getEvents', async (request, reply) => {  
    const resp = await fetch('http://event.com/getEvents');
    const data = await resp.json();
    reply.send(data);
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
