/* global describe, it, before, expect */
/* jshint expr: true */

var VideoAskStrategy = require('../lib/strategy')

describe('Strategy#userProfile', function () {
  describe('fetched from default endpoint', function () {
    var strategy = new VideoAskStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
        scope: [ 'profile' ]
      },
      function () { }
    )

    strategy._oauth2.get = function (url, accessToken, callback) {
      if (url != 'https://api.videoask.com/me') {
        return callback(new Error('wrong url argument'))
      }
      if (accessToken != 'token') {
        return callback(new Error('wrong token argument'))
      }

      var body =
        '{ "username": "beardyman", "user_id": "aaaa-bbbb-cccc-dddd-eeee", "email": "beardy@typeform.com" }'
      callback(null, body, undefined)
    }

    var profile

    before(function (done) {
      strategy.userProfile('token', function (err, p) {
        if (err) {
          return done(err)
        }
        profile = p
        done()
      })
    })

    it('should parse profile', function () {
      expect(profile.provider).to.equal('videoask')

      expect(profile.email).to.equal('beardy@typeform.com')
      expect(profile.user_id).to.equal('aaaa-bbbb-cccc-dddd-eeee')
      expect(profile.username).to.equal('beardyman')
    })

    it('should set raw property', function () {
      expect(profile._raw).to.be.a('string')
    })

    it('should set json property', function () {
      expect(profile._json).to.be.an('object')
    })
  }) // fetched from default endpoint

  describe('fetched without account scope', function () {
    var strategy = new VideoAskStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function () { }
    )

    strategy._oauth2.get = function (url, accessToken, callback) {
      callback({ statusCode: 403 })
    }

    var err, profile
    before(function (done) {
      strategy.userProfile('token', function (e, p) {
        err = e
        profile = p
        done()
      })
    })

    it('should error', function () {
      expect(err.name).to.equal('InternalOAuthError')
      expect(err.message).to.equal('Failed to fetch user profile')
      expect(err.oauthError.statusCode).to.equal(403)
    })
  }) // fetched from default endpoint

  describe('error caused by invalid token', function () {
    var strategy = new VideoAskStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
        scope: [ 'profile' ]
      },
      function () { }
    )

    strategy._oauth2.get = function (url, accessToken, callback) {
      var body =
        '{"message":"Bad credentials","documentation_url":"https://developer.typeform.com"}'
      callback({ statusCode: 403, data: body })
    }

    var err, profile
    before(function (done) {
      strategy.userProfile('token', function (e, p) {
        err = e
        profile = p
        done()
      })
    })

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error)
      expect(err.constructor.name).to.equal('APIError')
      expect(err.message).to.equal('Bad credentials')
    })
  }) // error caused by invalid token

  describe('error caused by malformed response', function () {
    var strategy = new VideoAskStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
        scope: [ 'profile' ]
      },
      function () { }
    )

    strategy._oauth2.get = function (url, accessToken, callback) {
      var body = 'Hello, world.'
      callback(null, body, undefined)
    }

    var err, profile
    before(function (done) {
      strategy.userProfile('token', function (e, p) {
        err = e
        profile = p
        done()
      })
    })

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error)
      expect(err.message).to.equal('Failed to parse user profile')
    })
  }) // error caused by malformed response

  describe('internal error', function () {
    var strategy = new VideoAskStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
        scope: [ 'profile' ]
      },
      function () { }
    )

    strategy._oauth2.get = function (url, accessToken, callback) {
      return callback(new Error('something went wrong'))
    }

    var err, profile

    before(function (done) {
      strategy.userProfile('wrong-token', function (e, p) {
        err = e
        profile = p
        done()
      })
    })

    it('should error', function () {
      expect(err).to.be.an.instanceOf(Error)
      expect(err.constructor.name).to.equal('InternalOAuthError')
      expect(err.message).to.equal('Failed to fetch user profile')
      expect(err.oauthError).to.be.an.instanceOf(Error)
      expect(err.oauthError.message).to.equal('something went wrong')
    })

    it('should not load profile', function () {
      expect(profile).to.be.undefined
    })
  }) // internal error
})
