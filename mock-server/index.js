const { http, HttpResponse, delay } = require('msw');
const { setupServer } = require('msw/node');
const { userStore, eventStore } = require('./stores');
const users = require('./mocks/user.json');

let requestCount = 0;

// Provide the server-side API with the request handlers.
const server = setupServer(
  http.get('http://event.com/getUsers', () => {
    if (Math.random() < 0.05) {
      return HttpResponse.error(new Error('Server error occurred'));
    } 
    return HttpResponse.json(userStore.getUsers());
  }),

  http.get('http://event.com/getUserById/:id', ({params}) => {
    return HttpResponse.json(userStore.getUser(params.id))
  }),
  
  http.post('http://event.com/addEvent', async ({request}) => {
    requestCount++
    // Simulate a successful response for the first 5 requests
    if (requestCount <= 5 || requestCount == 0) {
      const requestBody = await request.json()
      const { id: eventId } = eventStore.addEvent(requestBody);
      userStore.addEventToUser(requestBody.userId, eventId);
      return HttpResponse.json({
        success: true
      });
    } 
    // Then fail for the next 10 requests
    else {
      if (requestCount >= 15) {
        requestCount = 0;
      }
      await delay(100)
      return HttpResponse.json({
        success: false,
        error: 'Service temporarily unavailable',
        message: 'Event API is experiencing high load'
      },{
        status: 503,
      })
    }
  }),
  http.get('http://event.com/getEvents', () => {
    if (Math.random() < 0.05) {
      return HttpResponse.error(new Error('Server error occurred'));
    } 
    return HttpResponse.json(eventStore.getEvents())
  }),
  http.get('http://event.com/getEventById/:id', async ({params}) => {
    await delay(500);
    return HttpResponse.json(eventStore.getEvent(params.id))
  }),
);

const listenMock = () => {
  // Start the interception.
  server.listen();
};

module.exports = listenMock;