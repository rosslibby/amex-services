const selectUserId = (
  users = [
    '68f80eb5-8e90-471c-a426-fafa67badcc3',
    'cac3e9c3-c9a1-4d0d-a0b2-8369884b6e27',
    'e25ec7f1-7570-40ee-9c58-2d64d48b9b05',
  ],
) => users[Math.floor(Math.random() * users.length)];

const getEventDetails = async () => fetch('https://jsonplaceholder.typicode.com/comments')
  .then((res) => res.json())
  .then((comments) => {
    const {
      name,
      body: details,
    } = comments[Math.floor(Math.random() * comments.length)];

    return { userId: selectUserId(), name, details };
  })

async function addEvent() {
  const event = await getEventDetails();
  console.log(`\n\nSubmitting event:`, event)
  await fetch('http://localhost:3000/addEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  }).then((res) => res.json())
    .then((data) => data.success ? console.log(data) : console.error(data));
}

async function addMultipleEvents(count = 1) {
  for (let i = 0; i < count; i++) {
    await addEvent();
  }
}

const [,,count] = process.argv;
addMultipleEvents(count);
