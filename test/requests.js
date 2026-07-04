import autocannon from "autocannon";

autocannon(
  {
    title: "stress test",
    url: "http://localhost:3001/test",
    connections: 50,
    duration: 20,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "nazir",
      age: 28,
      email: "test@test.com",
      password: "123456",
    }),
  },
  (err, result) => {
    if (err) console.error(err);
    console.log(result);
    console.log("Finished test");
  }
);
