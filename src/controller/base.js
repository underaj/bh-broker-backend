const jwt = require('jsonwebtoken');
module.exports = class extends think.Controller {
  __before() {
    if (this.ctx.config("allowUrls").indexOf(this.ctx.url) === -1) {
      if (!this.ctx.request.header.authorization) {
        this.fail(401, "没有认证");
        return false;
      } else {
        let payload = null;
        const authorization = this.ctx.request.header.authorization;
        const secret = this.ctx.config("secret");
        payload = jwt.verify(authorization, secret);
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          this.fail(401, "认证已过时效");
          return false;
        }
        if (!payload.user) {
          this.fail(401, "没有认证");
          return false;
        }
      }
    }
  }
};
