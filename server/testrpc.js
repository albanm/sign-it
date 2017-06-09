const TestRPC = require('ethereumjs-testrpc')
const server = module.exports = TestRPC.server({ total_accounts: 2 })
server.listen(8545, (err, blockchain) => {
  if (err) throw err
  console.log('TestRPC fake ethereum client is running')
  // console.log(blockchain)
})
