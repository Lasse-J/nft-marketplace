import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { Row, Col, Card } from 'react-bootstrap';

const History = () => {
  const account = useSelector(state => state.provider.account);
  const marketplace = useSelector(state => state.marketplace.contract);

  const IPFS_METADATA_CID="bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry"
  const IPFS_IMAGE_CID="bafybeib5dxbty7wv22mjatwopbmhhufq2nkhzj2vpvcnqddzmrco7wvu54"
  const [purchases, setPurchases] = useState([])
  const [solds, setSolds] = useState([])

  const loadPurchasedItems = async () => {

    // Fetch purchased items from marketplace and filter by buyer set as user
    const filter_purchase = marketplace.filters.Bought(null, null, null, null, account)
    const results_purchase = await marketplace.queryFilter(filter_purchase)

    // Fetch metadata of each nft and add that to listedItem object
    const purchases = await Promise.all(results_purchase.map(async i => {
      i = i.args
      const URI = `https://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry.ipfs.nftstorage.link/${i.tokenId}.json`
      const response = await fetch(URI);
      const metadata = await response.json();
      const totalPrice = await marketplace.getTotalPrice(i.tokenId)
      let purchaseItem = {
        totalPrice,
        price: i.price,
        tokenId: i.tokenId,
        name: metadata.name,
        description: metadata.description,
        image: `https://bafybeib5dxbty7wv22mjatwopbmhhufq2nkhzj2vpvcnqddzmrco7wvu54.ipfs.nftstorage.link/${i.tokenId}.png`
      }
      return purchaseItem
    }))
    setPurchases(purchases)
  }

  const loadSoldItems = async () => {

    // Fetch sold items from marketplace and filter by seller set as user
    const filter_sold = marketplace.filters.Bought(null, null, null, account, null)
    const results_sold = await marketplace.queryFilter(filter_sold)

    // Fetch metadata of each nft and add that to listedItem object
    const solds = await Promise.all(results_sold.map(async i => {
      i = i.args
      const URI = `https://bafybeibd7tfptdtntg47tbekr6ik3ozsmt5dotxc5sc56kynrkljsszfry.ipfs.nftstorage.link/${i.tokenId}.json`
      const response = await fetch(URI);
      const metadata = await response.json();
      const totalPrice = await marketplace.getTotalPrice(i.tokenId)
      let soldItem = {
        totalPrice,
        price: i.price,
        tokenId: i.tokenId,
        name: metadata.name,
        description: metadata.description,
        image: `https://bafybeib5dxbty7wv22mjatwopbmhhufq2nkhzj2vpvcnqddzmrco7wvu54.ipfs.nftstorage.link/${i.tokenId}.png`
      }
      return soldItem
    }))
    setSolds(solds)
  }

  useEffect(() => {
    loadPurchasedItems()
    loadSoldItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex justify-center body">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <p><strong>My purchase history:</strong></p>
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} className="zoom" />
                  <Card.Body color="secondary">
                    <Card.Title>{item.description} {item.name}</Card.Title>
                  </Card.Body>
                  <Card.Footer>Bought for {ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <p><strong>No purchase history</strong></p>
          </main>
        )
      }

      {solds.length > 0 ?
        <div className="px-5 container">
          <p><strong>My sales history:</strong></p>
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {solds.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} className="zoom" />
                  <Card.Body color="secondary">
                    <Card.Title>{item.description} {item.name}</Card.Title>
                  </Card.Body>
                  <Card.Footer>Sold for {ethers.utils.formatEther(item.price)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <p><strong>No sales history</strong></p>
          </main>
        )
      }
    </div>
  );
}

export default History;
