const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  let accounts,
      deployer,
      minter1,
      minter2

  let lp

  const name = 'LassePunks'
  const symbol = 'LP'
  const maxSupply = 99
  const baseURI = 'ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/'

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    lp = await NFT.deploy('LassePunks', 'LP', 99, 'ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter1 = accounts[1]
    minter2 = accounts[2]
  })

  describe('Deployment', () => {

    it('has correct name', async () => {
      expect(await lp.name()).to.equal(name)
    })

    it('has correct symbol', async () => {
      expect(await lp.symbol()).to.equal(symbol)
    })

    it('has correct maxSupply', async () => {
      expect(await lp.maxSupply()).to.equal(maxSupply)
    })

    it('has correct baseURI', async () => {
      expect(await lp.baseURI()).to.equal(baseURI)
    })

    it('returns correct baseExtension', async () => {
      expect(await lp.baseExtension()).to.equal('.json')
    })

    it('has initial tokenCount', async () => {
      expect(await lp.tokenCount()).to.equal(0)
    })
  })

  describe('Minting', () => {
    let transaction

    beforeEach(async () => {
      transaction = await lp.connect(minter1).mint(baseURI)
      await transaction.wait()
    })

    describe('Success', () => {
      it('returns the address of the minter', async () => {
        expect(await lp.ownerOf(1)).to.equal(minter1.address)
      })

      it('returns the total number of NFTs the minter owns', async () => {
        expect(await lp.balanceOf(minter1.address)).to.equal(1)
      })

      it('adds to tokenCount', async () => {
        expect(await lp.tokenCount()).to.equal(1)
        transaction = await lp.connect(minter1).mint(baseURI)
        await transaction.wait()
        expect(await lp.tokenCount()).to.equal(2)
      })    

      it('returns the tokenURI', async () => {
        expect(await lp.tokenURI(1)).to.equal('ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/1.json')
      })
    })

    describe('Failure', () => {
      it('rejects tokenURI if token does not exist', async () => {
        await expect(lp.connect(deployer).tokenURI(10)).to.be.revertedWith('token does not exist')
      })
    })
  })
})
