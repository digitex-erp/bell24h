// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Bell24Token
 * @dev ERC20 Token for Bell24h marketplace rewards
 */
contract Bell24Token is ERC20, Ownable {
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event RewardDistributed(address indexed to, uint256 amount, string activity);
    
    constructor() ERC20("Bell24h Token", "B24") Ownable(msg.sender) {
        // Initial supply minted to the contract creator
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 1 million tokens
    }
    
    /**
     * @dev Mint new tokens (only contract owner)
     * @param to Address receiving the tokens
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting
     */
    function mint(address to, uint256 amount, string memory reason) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Distribute rewards for marketplace activities
     * @param to Address receiving the reward
     * @param amount Amount of tokens to reward
     * @param activity Activity type being rewarded
     */
    function distributeReward(address to, uint256 amount, string memory activity) public onlyOwner {
        require(balanceOf(owner()) >= amount, "Insufficient tokens for reward");
        _transfer(owner(), to, amount);
        emit RewardDistributed(to, amount, activity);
    }
}