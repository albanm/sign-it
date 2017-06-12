/* eslint-env mocha */
const assert = require('assert')
const blockchain = require('../server/blockchain')

let userAccount

describe('sign-it ethereum contract', () => {
  before(cb => {
    blockchain.init(() => {
      blockchain.web3.eth.getAccounts((err, accounts) => {
        if (err) return cb(err)
        userAccount = accounts[1]
        console.log('Test Account: ' + userAccount)
        const logCallback = (err, event) => {
          if (err) throw (err)
          console.log('contract log : ' + event.args.msg)
        }
        blockchain.currentContract.log().watch(logCallback)
        blockchain.currentContract.logBytes32().watch(logCallback)
        cb()
      })
    })
  })

  it('should have initialized an ethereum web3 client', cb => {
    assert.ok(userAccount)
    cb()
  })

  it('should sign a document as the bookkeeper', cb => {
    blockchain.sign('testProvider', 'testUser', 'hashhashash', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)
      cb()
    })
  })

  it('should sign a second a document as the bookkeeper', cb => {
    blockchain.sign('testProvider', 'testUser', 'hashhashash2', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)
      cb()
    })
  })

  it('should not be able to sign a document as anybody else', cb => {
    const data = blockchain.currentContract.sign.getData('testProvidertestUser', 'hashhashash')
    blockchain.transact(data, userAccount, err => {
      assert.ok(err)
      cb()
    })
  })

  it('should register then validate a user\'s identity', cb => {
    blockchain.registerUserId('testProvider', 'testUser', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      blockchain.validateUserId('testProvider', 'testUser', 'testSecret', (err, receipt) => {
        if (err) return cb(err)
        assert.ok(receipt.logs)
        cb()
      })
    })
  })

  it('should not be able to a user\'s identity without the right secret', cb => {
    blockchain.registerUserId('testProvider2', 'testUser2', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      blockchain.validateUserId('testProvider2', 'testUser2', 'BADSECRET', (err, receipt) => {
        assert.ok(err)
        cb()
      })
    })
  })

  it('should be able to sign a document as a known user', cb => {
    blockchain.registerUserId('testProvider3', 'testUser3', 'Alban', 'Mouton', 'Rennes', '28-11-1983', 'testSecret', (err, receipt) => {
      if (err) return cb(err)
      assert.ok(receipt.logs)

      const data = blockchain.currentContract.validateUserId.getData('testProvider3testUser3', 'testSecret')
      blockchain.transact(data, userAccount, (err, receipt) => {
        if (err) return cb(err)
        assert.ok(receipt.logs)

        const data = blockchain.currentContract.sign.getData('testProvider3testUser3', 'hashhashash')
        blockchain.transact(data, userAccount, (err, receipt) => {
          if (err) return cb(err)
          assert.ok(receipt.logs)
          cb()
        })
      })
    })
  })
})
