const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "cash expand echo knock surge milk casual tell around marble basket item";
const providerUrl = "https://rinkeby.infura.io/v3/c622990993a84b2f9316f831c84e3f9e";
module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 7545,
            network_id: '*',
            gas: 5000000
        },
        rinkeby: {
            provider: () => new HDWalletProvider(mnemonic, providerUrl),
            network_id: 4
        }
    }
}