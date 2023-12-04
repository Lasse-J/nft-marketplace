const hre = require("hardhat");
const config = require('../src/config.json')
require('dotenv').config();

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

async function main() {
  // Fetch accounts
  console.log(`Fetching accounts & network...\n`)
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const minter = accounts[1]
  const minter2 = accounts[2]

  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Minter #1 address: ${minter.address}`);
  console.log(`Minter #2 address: ${minter2.address}\n`);

  // Fetch Network
  const { chainId } = await ethers.provider.getNetwork()

  // Fetch LassePunks Contract
  console.log(`Fetching NFT contract...`)
  const lp = await ethers.getContractAt('NFT', config[chainId].nft.address)
  console.log(`LassePunks fetched: ${lp.address} \n`)

  // Mint LassePunks NFTs
  console.log(`Minting NFTs...`)
  let transaction

  transaction = await lp.connect(minter).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/1.json')
  await transaction.wait()
  console.log(`Minter #1: Minted 1 of 99 LassePunks`)

  transaction = await lp.connect(minter).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/2.json')
  await transaction.wait()
  console.log(`Minter #1: Minted 2 of 99 LassePunks`)

  transaction = await lp.connect(minter).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/3.json')
  await transaction.wait()
  console.log(`Minter #1: Minted 3 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/4.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 4 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/5.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 5 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/6.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 6 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/7.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 7 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/8.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 8 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/9.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 9 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/10.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 10 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/11.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 11 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/12.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 12 of 99 LassePunks`)

  transaction = await lp.connect(minter2).mint('ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/13.json')
  await transaction.wait()
  console.log(`Minter #2: Minted 13 of 99 LassePunks \n`)

  // Fetch Marketplace
  console.log(`Fetching Marketplace...`)
  const marketplace = await ethers.getContractAt('Marketplace', config[chainId].marketplace.address)
  console.log(`Marketplace fetched: ${marketplace.address}\n`)


  // List NFTs in Marketplace
  console.log(`Listing NFTs...`)
  let approving
  let listing

  approving = await lp.connect(minter).setApprovalForAll(marketplace.address, true)
  await approving.wait()

//  approving = await lp.connect(minter).approve(marketplace.address, 1)
//  await approving.wait()

  listing = await marketplace.connect(minter).createItem(lp.address, 1, ether(1))
  await listing.wait()
  console.log(`Listed #1 LassePunks in the Marketplace`)

//  approving = await lp.connect(minter).approve(marketplace.address, 2)
//  await approving.wait()

  listing = await marketplace.connect(minter).createItem(lp.address, 2, ether(2))
  await listing.wait()
  console.log(`Listed #2 LassePunks in the Marketplace`)

//  approving = await lp.connect(minter).approve(marketplace.address, 3)
//  await approving.wait()

  listing = await marketplace.connect(minter).createItem(lp.address, 3, ether(3))
  await listing.wait()
  console.log(`Listed #3 LassePunks in the Marketplace`)

  approving = await lp.connect(minter2).approve(marketplace.address, 4)
  await approving.wait()

  listing = await marketplace.connect(minter2).createItem(lp.address, 4, ether(4))
  await listing.wait()
  console.log(`Listed #4 LassePunks in the Marketplace`)

  approving = await lp.connect(minter2).approve(marketplace.address, 5)
  await approving.wait()

  listing = await marketplace.connect(minter2).createItem(lp.address, 5, ether(5))
  await listing.wait()
  console.log(`Listed #5 LassePunks in the Marketplace`)

  approving = await lp.connect(minter2).approve(marketplace.address, 6)
  await approving.wait()

  listing = await marketplace.connect(minter2).createItem(lp.address, 6, ether(6))
  await listing.wait()
  console.log(`Listed #6 LassePunks in the Marketplace`)

  approving = await lp.connect(minter2).approve(marketplace.address, 10)
  await approving.wait()

  listing = await marketplace.connect(minter2).createItem(lp.address, 10, ether(10))
  await listing.wait()
  console.log(`Listed #10 LassePunks in the Marketplace \n`)

//  totalPrice = await marketplace.getTotalPrice(3)
//  buying = await marketplace.connect(minter2).buyItem(3, { value: totalPrice })
//  await buying.wait()
//  console.log(`Bought #3 LassePunks in the Marketplace \n`)

  console.log(`Finished.\n`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
