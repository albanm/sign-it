const fs = require('fs')
const path = require('path')

const blockchainCommon = require('../blockchain')

const contractAddressPath = path.join(__dirname, '../data/contract-address.txt')
const source = exports.source = fs.readFileSync(path.join(__dirname, 'signature-book.sol'), 'utf8')

let address
try {
  address = fs.readFileSync(contractAddressPath, 'utf8')
} catch (e) {
  // nothing todo
}

exports.init = (cb) => {
  blockchainCommon.init(source, address, (err, contract) => {
    if (err) return cb(err)
    exports.address = contract.address
    if (address) return cb()
    console.log('Writing contract address to ' + contractAddressPath)
    fs.writeFile(contractAddressPath, contract.address, 'utf8', cb)
  })
}
