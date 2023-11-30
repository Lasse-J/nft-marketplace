//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract NFT is ERC721URIStorage, Ownable {
	using Strings for uint256;

	uint256 public maxSupply;
	string public baseURI;
    string public baseExtension = ".json";
	uint256 public tokenCount;

	constructor(
		string memory _name,
		string memory _symbol,
		uint256 _maxSupply,
		string memory _baseURI
	) ERC721(_name, _symbol) {
		maxSupply = _maxSupply;
		baseURI = _baseURI;
	}

	function mint(string memory _tokenURI) public returns(uint256) {
		tokenCount ++;
		_safeMint(msg.sender, tokenCount);
		_setTokenURI(tokenCount, _tokenURI);
		return(tokenCount);
	}

	// Return metadata IPFS URI
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(uint256 _tokenId) 
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');
		return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }
}
