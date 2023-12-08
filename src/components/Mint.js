import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import Spinner from 'react-bootstrap/Spinner';
import { loadBalances, loadAllItems } from '../store/interactions';

const Mint = () => {
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const nfts = useSelector(state => state.nfts.contracts);
  const tokenCount = useSelector(state => state.nfts.tokenCount[0]);
  const maxSupply = useSelector(state => state.nfts.maxSupply[0]);
  const nftBalance = useSelector(state => state.nfts.nftBalances[0]);
  const marketplace = useSelector(state => state.marketplace.contract);
  const dispatch = useDispatch();

  const cost = 0
  const [message, setMessage] = useState('Go ahead click Mint NFT, it is FREE!')
  const [URL, setURL] = useState(null)
  const [image, setImage] = useState(null)
  const [currentToken, setCurrentToken] = useState(null)

  const [isWaiting, setIsWaiting] = useState(false)

  const mintNFT = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      setMessage("NFT is being minted...")
      const signer = await provider.getSigner()
      const transaction = await nfts[0].connect(signer).mint(`ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/${tokenCount + 1}.json`)
      await transaction.wait()
      let currentToken = Number(tokenCount) + 1;
      setCurrentToken(currentToken)
      let URL = `https://${process.env.REACT_APP_IPFS_METADATA_CID}.ipfs.nftstorage.link/${currentToken}.json`
      setURL(URL)
      let image = `https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${currentToken}.png`
      setImage(image)
      setMessage("Please click on Mint NFT")
      window.alert('NFT minted succesfully. Reveal NFT and see the metadata.')
    } catch {
      window.alert('Mint rejected')
    }
    await loadBalances(nfts, account, dispatch, provider);
    await loadAllItems(provider, marketplace, dispatch);
    setIsWaiting(false)
  }

  return (
    <div>
      <div className="form">
        <form onSubmit={mintNFT}>
          <p><strong>NFT Collection:&nbsp;</strong> LassePunks</p>
          <p><strong>Address:&nbsp;</strong> {nfts[0].address}</p> 
          <p><strong>Available to Mint:&nbsp;</strong> {maxSupply - tokenCount}</p>
          <p><strong>Cost to Mint:&nbsp;</strong> {ethers.utils.formatUnits(cost, 'ether')} ETH</p>
          <p><strong>You own:&nbsp;</strong> {nftBalance.toString()} </p>
          <button className="mint__button" onClick={(e) => mintNFT()} variant="primary" size="lg">
            Mint NFT
          </button>
          <hr />
            { !isWaiting && URL && (
              <p><strong>Token #{currentToken} minted!</strong></p>
            )}
          
            { !isWaiting && URL && (
              <p>View&nbsp;<a href={URL} target="_blank" rel="noreferrer">Metadata</a></p>
            )}

        </form>
        <div className="image">
          { !isWaiting && image === null ? (
            <p>{message}</p>
          ) :
          !isWaiting && image !== null ? (
            <div className="image__placeholder">
              <img src={image} alt="NFT img" />
            </div>
          ) : (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Mint;
