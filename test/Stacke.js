const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Test contract", function () {
    async function deployFixture(){
        [owner, addr1, addr2] = await ethers.getSigners();
        const TestContract = await ethers.getContractFactory("ThemarStaking");
        const TestNFTContract = await ethers.getContractFactory("ThemarNFT");
        const TestRewardContract = await ethers.getContractFactory("ThemarReward");

        //Deploying contracts
        themarNFT = await TestNFTContract.deploy();
        contract = await TestContract.deploy();
        themarRewards = await TestRewardContract.deploy(contract.address);

        await themarNFT.deployed();
        await themarRewards.deployed();
        return {themarNFT, contract, themarRewards, owner, addr1, addr2 }
    }

    it("Staking and unstaking a token", async function () {
        const {
            constants,
            expectRevert,
        } = require('@openzeppelin/test-helpers');

        // Create the smart contract object to test from
        const {themarNFT, contract, themarRewards, owner, addr1} = await loadFixture(deployFixture);
        
        //Approvig address
        await expect(themarNFT.setApprovalForAll(
            contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(owner.address, contract.address,true);

        //Minting a token
        await expect(themarNFT.safeMint(addr1.address))
            .to.emit(themarNFT, "Transfer")
            .withArgs(constants.ZERO_ADDRESS, addr1.address, 0);
        
        //Initialize Stacking Contract
        await contract.initializeContract(themarRewards.address);
        
        
        await expect(themarNFT.connect(addr1).
            setApprovalForAll(contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(addr1.address,contract.address, true);

        //Staking 
        await expect(contract.connect(addr1).
            staking(themarNFT.address, [0])).to.
            emit(contract, "NFTStaked").
            withArgs(addr1.address, themarNFT.address, 0);

            
        
        await network.provider.send("evm_setNextBlockTimestamp", [8625097600])
        await network.provider.send("evm_mine")
        
        
        //Unstacking
        await expect(contract.connect(addr1).
            unStacking(addr1.address, themarNFT.address, 0)).to.
            emit(contract, "NFTUnStaked").
            withArgs(addr1.address, themarNFT.address, 0);

    });
    it("rateReward and minting tokens", async function () {
        const {
            constants,
            expectRevert,
        } = require('@openzeppelin/test-helpers');

        // Create the smart contract object to test from
        const {themarNFT, contract, themarRewards, owner, addr1} = await loadFixture(deployFixture);
        
        //Approvig address
        await expect(themarNFT.setApprovalForAll(
            contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(owner.address, contract.address,true);

        //Minting a token
        await expect(themarNFT.safeMint(addr1.address))
            .to.emit(themarNFT, "Transfer")
            .withArgs(constants.ZERO_ADDRESS, addr1.address, 0);
        
        //Initialize Stacking Contract
        await contract.initializeContract(themarRewards.address);
        
        
        await expect(themarNFT.connect(addr1).
            setApprovalForAll(contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(addr1.address,contract.address, true);

        //Staking 
        await expect(contract.connect(addr1).
            staking(themarNFT.address, [0])).to.
            emit(contract, "NFTStaked").
            withArgs(addr1.address, themarNFT.address, 0);

            
        
        await network.provider.send("evm_setNextBlockTimestamp", [8625097600])
        await network.provider.send("evm_mine")
        
        
        //Unstacking
        await expect(contract.connect(addr1).
            unStacking(addr1.address, themarNFT.address, 0)).to.
            emit(contract, "Liquidation").
            withArgs(addr1.address, themarNFT.address, 0);

    });

    it("Forcing and unstaking", async function () {
        const {
            constants,
            expectRevert,
        } = require('@openzeppelin/test-helpers');

        // Create the smart contract object to test from
        const {themarNFT, contract, themarRewards, owner, addr1} = await loadFixture(deployFixture);
        
        //Approvig address
        await expect(themarNFT.setApprovalForAll(
            contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(owner.address, contract.address,true);

        //Minting a token
        await expect(themarNFT.safeMint(addr1.address))
            .to.emit(themarNFT, "Transfer")
            .withArgs(constants.ZERO_ADDRESS, addr1.address, 0);
        
        //Initialize Stacking Contract
        await contract.initializeContract(themarRewards.address);
        
        
        await expect(themarNFT.connect(addr1).
            setApprovalForAll(contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(addr1.address,contract.address, true);

        //Staking 
        await expect(contract.connect(addr1).
            staking(themarNFT.address, [0])).to.
            emit(contract, "NFTStaked").
            withArgs(addr1.address, themarNFT.address, 0);

            
        
        await network.provider.send("evm_setNextBlockTimestamp", [8625097600])
        await network.provider.send("evm_mine")
        
        //ForcedUnstacking by the Owner
        await expect(contract.connect(owner).
            forcedUnStaking(addr1.address, themarNFT.address, 0)).to.
            emit(contract, "NFTForcedUnStaked").
            withArgs(addr1.address, themarNFT.address, 0);

    });

    it("Set price of a collection", async function () {
        const {
            constants,
            expectRevert,
        } = require('@openzeppelin/test-helpers');

        // Create the smart contract object to test from
        const {themarNFT, contract, themarRewards, owner, addr1} = await loadFixture(deployFixture);
        
        //Approvig address
        await expect(themarNFT.setApprovalForAll(
            contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(owner.address, contract.address,true);

        //Minting token 1
        await expect(themarNFT.safeMint(addr1.address))
            .to.emit(themarNFT, "Transfer")
            .withArgs(constants.ZERO_ADDRESS, addr1.address, 0);
        
        //Mint token 2
        await expect(themarNFT.safeMint(addr1.address))
        .to.emit(themarNFT, "Transfer")
        .withArgs(constants.ZERO_ADDRESS, addr1.address, 1);
        
        //Initialize Stacking Contract
        await contract.initializeContract(themarRewards.address);
        
        
        await expect(themarNFT.connect(addr1).
            setApprovalForAll(contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(addr1.address,contract.address, true);

        //Staking 
        await expect(contract.connect(addr1).
            staking(themarNFT.address, [0,1])).to.
            emit(contract, "NFTStaked").
            withArgs(addr1.address, themarNFT.address, 0);
        
        await network.provider.send("evm_setNextBlockTimestamp", [8625097600])
        await network.provider.send("evm_mine")
        
        //set price colection by the Owner
        await expect(contract.connect(owner).
            setInitialPrice(addr1.address, themarNFT.address, 100)).to.
            emit(contract, "setInitialPriceCollection").
            withArgs(addr1.address, themarNFT.address);

    });

    it("Price goes belows 50% of thge inicial price", async function () {
        const {
            constants,
            expectRevert,
        } = require('@openzeppelin/test-helpers');

        // Create the smart contract object to test from
        const {themarNFT, contract, themarRewards, owner, addr1} = await loadFixture(deployFixture);
        
        //Approvig address
        await expect(themarNFT.setApprovalForAll(
            contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(owner.address, contract.address,true);

        //Minting token 1
        await expect(themarNFT.safeMint(addr1.address))
            .to.emit(themarNFT, "Transfer")
            .withArgs(constants.ZERO_ADDRESS, addr1.address, 0);
        
        //Mint token 2
        await expect(themarNFT.safeMint(addr1.address))
        .to.emit(themarNFT, "Transfer")
        .withArgs(constants.ZERO_ADDRESS, addr1.address, 1);
        
        //Initialize Stacking Contract
        await contract.initializeContract(themarRewards.address);
        
        
        await expect(themarNFT.connect(addr1).
            setApprovalForAll(contract.address, true)).to.
            emit(themarNFT, "ApprovalForAll").
            withArgs(addr1.address,contract.address, true);

        //Staking 
        await expect(contract.connect(addr1).
            staking(themarNFT.address, [0,1])).to.
            emit(contract, "NFTStaked").
            withArgs(addr1.address, themarNFT.address, 0);
        
        await network.provider.send("evm_setNextBlockTimestamp", [8625097600])
        await network.provider.send("evm_mine")
        
        //setPrice by the Owner
        await expect(contract.connect(owner).
            setInitialPrice(addr1.address, themarNFT.address, 100)).to.
            emit(contract, "setInitialPriceCollection").
            withArgs(addr1.address, themarNFT.address);
        
        await expect(contract.connect(owner).
            setPrice(addr1.address, themarNFT.address, 50)).to.
            emit(contract, "setPriceCollection").
            withArgs(addr1.address, themarNFT.address);
        
        await expect(contract.connect(addr1).
            unStacking(addr1.address, themarNFT.address, 0)).to.
            emit(contract, "collectionPrice").
            withArgs(addr1.address, themarNFT.address);
    });
});
