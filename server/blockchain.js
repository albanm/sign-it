const fs = require('fs')
const path = require('path')
const solc = require('solc')

const blockchainCommon = require('../blockchain')

const savedContractPath = path.join(__dirname, '../data/contract.json')
let contract = exports.contract = {}
try {
  contract = exports.contract = JSON.parse(fs.readFileSync(savedContractPath, 'utf8'))
} catch (e) {
  const source = exports.source = fs.readFileSync(path.join(__dirname, 'signature-book.sol'), 'utf8')
  const compiledContract = solc.compile(source, 1)
  if (compiledContract.errors && compiledContract.errors.length) throw new Error(JSON.stringify(compiledContract.errors))
  contract.bytecode = compiledContract.contracts[':SignatureBook'].bytecode
  contract.abi = JSON.parse(compiledContract.contracts[':SignatureBook'].interface)
}

exports.init = (cb) => {
  blockchainCommon.init(contract, (err, newContract) => {
    if (err) return cb(err)
    if (contract.address) return cb()
    contract.address = newContract.address
    delete contract.bytecode
    console.log('Writing contract address to ' + savedContractPath)
    fs.writeFile(savedContractPath, JSON.stringify(contract, null, 2), 'utf8', cb)
  })
}
