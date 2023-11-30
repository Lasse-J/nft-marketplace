import { ethers } from 'ethers';

import {
  setProvider,
  setNetwork,
  setAccount,
  setEthBalance
} from './reducers/provider';

import {
  setContracts,
  setSymbols,
  setMaxSupply,
  setBaseURI,
  setTokenCount,
  setNftBalances
} from './reducers/nfts';

import {
  setContract,
  setFeeAccount,
  setFeePercent,
  setItemCount,
  itemsLoaded,
  buyRequest,
  buyItemSuccess,
  buySuccess,
  buyFail
} from './reducers/marketplace';

// Contract ABIs
import MARKETPLACE_ABI from '../abis/Marketplace.json';
import NFT_ABI from '../abis/NFT.json';

// Network config
import config from '../config.json';

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  dispatch(setProvider(provider))

  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId))

  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

// --------------
// LOAD CONTRACTS

export const loadNfts = async (provider, chainId, dispatch) => {
  const nft = new ethers.Contract(config[chainId].nft.address, NFT_ABI, provider)

  dispatch(setContracts([nft]))
  dispatch(setSymbols([await nft.symbol()]))

  const maxSupply = await nft.maxSupply()
  dispatch(setMaxSupply(
    [ethers.utils.formatUnits(maxSupply.toString(), '0')]))

  dispatch(setBaseURI(
    [await nft.baseURI()]))

  const tokenCount = await nft.tokenCount()
  dispatch(setTokenCount(
    [ethers.utils.formatUnits(tokenCount.toString(), '0')]))
}

export const loadMarketplace = async (chainId, provider, dispatch) => {
  const marketplace = new ethers.Contract(config[chainId].marketplace.address, MARKETPLACE_ABI, provider)

  dispatch(setContract(marketplace))
  dispatch(setFeeAccount(await marketplace.feeAccount()))

  const feePercent = await marketplace.feePercent()
  dispatch(setFeePercent(ethers.utils.formatUnits(feePercent.toString(), '0')))

  const itemCount = await marketplace.itemCount()
  dispatch(setItemCount(ethers.utils.formatUnits(itemCount.toString(), '0')))

  return marketplace
}

// -------------
// LOAD BALANCES

export const loadBalances = async (nfts, account, dispatch, provider) => {
  const nftBalances = await nfts[0].balanceOf(account)
  dispatch(setNftBalances([nftBalances.toString()]))

  const ethBalance = await provider.getBalance(account)
  dispatch(setEthBalance(ethers.utils.formatUnits(ethBalance.toString(), 'ether')))
}

// --------------------------
// LOAD ALL MARKETPLACE ITEMS

export const loadAllItems = async (provider, marketplace, dispatch) => {
//  console.log('loadAllItems triggered')
  provider = new ethers.providers.Web3Provider(window.ethereum)

  // Fetch all items from Blockchain
  const { chainId } = await provider.getNetwork()
  marketplace = new ethers.Contract(config[chainId].marketplace.address, MARKETPLACE_ABI, provider)

  const itemCount = await marketplace.itemCount();

  const itemsPromises = [];
    for (let i = 1; i <= itemCount; i++) {
      itemsPromises.push(marketplace.items(i));
    }

  const allItems = await Promise.all(itemsPromises);
//  console.log('allItems', allItems)
  const activeItems = allItems.filter(item => item.active);
//  console.log('activeItems', activeItems)

  dispatch(itemsLoaded(activeItems.map((item, index) => ({
    itemId: index + 1, // Assuming item IDs start at 1
    nftAddress: item.nft,
    tokenId: item.tokenId.toString(),
    price: item.price.toString(),
    seller: item.seller,
    active: item.active
  }))));

  console.log('loadAllItems finalized.')
}

// --------------------
// BUY FROM MARKETPLACE

export const buy = async (provider, marketplace, item, totalPrice, dispatch) => {
  try {
    dispatch(buyRequest());
    const signer = provider.getSigner();
    let transaction = await marketplace.connect(signer).buyItem(item.tokenId, { value: ethers.utils.parseEther(totalPrice.toString()) });
    await transaction.wait();
    dispatch(buyItemSuccess({ itemId: item.tokenId, transactionHash: transaction.hash })); // Dispatch the buyItemSuccess action
    dispatch(buySuccess(transaction.hash));
  } catch (error) {
    dispatch(buyFail());
    console.error('Buy failed', error);
  }
};
