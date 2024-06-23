export class TokenBlacklistedError extends Error {
    constructor(message = 'The token is blacklisted') {
      super(message);
      this.name = 'TokenBlacklistedError';
    }
  }
  
  export class TokenExpiredError extends Error {
    constructor(message = 'The token has expired') {
      super(message);
      this.name = 'TokenExpiredError';
    }
  }
  
  export class TokenInvalidError extends Error {
    constructor(message = 'The token is invalid') {
      super(message);
      this.name = 'TokenInvalidError';
    }
  }
  