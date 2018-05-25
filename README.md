Music Store On Ethereum Blockchain.

A Decentralized Music Marketplace For Independent Artists And Labels.

Quickstart

For this version, I currently run it on Truffle's Ganache. However, it points to whatever you have locally listening on port 8545 (edited through truffle.js), so you could easily use a Geth node or similar. Additionally, MetaMask must point to the same network as the port in truffle.js.

You also need to be running a local node of IPFS on the same system, and ensure that the HTTP API is available.

yarn to install dependencies.

Run truffle migrate (add --network [network name or id] if you have multiple networks configured and want to pick one). This will compile the contracts into the ABI. It'll also deploy the contract to the given network.

Now, you should be able to run yarn start and start working with the app.



