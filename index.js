const blockchain = require('./server/blockchain')

blockchain.init(err => {
  if (err) throw err
  blockchain.getBalance((err, balance) => {
    if (err) throw err
    console.log('Balance : ', balance)

    blockchain.estimateGas('provider1', 'user1', 'hash1', (err, gas) => {
      if (err) throw err
      console.log('Estimated gas cost : ', gas)

      blockchain.sign('provider1', 'user1', 'hash1', (err, receipt) => {
        if (err) throw err
        console.log('Transaction receipt : ', receipt)
      })
    })
  })
})
