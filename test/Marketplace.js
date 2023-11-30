const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

const provider = ethers.getDefaultProvider();

describe('Marketplace', () => {
  let accounts,
      deployer,
      user1,
      user2

  let feePercent,
      lp,
      marketplace

  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    feePercent = 2

    // Deploy LassePunks NFT collection
    const NFT = await ethers.getContractFactory('NFT')
    lp = await NFT.deploy('LassePunks', 'LP', 99, 'ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry')

    // Deploy NFT Marketplace
    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy(feePercent)
  })

  describe('Deployment', () => {

    it('marketplace has a contract address', async () => {
      expect(marketplace.address).to.not.equal(0x0)
    })

    it('returns correct feePercent', async () => {
      expect(await marketplace.feePercent()).to.equal(feePercent)
    })

    it('returns correct feeAccount', async () => {
      expect(await marketplace.feeAccount()).to.equal(deployer.address)
    })

    it('returns initial itemCount', async () => {
      expect(await marketplace.itemCount()).to.equal(0)
    })
  })

  describe('Creating Item', () => {
    let transaction

    beforeEach(async () => {
      transaction = await lp.connect(user1).mint('ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/')
      await transaction.wait()
      transaction = await lp.connect(user1).mint('ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/')
      await transaction.wait()
    })

    describe('Success', () => {

      it('adds to itemCount', async () => {
        expect(await marketplace.itemCount()).to.equal(0)
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        transaction = await marketplace.connect(user1).createItem(lp.address, 1, ether(1))
        await transaction.wait()
        expect(await marketplace.itemCount()).to.equal(1)
      })

      it('transfers NFT from user to marketplace', async () => {
        expect(await lp.ownerOf(1)).to.equal(user1.address)
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        transaction = await marketplace.connect(user1).createItem(lp.address, 1, ether(1))
        await transaction.wait()
        expect(await lp.ownerOf(1)).to.equal(marketplace.address)
      })

      it('emits ItemEvent event', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(await marketplace.connect(user1).createItem(lp.address, 1, ether(1))).to.emit(marketplace, 'ItemEvent')
          .withArgs(1, lp.address, 1, ether(1), user1.address, true)
      })
    })

    describe('Failure', () => {

      it('item price must be over 0', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(marketplace.connect(user1).createItem(lp.address, 1, ether(0))).to.be.revertedWith('Price must be greater than 0')
      })

      it('only the owner of NFT can list', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(marketplace.connect(user2).createItem(lp.address, 1, ether(1))).to.be.revertedWith('Only the owner of NFT can list')
      })
    })
  })

  describe('Buy Item', () => {  
    let transaction, totalPrice, price

      price = ether(1)

    beforeEach(async () => {
      transaction = await lp.connect(user1).mint('ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/')
      await transaction.wait()
      transaction = await lp.connect(user1).mint('ipfs://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry/')
      await transaction.wait()
      transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
      await transaction.wait()
      transaction = await marketplace.connect(user1).createItem(lp.address, 1, price)
      await transaction.wait()
      totalPrice = await marketplace.getTotalPrice(1)
    })

    describe('Success', () => {

      it('calculates totalPrice', async () => {
        await expect(await marketplace.getTotalPrice(1)).to.be.greaterThan(price)
      })

      it('transfers payment to seller', async () => {
        let balanceBefore = await ethers.provider.getBalance(user1.address)
        transaction = await marketplace.connect(user2).buyItem(1, { value: totalPrice })
        await transaction.wait()
        let balanceAfter = await ethers.provider.getBalance(user1.address)
        expect(balanceAfter).to.be.greaterThan(balanceBefore)
      })

      it('transfers marketplace fee to feeAccount', async () => {
        balanceBefore = await ethers.provider.getBalance(deployer.address)
        transaction = await marketplace.connect(user2).buyItem(1, { value: totalPrice })
        await transaction.wait()
        balanceAfter = await ethers.provider.getBalance(deployer.address)
        expect(balanceAfter).to.be.greaterThan(balanceBefore)
      })

      it('updates item to inactive', async () => {
        await expect(await marketplace.getActiveBool(1)).to.equal(true)
        transaction = await marketplace.connect(user2).buyItem(1, { value: totalPrice })
        await transaction.wait()
        await expect(await marketplace.getActiveBool(1)).to.equal(false)
      })

      it('transfers NFT from marketplace to buyer', async () => {
        expect(await lp.ownerOf(1)).to.equal(marketplace.address)
        transaction = await marketplace.connect(user2).buyItem(1, { value: totalPrice })
        await transaction.wait()
        expect(await lp.ownerOf(1)).to.equal(user2.address)
      })

      it('emits Bought event', async () => {
        await expect(await marketplace.connect(user2).buyItem(1, { value: totalPrice })).to.emit(marketplace, 'Bought')
          .withArgs(1, lp.address, 1, price, user1.address, user2.address)
      })
    })

    describe('Failure', () => {

      it('item must exist in marketplace', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(marketplace.connect(user1).createItem(lp.address, 1, ether(0))).to.be.revertedWith('Price must be greater than 0')
      })

      it('not enough ether to buy item', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(marketplace.connect(user1).createItem(lp.address, 1, ether(0))).to.be.revertedWith('Price must be greater than 0')
      })

      it('item is not listed in marketplace', async () => {
        transaction = await lp.connect(user1).setApprovalForAll(marketplace.address, true)
        await transaction.wait()
        await expect(marketplace.connect(user1).createItem(lp.address, 1, ether(0))).to.be.revertedWith('Price must be greater than 0')
      })      
    })
  })
})
