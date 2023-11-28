import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { Row, Col, Card } from 'react-bootstrap';

const History = () => {
  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const nfts = useSelector(state => state.nfts.contracts);
  const marketplace = useSelector(state => state.marketplace.contract);

//  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([])
  const [solds, setSolds] = useState([])

  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace and filter by buyer set as user
    const filter_purchase = marketplace.filters.Bought(null, null, null, null, null, account)
    const results_purchase = await marketplace.queryFilter(filter_purchase)
    // Fetch metadata of each nft and add that to listedItem object
    const purchases = await Promise.all(results_purchase.map(async i => {
      // get arguments from each result
      i = i.args
      // get uri url from nft contract
      const URI = `https://${process.env.REACT_APP_IPFS_METADATA_CID}.ipfs.nftstorage.link/${i.tokenId}.json`
//      const uri = await nfts[0].tokenURI(i.tokenId);
      // use uri to fetch the nft metadata stored on ipfs
      console.log('URI', URI)
      const response = await fetch(URI);
      console.log('response', response)
      const metadata = await response.json();
      console.log('metadata', metadata)
      // get total price of item
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // define listem item object
      let purchaseItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: `https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${i.tokenId}.png`
      }
      return purchaseItem
    }))
//    setLoading(false)
    setPurchases(purchases)
  }

  const loadSoldItems = async () => {
    // Fetch sold items from marketplace and filter by seller set as user
    const filter_sold = marketplace.filters.Bought(null, null, null, null, account, null)
    const results_sold = await marketplace.queryFilter(filter_sold)
    // Fetch metadata of each nft and add that to listedItem object
    const solds = await Promise.all(results_sold.map(async i => {
      // get arguments from each result
      i = i.args
      // get uri url from nft contract
      const URI = `https://${process.env.REACT_APP_IPFS_METADATA_CID}.ipfs.nftstorage.link/${i.tokenId}.json`
//      const uri = await nfts[0].tokenURI(i.tokenId);
      // use uri to fetch the nft metadata stored on ipfs
      console.log('URI', URI)
      const response = await fetch(URI);
      console.log('response', response)
      const metadata = await response.json();
      console.log('metadata', metadata)
      // get total price of item
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // define listem item object
      let soldItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: `https://${process.env.REACT_APP_IPFS_IMAGE_CID}.ipfs.nftstorage.link/${i.tokenId}.png`
      }
      return soldItem
    }))
//    setLoading(false)
    setSolds(solds)
  }


  useEffect(() => {
    loadPurchasedItems()
    loadSoldItems()
  }, [])

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
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
            <h2>No purchase history</h2>
          </main>
        )
      }

      {solds.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {solds.map((item, index) => (
              <Col key={index} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
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
            <h2>No sales history</h2>
          </main>
        )
      }
    </div>
  );
}

export default History;