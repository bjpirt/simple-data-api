const pass = 'passw0rd';
const user = 'testuser';
const jwt_secret = 'abc123';
const pass_hash = '$2a$12$5MiljTrwVi6Y/CjfjcTrMObsSFnTUV4/LlqoHB8YbeFxhnfBrClNa';
const loginData = { user, pass_hash, jwt_secret };
const login = require('../../lib/use-cases/Login')({ loginData });
const jwt = require('jsonwebtoken');

describe('Login', () => {
  it("should return a token with a 1 week expiry", async () => {
    const result = await login({user, pass});
    expect(result).toHaveProperty('token');
    const decoded = jwt.verify(result.token, jwt_secret);
    expect(decoded.scope).toEqual('user');
    expect(decoded.exp - decoded.iat).toBe(7 * 86400);
  });

  it("should return a valid JWT token", async () => {
    const result = await login({user, pass});
    expect(result).toHaveProperty('token');
  });

  it("should throw an unauthorized error if the user is wrong", async () => {
    let thrown = false;
    try{
      await login({user: "baduser", pass});
      expect(true).toBe(false);
    }catch(err){
      thrown = err;
    }
    expect(thrown).toBe('Unauthorized');
  });

  it("should throw an unauthorized error if the password is wrong", async () => {
    let thrown = false;
    try{
      await login({user, pass: 'badpass'});
      expect(true).toBe(false);
    }catch(err){
      thrown = err;
    }
    expect(thrown).toBe('Unauthorized');
  });
});