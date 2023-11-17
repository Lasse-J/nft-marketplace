import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './Navigation';
import Buy from './Buy';
import Sell from './Sell';
import Create from './Create';
import History from './History';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNfts,
  loadMarketplace,
  loadAllItems,
  loadBalances
} from '../store/interactions';

function App() {
  const dispatch = useDispatch()
  const account = useSelector(state => state.provider.account)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = await loadProvider(dispatch)

    // Fetch current network's chainId
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch current account from Metamask when account switched
    window.ethereum.on('accountsChanged', async () => {
      const account = await loadAccount(dispatch)
    })

    // Initiate contracts
    const nfts = await loadNfts(provider, chainId, dispatch)
    const marketplace = await loadMarketplace(chainId, provider, dispatch)

    // Load all marketplace items
    await loadAllItems(provider, marketplace, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  }, []);

  return(
    <Container>
      <HashRouter>

        <Navigation/>

        <hr />

        <Routes>
          <Route exact path="/" element={<Buy />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/create" element={<Create />} />
          <Route path="/history" element={<History />} />
        </Routes>

      </HashRouter>
    </Container>
  )
}

export default App;
