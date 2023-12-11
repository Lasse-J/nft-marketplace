import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import config from '../config.json'
import Spinner from 'react-bootstrap/Spinner';
import { loadBalances, loadAllItems } from '../store/interactions';

const List = () => {
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const chainId = useSelector(state => state.provider.chainId);  
  const marketplace = useSelector(state => state.marketplace.contract);
  const nfts = useSelector(state => state.nfts.contracts);
  const dispatch = useDispatch();

  const [address, setAddress] = useState(null)
  const [tokenId, setTokenId] = useState(null)
  const [price, setPrice] = useState(null)
  const [image, setImage] = useState(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [message, setMessage] = useState('Please provide NFT address, tokenId and price')

  const listMarketItem = async (e) => {
    e.preventDefault()

    if (address === "" || tokenId === "" || price === "") {
      window.alert("Please provide a nft smart contract address, tokenId and price in ETH")
      return
    }

    if (address !== "" && tokenId !== "") {
      setMessage("Fetching the NFT...")
      setImage(`https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${tokenId}.png`)
    }

    setIsWaiting(true)

      try {
        const signer = await provider.getSigner()
        if (address === config[chainId].nft.address) {
          let transaction = await nfts[0].connect(signer).approve(marketplace.address, tokenId)
          await transaction.wait()
          transaction = await marketplace.connect(signer).createItem(address, tokenId, price)
          transaction.wait()
          window.alert('NFT listed to marketplace')
        }} catch {
        window.alert('Listing failed')
        setMessage("Please provide NFT address, tokenId and price")
      }
    await loadBalances(nfts, account, dispatch, provider);
    await loadAllItems(provider, marketplace, dispatch);
    setIsWaiting(false)
  }

  return (
    <div>
      <div className="form">
        <form onSubmit={listMarketItem}>
          <p><strong>List NFT on the marketplace:</strong></p>
          <input type="text" id="nftAddress" placeholder="NFT address: 0x..." onChange={(e) => {setAddress(e.target.value)}}></input>
          <input type="number" placeholder="TokenId..." onChange={(e) => {setTokenId(e.target.value)}}></input>
          <input type="number" step=".0001" placeholder="Price: 0.0000 ETH..." onChange={(e) => {setPrice((ethers.utils.parseUnits(e.target.value)).toString())}}></input>
          <button className="list__button" onClick={(e) => listMarketItem()} variant="primary" size="lg">
            List for sale
          </button>
        </form>
        <div className="image">
          { image ? (
            <img src={image} alt="NFT img" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <div>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default List;
