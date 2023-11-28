import { ethers } from 'ethers';

import Spinner from 'react-bootstrap/Spinner';

const Mint = () => {


  return (
    <div>
      <div className="form">
        <form onSubmit={submitHandler}>
          <input type="text" placeholder="Name..." onChange={(e) => {setName(e.target.value)}}></input>
          <input type="text" placeholder="Description..." onChange={(e) => {setDescription(e.target.value)}}></input>
          <input type="submit" value="Create & Mint"></input>
        </form>
        <div className="image">
          { !isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      { !isWaiting && aiURL && (
        <p>View&nbsp;<a href={aiURL} target="_blank" rel="noreferrer">Metadata</a></p>
      )}
      <p>{current_AI_CID}</p>
    </div>
  );
}

export default Mint;
