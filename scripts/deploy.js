const hre = require("hardhat");

async function main() {
  const NAME = 'LassePunks'
  const SYMBOL = 'LP'
  const MAX_SUPPLY = '99'
  const BASE_URI = "ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/"

  // Deploy LassePunks NFT
  const LassePunks = await hre.ethers.getContractFactory('NFT')
  let lp = await LassePunks.deploy(NAME, SYMBOL, MAX_SUPPLY, BASE_URI)

  await lp.deployed()
  console.log(`LassePunks NFT collection deployed to: ${lp.address}`)

// --------------------------------------------------

  const FEE_PERCENT = '2'

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  let marketplace = await Marketplace.deploy(FEE_PERCENT)

  await marketplace.deployed()
  console.log(`Marketplace deployed to: ${marketplace.address}\n`)

  console.log('Finished.\n')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
