import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NFTStorage, File } from 'nft.storage';
import { pack } from 'ipfs-car/pack';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

import Spinner from 'react-bootstrap/Spinner';

const Create = () => {
  const provider = useSelector(state => state.provider.connection);
  const nfts = useSelector(state => state.nfts.contracts);
  const tokenCount = useSelector(state => state.nfts.tokenCount[1]);
  const marketplace = useSelector(state => state.marketplace.contract);

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [aiURL, setAiURL] = useState(null)
  const [aiBaseURI, setAiBaseURI] = useState(null)
  const [current_AI_CID, setCurrent_AI_CID] = useState(null)

  const [message, setMessage] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()

    if (name === "" || description === "") {
      window.alert("Please provide a name and a description")
      return
    }

    setIsWaiting(true)

    // Call AI API to generate image based on description
    const imageData = createImage()

    // Upload image to IPFS (NFT.Storage)
    const url = await uploadImage(imageData)

    // Mint NFT
//    await mintImage(aiBaseURI)

    // List NFT to Marketplace
    const signer = await provider.getSigner()
    let price = 1
    const tokenId = `${tokenCount}`
    console.log('tokenId', tokenId)
    let transaction = await nfts[1].connect(signer).setApprovalForAll(marketplace.address, true)
    transaction.wait()
    transaction = await marketplace.connect(signer).createItem(nfts[1].address, tokenId, price)
    transaction.wait()

    setIsWaiting(false)
    setMessage("")
  }

  const createImage = async () => {
    setMessage("Generating image...")

    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`

    // Send the request
    const response = await axios({
      url: URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: description, options: { wait_for_model: true },
      }),
      responseType: 'arraybuffer',
    })

    const type = response.headers['content-type']
    const data = response.data

    const base64data = Buffer.from(data).toString('base64')
    const img = `data:${type};base64,` + base64data // <-- This is so we can render it on the page
    setImage(img)

    return data
  }

  const uploadImage = async (imageData) => {
    setMessage("Uploading image...")

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], `${tokenCount}.jpeg`, { type: "image/jpeg" }),
      name: name,
      description: description,
      tokenId: `${tokenCount}`
    })

    // Save the URL that comes back
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setAiURL(url)
    console.log('url', url)
    console.log('aiURL', aiURL)

    // Construct and save the aiBaseURI
    const aiBaseURI = `ipfs://${ipnft}/`
    setAiBaseURI(aiBaseURI)
//  }

//  const mintImage = async (ipnft) => {
    setMessage("Waiting for Mint...")

    console.log('aiBaseURI', aiBaseURI)
    console.log('tokenId', `${tokenCount}`)
    const tokenId = `${tokenCount}`
    const signer = await provider.getSigner()
    const transaction = await nfts[1].connect(signer).mint(`${aiBaseURI}/${tokenCount}`)
    await transaction.wait()

    const aiTokenURI = await nfts[1].aiTokenURI(aiBaseURI, tokenId)
    console.log('aiTokenURI', aiTokenURI)

    const current_AI_CID = `${aiBaseURI.slice(7, 66)}`
    console.log('current_AI_CID', current_AI_CID)
    setCurrent_AI_CID(current_AI_CID)
  }

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

export default Create;