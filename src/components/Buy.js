import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { itemSelector } from '../store/selectors';
import Loading from './Loading';
import Alert from './Alert';
import { loadBalances, loadAllItems, loadMarketplace, buy } from '../store/interactions';

const Buy = () => {
  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const marketplace = useSelector(state => state.marketplace.contract);
  const nfts = useSelector(state => state.nfts.contracts);
  const dispatch = useDispatch();

  const IPFS_METADATA_CID="bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry"
  const IPFS_IMAGE_CID="bafybeib5dxbty7wv22mjatwopbmhhufq2nkhzj2vpvcnqddzmrco7wvu54"
  const isBuying = useSelector(state => state.marketplace.buying.isBuying);
  const isSuccess = useSelector(state => state.marketplace.buying.isSuccess);
  const transactionHash = useSelector(state => state.marketplace.buying.transactionHash);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
 
  // Using the itemSelector to get only active items
  const activeItems = useSelector(itemSelector);

  // State to hold items with fetched metadata
  const [listedItems, setListedItems] = useState([]);

  // Fetch metadata for each active item and set state
  const fetchMetadata = async (item) => { 
    let URL = `https://${IPFS_METADATA_CID}.ipfs.nftstorage.link/${item.tokenId}.json`
    const response = await fetch(URL);
    const metadata = await response.json();
    const totalPrice = await marketplace.getTotalPrice(item.tokenId);
    return {
      ...item,
      image: `https://${IPFS_IMAGE_CID}.ipfs.nftstorage.link/${item.tokenId}.png`,
      name: metadata.name,
      description: metadata.description,
      totalPrice: totalPrice.toString(),
      tokenId: (item.tokenId).toString(),
      active: item.active,
      link: URL,
      background: metadata.attributes[0].value,
      face: metadata.attributes[1].value,
      hats_and_hair: metadata.attributes[2].value,
      eyes_and_glasses: metadata.attributes[3].value,
      nose: metadata.attributes[4].value,
      mouth: metadata.attributes[5].value  
    };
  };

  const loadMarketplaceItems = async () => {
    setLoading(true);
    const itemsWithMetadata = await Promise.all(activeItems.map(async (item) => {
      return fetchMetadata(item);
    }));
    setListedItems(itemsWithMetadata);
    setLoading(false);
  };
  
  const buyMarketItem = async (item) => {
    setShowAlert(false);
    const priceInEther = ethers.utils.formatUnits(item.totalPrice, 'ether');
    await buy(provider, marketplace, item, priceInEther, dispatch);
    setShowAlert(true);
    await loadBalances(nfts, account, dispatch, provider);
    await loadAllItems(provider, marketplace, dispatch);
    await loadMarketplaceItems();
    await loadMarketplace(chainId, provider, dispatch)
  };

  const displayPopUp = (item, index) => {
    let popUpBox = document.getElementById(`popUp-${index}`);
    popUpBox.classList.add("display");
  };

  const closePopUp = (index) => {
    let popUpBox = document.getElementById(`popUp-${index}`);
    popUpBox.classList.remove("display");
  };

  useEffect(() => {
    if (provider && marketplace) {
      loadMarketplaceItems();
    } // eslint-disable-next-line
  }, [marketplace, provider]);
  
  if (loading) {
    return <Loading />;
  };
  
  return (
    <div className="flex justify-content-center">
      {listedItems.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {listedItems.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} className="zoom" onClick={() => displayPopUp(item, index)} />
                    <div className={`pop-up pop-up-${index}`} id={`popUp-${index}`}>
                      <hr />
                      <p>{item.description} {item.name}</p>
                      <p>Background: {item.background}</p>
                      <p>Face: {item.face}</p>
                      <p>Hats and Hair: {item.hats_and_hair}</p>
                      <p>Eyes and Glasses: {item.eyes_and_glasses}</p>
                      <p>Nose: {item.nose}</p>
                      <p>Mouth: {item.mouth}</p>
                      <button onClick={() => closePopUp(index)}>Close</button>
                    </div>
                  <Card.Body color="secondary">
                    <Card.Title><center>{item.description} {item.name}</center></Card.Title>                 
                        <div className='d-grid'>
                          {isBuying ? (
                            <Spinner animation="border align-items-center" />
                          ) : (
                            <button className="buy__button" onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                               Buy for {ethers.utils.formatUnits(item.totalPrice, 'ether')} ETH
                            </button>
                          )}
                        </div>
                    
                  </Card.Body>                  
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <div className="px-5 container">
          <p className='d-flex justify-content-center align-items-center' style={{ height: '300px' }}>
            {account ? 'No listed NFTs.' : 'Please connect your wallet.'}
          </p>
        </div>
      )}

      { isBuying ? (
        <Alert
          message={'Buy Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Buy Successful'}
          transactionHash={transactionHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Buy Failed'}
          transactionHash={null}
          variant={'danger'}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Buy;
