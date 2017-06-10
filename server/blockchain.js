const fs = require('fs')
const path = require('path')
const solc = require('solc')
const Web3 = require('web3')

const web3 = exports.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const source = fs.readFileSync(path.join(__dirname, 'signature-book.sol'), 'utf8')
const compiledContract = solc.compile(source, 1)
if (compiledContract.errors && compiledContract.errors.length) throw new Error(JSON.stringify(compiledContract.errors))
const abi = compiledContract.contracts[':SignatureBook'].interface
const bytecode = compiledContract.contracts[':SignatureBook'].bytecode

let currentContract
exports.init = cb => {
  getAccount((err, account) => {
    if (err) return cb(err)

    web3.eth.defaultAccount = account

    const MyContract = web3.eth.contract(JSON.parse(abi))
    const contractAddressPath = path.join(__dirname, '../data/contract-address.txt')

    fs.stat(contractAddressPath, (err, stats) => {
      if (err && err.code !== 'ENOENT') return cb(err)
      if (!err) {
        console.log('Reading contract address from ' + contractAddressPath)
        fs.readFile(contractAddressPath, 'utf8', (err, address) => {
          if (err) return cb(err)
          MyContract.at(address, (err, contract) => {
            if (err) return cb(err)
            currentContract = exports.currentContract = contract
            cb()
          })
        })
      } else {
        newContract(account, MyContract, (err, contract) => {
          if (err) return cb(err)
          currentContract = exports.currentContract = contract
          console.log('Writing contract address to ' + contractAddressPath)
          fs.writeFile(contractAddressPath, contract.address, 'utf8', cb)
        })
      }
    })
  })
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

exports.sign = (idProvider, userId, docHash, cb) => {
  if (!currentContract) return cb(new Error('Account and contract were not properly initialized to work with the blockchain'))

  const data = currentContract.sign.getData(idProvider + userId, docHash)
  web3.eth.sendTransaction({
    data,
    to: currentContract.address,
    gas: web3.eth.estimateGas({ data, to: currentContract.address })
  }, (err, result) => {
    if (err) return cb(err)
    web3.eth.getTransactionReceipt(result, (err, receipt) => {
      if (err) return cb(err)
      cb(null, receipt)
    })
  })
}

function getAccount(cb) {
  web3.eth.getAccounts((err, accounts) => {
    if (err) return cb(err)
    if (accounts.length < 1) return cb(new Error('There should be 1 account in the local node'))
    console.log('Account: ', accounts[0])
    cb(null, accounts[0])
  })
}

function newContract(account, MyContract, cb) {
  const gasEstimate = web3.eth.estimateGas({ data: bytecode })
  MyContract.new({
    from: account,
    data: bytecode,
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
