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
  console.log(`LassePunks deployed to: ${lp.address}`)

// --------------------------------------------------

  const NAME2 = 'OtherPunks'
  const SYMBOL2 = 'OP'
  const MAX_SUPPLY2 = '25'
  const BASE_URI2 = "ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/"

  // Deploy OtherPunks NFT
  const OtherPunks = await hre.ethers.getContractFactory('NFT')
  let op = await OtherPunks.deploy(NAME2, SYMBOL2, MAX_SUPPLY2, BASE_URI2)

  await op.deployed()
  console.log(`OtherPunks NFT deployed to: ${op.address}`)

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
