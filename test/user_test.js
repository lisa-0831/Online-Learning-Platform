require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");
const { pool } = require("../server/models/mysqlcon");

describe("user", () => {
  /*
   * Sign Up
   */

  it("sign up", async () => {
    const user = {
      name: "Luna",
      email: "luna@gmail.com",
      password: "test",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);

    const data = res.body.data;

    const userExpected = {
      id: data.user.id, // need id from returned data
      provider: "native",
      name: user.name,
      picture: "profile.png",
      email: user.email,
    };

    expect(data.user).to.deep.equal(userExpected);
    expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 1000);
  });

  it("sign up without name or email or password", async () => {
    const user1 = {
      email: "luna@gmail.com",
      password: "test",
    };

    const res1 = await requester.post("/api/1.0/user/signup").send(user1);

    expect(res1.statusCode).to.equal(400);

    const user2 = {
      name: "luna",
      password: "test",
    };

    const res2 = await requester.post("/api/1.0/user/signup").send(user2);

    expect(res2.statusCode).to.equal(400);

    const user3 = {
      name: "luna",
      email: "luna@gmail.com",
    };

    const res3 = await requester.post("/api/1.0/user/signup").send(user3);

    expect(res3.statusCode).to.equal(400);
  });

  it("sign up with existed email", async () => {
    const user = {
      name: users[0].name,
      email: users[0].email,
      password: "test",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);

    expect(res.statusCode).to.equal(403);
  });

  it("sign up with malicious email", async () => {
    const user = {
      name: users[0].name,
      email: "<script>alert(1)</script>",
      password: "password",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);

    expect(res.statusCode).to.equal(400);
  });

  /*
   * Native Sign In
   */

  it("native sign in with correct password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    const data = res.body.data;
    const userExpect = {
      id: data.user.id, // need id from returned data
      provider: user1.provider,
      name: user1.name,
      email: user1.email,
      picture: null,
    };

    expect(data.user).to.deep.equal(userExpect);
  });

  it("native sign in without email or password", async () => {
    const user1 = users[0];
    const userNoEmail = {
      password: user1.password,
      provider: "native",
    };

    const res1 = await requester.post("/api/1.0/user/signin").send(userNoEmail);

    expect(res1.status).to.equal(400);

    const userNoPassword = {
      email: user1.email,
      provider: "native",
    };

    const res2 = await requester
      .post("/api/1.0/user/signin")
      .send(userNoPassword);

    expect(res2.status).to.equal(400);
  });

  it("native sign in with wrong password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: "wrong password",
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    expect(res.status).to.equal(403);
  });

  it("native sign in with malicious password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: '" OR 1=1; -- ',
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    expect(res.status).to.equal(403);
  });
});
