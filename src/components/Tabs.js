import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';

const Tabs = () => {
  return (
      <Nav variant="pills" defaultActiveKey="/" className='nav__tabs justify-content-center'>
        <LinkContainer to="/">
          <Nav.Link>Buy</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/sell">
          <Nav.Link>Sell</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/create">
          <Nav.Link>Create</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/history">
          <Nav.Link>History</Nav.Link>
        </LinkContainer>
      </Nav>
  );
}

export default Tabs;