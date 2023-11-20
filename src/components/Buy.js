import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { itemSelector } from '../store/selectors';

// Components
import Loading from './Loading';
import Alert from './Alert';

import { loadBalances, loadAllItems, buy } from '../store/interactions';

const Buy = () => {
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const marketplace = useSelector(state => state.marketplace.contract);
//  const itemCount = useSelector(state => state.marketplace.itemCount);
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
    const URI = `https://${process.env.REACT_APP_IPFS_METADATA_CID}.ipfs.nftstorage.link/${item.tokenId}.json`;
    const response = await fetch(URI);
    const metadata = await response.json();
    const totalPrice = await marketplace.getTotalPrice(item.tokenId);
    return {
      ...item,
      image: `https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${item.tokenId}.png`,
      name: metadata.name,
      description: metadata.description,
      totalPrice: totalPrice.toString(),
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
//    await loadBalances(nfts, account, dispatch, provider);
//    await loadAllItems(provider, marketplace, dispatch);
    setShowAlert(true);
  };
  
  useEffect(() => {
    if (provider && marketplace) {
      loadMarketplaceItems();
//      loadAllItems(provider, marketplace, dispatch);
    }
  }, [provider, marketplace]);
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="flex justify-content-center">
      <Card style={{ maxWidth: '1200px' }} className='mx-auto px-4'>
        {listedItems.length > 0 ? (
          <div className="px-5 container">
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {listedItems.map((item, index) => (
                <Col key={index} className="overflow-hidden">
                  <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>{item.description}</Card.Text>
                      <Card.Text>TokenId: {item.tokenId}</Card.Text>
                      <Card.Text>Active: {item.active.toString()}</Card.Text>
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
      </Card>

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
