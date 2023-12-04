import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';

import Spinner from 'react-bootstrap/Spinner';

const List = () => {
  const provider = useSelector(state => state.provider.connection);
  const marketplace = useSelector(state => state.marketplace.contract);
  const nfts = useSelector(state => state.nfts.contracts);

  const [address, setAddress] = useState(null)
  const [tokenId, setTokenId] = useState(null)
  const [price, setPrice] = useState(null)
  const [image, setImage] = useState(null)
  const [isWaiting, setIsWaiting] = useState(false)

  const [message, setMessage] = useState('Please provide NFT address, tokenId and price')

  const submitHandler = async (e) => {
    e.preventDefault()

    if (address === "" || tokenId === "" || price === "") {
      window.alert("Please provide a nft smart contract address, tokenId and price in ETH")
      return
    }

    if (address !== "" && tokenId !== "") {
      setMessage("Fetching the NFT...")
          
    }

    setIsWaiting(true)

    // Create marketplace item
    try {
      const signer = await provider.getSigner()
      let transaction = await nfts[0].connect(signer).approve(marketplace.address, tokenId)
      await transaction.wait()
      transaction = await marketplace.connect(signer).createItem(address, tokenId, price)
      transaction.wait()
      setMessage("NFT listed to marketplace")
    } catch {
      window.alert('Listing failed')
      setMessage("Please provide NFT address, tokenId and price")
    }

    setIsWaiting(false)
  }

  return (
    <div>
      <div className="form">
        <form onSubmit={submitHandler}>
          <p>0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
          <input type="text" placeholder="NFT address: 0x..." onChange={(e) => {setAddress(e.target.value)}}></input>
          <input type="number" placeholder="TokenId..." onChange={(e) => {setTokenId(e.target.value)}}></input>
          <input type="number" step=".001" placeholder="Price: 0.000 ETH..." onChange={(e) => {setPrice((ethers.utils.parseUnits(e.target.value)).toString())}}></input>
          <input type="submit" value="List for sale"></input>
        </form>
        <div className="image">
          { !isWaiting && image ? (
            <img src={image} alt="NFT image" />
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