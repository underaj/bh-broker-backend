// production config, it will load in production enviroment
module.exports = {
  workers: 0,
  secret: 'bh-broker-auth-secret',
  allowUrls: ['/api/loginUser', '/api/checkUser']
};
