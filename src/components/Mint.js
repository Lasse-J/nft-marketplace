import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';

import Spinner from 'react-bootstrap/Spinner';

import Loading from './Loading';

const Mint = () => {
  const provider = useSelector(state => state.provider.connection);
  const nfts = useSelector(state => state.nfts.contracts);
  const tokenCount = useSelector(state => state.nfts.tokenCount[0]);
  const maxSupply = useSelector(state => state.nfts.maxSupply[0]);
  const nftBalance = useSelector(state => state.nfts.nftBalances[0]);
  const marketplace = useSelector(state => state.marketplace.contract);

  const cost = 0

  const [isWaiting, setIsWaiting] = useState(false)

  const mintHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const transaction = await nfts[0].connect(signer).mint(`ipfs://${process.env.REACT_APP_IPFS_METADATA_CID}/${tokenCount + 1}.json`)
      await transaction.wait()
    } catch {
      window.alert('Mint rejected')
    }
  }

  return (
    <div>
      <div className="form">
        <form onSubmit={mintHandler}>
          <p><strong>NFT Collection:&nbsp;</strong> LassePunks</p>
          <p><strong>Available to Mint:&nbsp;</strong> {maxSupply - tokenCount}</p>
          <p><strong>Cost to Mint:&nbsp;</strong> {ethers.utils.formatUnits(cost, 'ether')} ETH</p>
          <p><strong>You own:&nbsp;</strong> {nftBalance.toString()} </p>
          <input type="submit" value="Mint"></input>
        </form>
        <div className="image">
          { !isWaiting ? (
            <></>
          ) : (
            <div className="image__placeholder">
              <Spinner animation="border" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Mint;
