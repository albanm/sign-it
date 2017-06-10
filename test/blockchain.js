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
        const logEvent = blockchain.currentContract.log()
        logEvent.watch((err, event) => {
          if (err) throw (err)
          console.log('contract log : ' + event.args.msg)
        })
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
    try {
      blockchain.web3.eth.estimateGas({ data, to: blockchain.currentContract.address, from: userAccount })
    } catch (err) {
      // console.log(err)
      cb()
    }
    throw new Error('should have failed')
  })

  /* it('should be able to sign a document as a known user', cb => {
    const data = blockchain.currentContract.sign.getData('testProvider', 'testUser', 'hashhashash')
    console.log(userAccount)
    blockchain.web3.eth.sendTransaction({
      data,
      from: userAccount,
      to: blockchain.currentContract.address,
      gas: blockchain.web3.eth.estimateGas({ data, to: blockchain.currentContract.address })
    }, (err, result) => {
      if (err) return cb(err)
      blockchain.web3.eth.getTransactionReceipt(result, (err, receipt) => {
        if (err) return cb(err)
        assert.ok(receipt.logs)
        console.log(receipt)
        cb(null)
      })
    })
  }) */
})
