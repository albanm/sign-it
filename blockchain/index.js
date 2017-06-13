const solc = require('solc')

const Web3 = require('web3')
const web3 = exports.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

let currentContract
exports.init = (source, address, cb) => {
  getAccount((err, account) => {
    if (err) return cb(err)
    web3.eth.defaultAccount = account

    const compiledContract = solc.compile(source, 1)
    if (compiledContract.errors && compiledContract.errors.length) throw new Error(JSON.stringify(compiledContract.errors))
    const abi = compiledContract.contracts[':SignatureBook'].interface
    const bytecode = compiledContract.contracts[':SignatureBook'].bytecode
    const MyContract = web3.eth.contract(JSON.parse(abi))

    if (address) {
      MyContract.at(address, (err, contract) => {
        if (err) return cb(err)
        currentContract = exports.currentContract = contract
        cb(null, currentContract)
      })
    } else {
      newContract(account, MyContract, bytecode, (err, contract) => {
        if (err) return cb(err)
        currentContract = exports.currentContract = contract
        cb(null, currentContract)
      })
    }
  })
}

function newContract(account, MyContract, data, cb) {
  const gasEstimate = web3.eth.estimateGas({ data })
  MyContract.new({
    from: account,
    data,
    gas: gasEstimate
  }, function(err, myContract) {
    if (err) return cb(err)

    // NOTE: The callback will fire twice!
    // Once the contract has the transactionHash property set and once its deployed on an address.

    if (myContract.address) {
      // check address on the second call (contract deployed)
      console.log('New contract address : ', myContract.address) // the contract address
      cb(null, myContract)
    }
  })
}

function getAccount(cb) {
  web3.eth.getAccounts((err, accounts) => {
    if (err) return cb(err)
    if (accounts.length < 1) return cb(new Error('There should be at least 1 account in the local node'))
    console.log('Account: ', accounts[0])
    cb(null, accounts[0])
  })
}

exports.transact = (data, from, cb) => {
  if (typeof from === 'function') {
    cb = from
    from = null
  }
  try {
    web3.eth.sendTransaction({
      data,
      to: currentContract.address,
      from,
      gas: web3.eth.estimateGas({ data, to: currentContract.address, from })
    }, (err, result) => {
      if (err) return cb(err)
      web3.eth.getTransactionReceipt(result, cb)
    })
  } catch (err) {
    cb(err)
  }
}

exports.sign = (idProvider, userId, docHash, cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))
  const data = currentContract.sign.getData(idProvider + userId, docHash)
  exports.transact(data, cb)
}

exports.registerUserId = (idProvider, userId, firstName, familyName, birthPlace, birthDate, secret, cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))
  const data = currentContract.registerUserId.getData(idProvider + userId, idProvider, userId, firstName, familyName, birthPlace, birthDate, secret)
  exports.transact(data, cb)
}

exports.validateUserId = (idProvider, userId, secret, cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))
  const data = currentContract.validateUserId.getData(idProvider + userId, secret)
  exports.transact(data, cb)
}

exports.getBalance = (cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))
  web3.eth.getBalance(web3.eth.coinbase, (err, balance) => {
    if (err) return cb(err)
    cb(null, balance.toNumber())
  })
}

exports.estimateGas = (idProvider, userId, docHash, cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))
  const data = currentContract.sign.getData(idProvider, userId, docHash)
  cb(null, web3.eth.estimateGas({ data, to: currentContract.address }))
}
