//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {

	address payable public immutable feeAccount;
	uint256 public immutable feePercent;
	uint256 public itemCount;

	struct Item {
		// Attributes of a marketplace item
			// token ID
			// address of the NFT contract
			// seller's price
			// seller's address
			// active: listed or not?
		uint256 tokenId;
		IERC721 nft;
		uint256 price;
		address payable seller;
		bool active;
	}

	// Mapping to store all items (key: token ID => value: Item)
	mapping(uint256 => Item) public items;

	// Events
	event ItemEvent (
		uint256 tokenId,
		address indexed nft,
		uint256 price,
		address indexed seller,
		bool active
	);

	event Bought (
		uint256 tokenId,
		address indexed nft,
		uint256 price,
		address indexed seller,
		address indexed buyer
	);

	constructor(uint256 _feePercent) {
		feeAccount = payable(msg.sender);
		feePercent = _feePercent;
	}

	// Marketplace Functions
	function createItem(
		IERC721 _nft,
		uint256 _tokenId,
		uint256 _price
	) external nonReentrant {
		
		// Price can't be zero or negative
		require(_price > 0, 'Price must be greater than 0');
		require(_nft.ownerOf(_tokenId) == msg.sender, 'Only the owner of NFT can list');

		// Adds new item to the itemCount state
		itemCount ++;

		// Transfers NFT from user to marketplace
		_nft.transferFrom(msg.sender, address(this), _tokenId);

		// Adds new item to the items mapping
		items[_tokenId] = Item (
			_tokenId,
			_nft,
			_price,
			payable(msg.sender),
			true
		);

		// Emit ItemEvent event
		emit ItemEvent(
			_tokenId,
			address(_nft),
			_price,
			msg.sender,
			true
		);
	}

	function buyItem(uint256 _tokenId) external payable nonReentrant {

		// Fetch item from items mapping
		Item storage item = items[_tokenId];

		// Calculate total price
		uint256 _totalPrice = getTotalPrice(item.tokenId); // dont use itemId

		// Requirements for buying
//		require(_itemId > 0 && _itemId <= itemCount, 'Item does not exist');
		require(msg.value >= _totalPrice, 'Not enough Ether to buy item');
		require(item.active, 'Item is not active in marketplace');

		// Payment to seller
		item.seller.transfer(item.price);

		// Payment to feeAccount
		feeAccount.transfer(_totalPrice - item.price);

		// Update to inactive
		item.active = false;

		// Transfer NFT to buyer
		item.nft.transferFrom(address(this), msg.sender, item.tokenId);

		// Emit Bought event
		emit Bought(
			item.tokenId,
			address(item.nft),
			item.price,
			item.seller,
			msg.sender
		);

		// Emit ItemEvent event
		emit ItemEvent(
			item.tokenId,
			address(item.nft),
			item.price,
			item.seller,
			false
		);
	}

	function getTotalPrice(uint256 _tokenId) view public returns(uint256) {
		return(items[_tokenId].price*(100 + feePercent)/100);
	}

	function getActiveBool(uint256 _tokenId) view public returns(bool) {
		return(items[_tokenId].active);
	}
}
