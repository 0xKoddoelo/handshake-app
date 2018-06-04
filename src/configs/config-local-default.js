const config = {
  network: {
    1: {
      multiSigAuthAddress: '',
      handshakeProtocolAddress: '',
      crowdsaleHandshakeAddress: '',
      basicHandshakeAddress: '',
      payableHandshakeAddress: '',
      groupHandshakeAddress: '',
      predictionHandshakeAddress: '0x1559c2bd15f7eb6fa3e3146a752dbcaebdf58852',
      exchangeHandshakeAddress: '0x585DFaaF693866726bDbac42EF90C6CDf3A06075',
      blockchainNetwork: 'https://mainnet.infura.io/',
    },
    4: {
      multiSigAuthAddress: '',
      handshakeProtocolAddress: '',
      crowdsaleHandshakeAddress: '',
      basicHandshakeAddress: '0x4c621cfd5496b2077eb1c5b0308e2ea72358191b',
      payableHandshakeAddress: '',
      groupHandshakeAddress: '',
      predictionHandshakeAddress: '0x1559c2bd15f7eb6fa3e3146a752dbcaebdf58852',
      exchangeHandshakeAddress: '0x585DFaaF693866726bDbac42EF90C6CDf3A06075',
      cryptosignOwnerAddress: '',
      cryptosignOwnerPrivateKey: '',
      blockchainNetwork: 'https://rinkeby.infura.io/',
    },
  },

  firebase: {
    /*
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    storageBucket: '',
    messagingSenderId: '',
    */
    apiKey: 'AIzaSyAY_QJ_6ZmuYfNR_oM65a0JVvzIyMb-n9Q',
    authDomain: 'handshake-205007.firebaseapp.com',
    databaseURL: 'https://handshake-205007.firebaseio.com',
    projectId: 'handshake-205007',
    storageBucket: 'handshake-205007.appspot.com',
    messagingSenderId: '852789708485',
  },
};

export default config;
