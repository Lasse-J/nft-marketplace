import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { itemSelector } from '../store/selectors';
import config from '../config.json'

// Components
import Loading from './Loading';
import Alert from './Alert';

import { loadBalances, loadAllItems, buy } from '../store/interactions';

const Buy = () => {
  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const marketplace = useSelector(state => state.marketplace.contract);
  const nfts = useSelector(state => state.nfts.contracts);
  const dispatch = useDispatch();

  const isBuying = useSelector(state => state.marketplace.buying.isBuying);
  const isSuccess = useSelector(state => state.marketplace.buying.isSuccess);
  const transactionHash = useSelector(state => state.marketplace.buying.transactionHash);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
 
  // Use the itemSelector to get only active items
  const activeItems = useSelector(itemSelector);

  // State to hold items with fetched metadata
  const [listedItems, setListedItems] = useState([]);

  // Function to fetch metadata for each active item and set state
  const fetchMetadata = async (item) => { 
    let URI = `https://${process.env.REACT_APP_IPFS_METADATA_CID}.ipfs.nftstorage.link/${item.tokenId}.json`
    const response = await fetch(URI);
    const metadata = await response.json();
    const totalPrice = await marketplace.getTotalPrice(item.tokenId);
//    console.log(totalPrice.toString())
//    console.log(item.price)
    return {
      ...item,
      image: `https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${item.tokenId}.png`,
      name: metadata.name,
      description: metadata.description,
      totalPrice: totalPrice.toString(),   // totalPrice.toString(),  // item.price,
      tokenId: (item.tokenId).toString(),
      active: item.active
    };
  };
  
  // Function to load active items and their metadata
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
  };
  
  useEffect(() => {
    if (provider && marketplace) {
      loadMarketplaceItems();
    }
  }, [provider, marketplace]);
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="flex justify-content-center">
      {listedItems.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {listedItems.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.description} {item.name}</Card.Title>
{/*                    <Card.Text>itemId: {item.itemId}</Card.Text>*/}
{/*                    <Card.Text>tokenId: {item.tokenId}</Card.Text>*/}
{/*                    <Card.Text>price: {item.price}</Card.Text>*/}
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      {isBuying ? (
                        <Spinner animation="border" />
                      ) : (
                        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                           Buy for {ethers.utils.formatUnits(item.totalPrice, 'ether')} ETH
                        </Button>
                      )}
                    </div>
                  </Card.Footer>
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
