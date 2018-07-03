const fs = require('fs')
const HDWalletProvider = require('truffle-hdwallet-provider')

// config hdwallet first (get token from https://infura.io/signup, get mnemonic from your eth wallet)
let hdwallet = { mnemonic : "", access_token : "", wallet_id : 0 }
if(fs.existSync('hdwallet.json')){
  hdwallet = JSON.parse(fs.readFileSync('hdwallet.json', 'utf8')) 
} else {
  console.log("load hdwallet.json failed") 
}
 
module.exports = {
  networks: {
    localhost: {
      host: "localhost",
      network_id: "*",
    },
    ropsten: {
      network_id: 3,
      provider: function() { return new HDWalletProvider(hdwallet.mnemonic, 'https://ropsten.infura.io/' + hdwallet.access_token, hdwallet.wallet_id) }
    },
    
  }
}