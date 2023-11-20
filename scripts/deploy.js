// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'LassePunks'
  const SYMBOL = 'LP'
  const MAX_SUPPLY = '99'
  const BASE_URI = "ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry"

  // Deploy LassePunks NFT
  const LassePunks = await hre.ethers.getContractFactory('NFT')
  let lp = await LassePunks.deploy(NAME, SYMBOL, MAX_SUPPLY, BASE_URI)

  await lp.deployed()
  console.log(`LassePunks deployed to: ${lp.address}`)

// --------------------------------------------------

  const FEE_PERCENT = '1'

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  let marketplace = await Marketplace.deploy(FEE_PERCENT)

  await marketplace.deployed()
  console.log(`Marketplace deployed to: ${marketplace.address}\n`)

  console.log('Finished.')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
