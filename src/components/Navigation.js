import { useSelector, useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';

import { loadAccount, loadBalances } from '../store/interactions';

import config from '../config.json'

const Navigation = () => {
  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const ethBalance = useSelector(state => state.provider.ethBalance);
  const nfts = useSelector(state => state.nfts.contracts);
  const dispatch = useDispatch();

  const connectHandler = async () => {
    const account = await loadAccount(dispatch)
    await loadBalances(nfts, account, dispatch, provider)
  }

  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }],
    })
  }

  return (
    <nav>
      <div className='nav__brand'>
        <h1>Lasse NFT Marketplace</h1>
      </div>
      { ethBalance ? (
        <div className='nav__balance'>
          {ethBalance.toString().slice(0, 9)} ETH
        </div>
      ) : (
        <div></div>
      )}
      <div className='nav__network'>
        <Form.Select
          aria-label="Network Selector"
          value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
          onChange={networkHandler}
          style={{ maxWidth: '180px', marginRight: '20px', marginLeft: '20px' }}
        >
          <option value="0" disabled>Select Network</option>
          <option value="0x7A69">Localhost</option>
          <option value="0x5">Goerli</option>
          <option value="0xaa36a7">Sepolia</option>
        </Form.Select>
      </div>
        {account ? (
          <button
            type="button"
            className='nav__connect'
          >
            {account.slice(0, 6) + '...' + account.slice(38, 42)}
          </button>
        ) : (
          <button
            type="button"
            className='nav__connect'
            onClick={connectHandler}
          >
            Connect
          </button>
        )}
    </nav>
  );
}

export default Navigation;
