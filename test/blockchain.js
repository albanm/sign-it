/* eslint-env mocha */
const assert = require('assert')
const blockchainServer = require('../server/blockchain')
const blockchainCommon = require('../blockchain')

let userAccount

describe('sign-it ethereum contract', () => {
  before(function(cb) {
    this.timeout(5000)
    blockchainServer.init((err) => {
      if (err) return cb(err)
      blockchainCommon.web3.eth.getAccounts((err, accounts) => {
        if (err) return cb(err)
        userAccount = accounts[1]
        console.log('Test Account: ' + userAccount)
        const logCallback = (err, event) => {
          if (err) throw (err)
          console.log('contract log : ' + event.args.msg)
        }
        blockchainCommon.currentContract.log().watch(logCallback)
        blockchainCommon.currentContract.logBytes32().watch(logCallback)
        cb()
      })
    })
  })

  it('should have initialized an ethereum web3 client', cb => {
    assert.ok(userAccount)
    cb()
  })

  it('should sign a document as the bookkeeper', cb => {
    blockchainCommon.sign('testProvider', 'testUser', 'hashhashash', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)
      cb()
    })
  })

  it('should sign a second a document as the bookkeeper', cb => {
    blockchainCommon.sign('testProvider', 'testUser', 'hashhashash2', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)
      cb()
    })
  })

  it('should not be able to sign a document as anybody else', cb => {
    const data = blockchainCommon.currentContract.sign.getData('testProvidertestUser', 'hashhashash')
    blockchainCommon.transact(data, userAccount, err => {
      assert.ok(err)
      cb()
    })
  })

  it('should register then validate a user\'s identity', cb => {
    blockchainCommon.registerUserId('testProvider', 'testUser', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      blockchainCommon.validateUserId('testProvider', 'testUser', 'testSecret', (err, receipt) => {
        if (err) return cb(err)
        assert.ok(receipt.logs)
        cb()
      })
    })
  })

  it('should not be able to a user\'s identity without the right secret', cb => {
    blockchainCommon.registerUserId('testProvider2', 'testUser2', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      blockchainCommon.validateUserId('testProvider2', 'testUser2', 'BADSECRET', (err, receipt) => {
        assert.ok(err)
        cb()
      })
    })
  })

  it('should be able to sign a document as a known user', cb => {
    blockchainCommon.registerUserId('testProvider3', 'testUser3', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      const data = blockchainCommon.currentContract.validateUserId.getData('testProvider3testUser3', 'testSecret')
      blockchainCommon.transact(data, userAccount, (err, receipt) => {
        if (err) return cb(err)
        assert.ok(receipt.logs)

        const data = blockchainCommon.currentContract.sign.getData('testProvider3testUser3', 'hashhashash')
        blockchainCommon.transact(data, userAccount, (err, receipt) => {
          if (err) return cb(err)
          assert.ok(receipt.logs)
          cb()
        })
      })
    })
  })
})
