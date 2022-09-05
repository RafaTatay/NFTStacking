// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

///@author Rafael Estellés Tatay
///@title A NFT staking contract

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

interface IThemarToken is IERC20 {
    function mint(address to, uint256 amount) external;
}
contract ThemarStaking is IERC721Receiver{
    using SafeMath for uint256; 
    //Period time stacking 
    uint256 constant period = 75 days;
    //Reward Token
    IThemarToken public tokenRewards;

    address public owner;
    bool public initialize = false;
    
    struct Stakes {
        Collection[] collection;
        ///collection - > map(idToken -> tiempo)
        mapping(address => mapping(uint256 => uint256)) blockedTime;
        uint256 rewards; 
        mapping(address => uint256) indexC;
        
    }

    struct Collection{
        address addressCollection;
        uint256[] idTokens; ///Ids de todos los NFTs de una colección
        uint256 price; 
    }

    ///Map for address to Stakes
    mapping(address => Stakes) public stakes;

    mapping(address => Collection) public collections;

    ///Map for id to address
    mapping(uint256 => address) public ownerStake;

    ///collection to prices
    mapping(address => uint256) public prices;

    ///Coleccion ->map(id -> owner)
    mapping(address => mapping(uint256 => address)) ownerToken;
    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    
    
    ///@notice This event is acctivated when someone stake a nft
    event NFTStaked(address owner, address collection, uint256 idToken);

    ///@notice This event is acctivated when someone unstake a nft
    event NFTUnStaked(address owner, address collection, uint256 idToken);

    ///@notice This event is acctivated at forcedUnstaking 
    event NFTForcedUnStaked(address user, address collection, uint256 idToken);

    ///@notice Thhs event is activated when liquidation process start
    event Liquidation(address owner, address collection, uint256 idToken);

    ///@notice This event is activated when collectioon 50% price
    event collectionPrice(address owner, address collection);

    ///@notice This event is activated when price of a collection is initialize
    event setInitialPriceCollection(address owner, address collection);

    ///@notice This event is activated when price of a collection is modified
    event setPriceCollection(address owner, address collection);

    ///@notice Initialize the contract
    ///@param _tokenReward token that will be used as a reward
    function initializeContract( IThemarToken _tokenReward ) public onlyOwner{
        require(!initialize, "Already initialize");
        tokenRewards = _tokenReward;
        initialize = true;
    }

    ///@notice Calculate reward based on your time staked
    ///@param _user the addres of the user
    ///@param _collection is the addres of a collection
    ///@param _id the id of the token to calculate the reward
    function rateReward(address _user, address _collection, uint256 _id) internal{
        require(IERC721(_collection).ownerOf(_id) == msg.sender, "You are not the OWNER");
        
        uint256 reward = calculateRate(_user,_collection,_id);
        uint256 timeBlocked = block.timestamp - stakes[_user].blockedTime[_collection][_id];
        uint256 amount = (timeBlocked / 86400) * reward;

        tokenRewards.mint(_user, amount); 
        emit Liquidation(_user, _collection, _id);
    }

    ///@notice Calculate the reward factor
    ///@return reward factor used on rateReward function
    function calculateRate(address _user, address _collection, uint256 _id) private view returns(uint8) {
        uint256 timeBlocked = block.timestamp - stakes[_user].blockedTime[_collection][_id];
        if(block.timestamp - timeBlocked < period) {
            return 0;
        } else if(block.timestamp - timeBlocked <  period * 3 ) {
            return 3;
        } else if(block.timestamp - timeBlocked < period * 5) {
            return 6;
        } else {
            return 7;
        }
    }

    ///@notice Stake all the collection
    ///@param _collection is the addres of a collection
    ///@param _id id of a collection to stake
    function staking(address _collection, uint256[] memory _id) public{
        require(initialize, "Not initialize");
        Stakes storage stake = stakes[msg.sender];
        Collection storage collection = collections[msg.sender];
        collection.addressCollection = msg.sender;
        uint256 lenId = _id.length;

        for(uint256 i= 0; i < lenId;){
            require(IERC721(_collection).ownerOf(_id[i]) == msg.sender, "You are not the OWNER");
            
            collection.idTokens.push(_id[i]);
            stake.blockedTime[_collection][_id[i]] = block.timestamp;
            ownerToken[_collection][_id[i]] = msg.sender;
            IERC721(_collection).safeTransferFrom(msg.sender, address(this),_id[i]);
            
            emit NFTStaked(msg.sender, _collection, _id[i]);
            unchecked { ++i;}
        }
        stake.collection.push(collection);
        stake.indexC[_collection] = stake.collection.length - 1;
    }

    ///@notice unStacking funtion with rewards
    ///@param _user the addres of the user
    ///@param _collection is the addres of a collection
    ///@param _id the id of the token to unStake
    function unStacking(address _user, address _collection, uint256 _id) public{
        require(ownerToken[_collection][_id] == msg.sender, "You are not the OWNER");
        
        _unStacking(_user, _collection, _id);
        rateReward(_user,_collection, _id);
    }

    ////@notice function to execute the liquididation process 
    ///@param _user addres of the owner wants to force unstaking process
    function forcedUnStaking(address _user, address _collection, uint256 _id) public onlyOwner{
        _unStacking(_user, _collection, _id);
        emit NFTForcedUnStaked(_user, _collection, _id);

    }
    
    ///@notice unStacking general funtion
    ///@param _user the addres of the user
    ///@param _collection is the addres of a collection
    ///@param _id the id of the token to unStake
    function _unStacking(address _user, address _collection, uint256 _id) internal{
        
        IERC721(_collection).safeTransferFrom(address(this), _user, _id);
        
        Collection memory collection = stakes[_user].collection[stakes[_user].indexC[_collection]];
        if(collection.price  >= prices[_collection] * 2){
            emit collectionPrice(_user,_collection);
        }
        delete collection;  

        emit NFTUnStaked(_user, _collection, _id);

    }
    function onERC721Received( address operator, address from, uint256 tokenId, bytes calldata data ) public override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function setInitialPrice(address _user, address _collection, uint256 _newPrice) public onlyOwner {
        Stakes storage stake = stakes[_user];
        stake.collection[stake.indexC[_collection]].price = _newPrice;
        emit setInitialPriceCollection(_user, _collection);
    }
    
    function setPrice(address _user, address _collection, uint256 _newPrice) public onlyOwner {
        prices[_collection] = _newPrice;
        emit setPriceCollection(_user, _collection);
    }

}
