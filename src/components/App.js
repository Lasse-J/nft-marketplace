import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap'
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './Navigation';
import Buy from './Buy';
import List from './List';
import Mint from './Mint';
import History from './History';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNfts,
  loadMarketplace,
  loadAllItems
} from '../store/interactions';

function App() {
  const dispatch = useDispatch()

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
      await loadAccount(dispatch)
      await loadMarketplace(chainId, provider, dispatch)
    })

    // Initiate contracts
    await loadNfts(provider, chainId, dispatch)
    const marketplace = await loadMarketplace(chainId, provider, dispatch)

    // Load all marketplace items
    await loadAllItems(provider, marketplace, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return(
    <Container>
      <HashRouter>
        <Navigation/>
        <hr />
        <Routes>
          <Route exact path="/" element={<Buy />} />
          <Route path="/list" element={<List />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App;
