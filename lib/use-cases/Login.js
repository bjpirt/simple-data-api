const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function (options, useCases) {
  
  return async (loginData) => {
    const validPassword = await bcrypt.compare(loginData.pass, options.loginData.pass_hash);
    if(loginData.user === options.loginData.user && validPassword){
      const payload = {scope: 'user'}
      const token = jwt.sign(payload, options.loginData.jwt_secret, { expiresIn: '7d' });
      return { token };
    }else{
      throw('Unauthorized');
    }
  }
}
