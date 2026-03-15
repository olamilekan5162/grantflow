// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GrantEscrow
 * @dev Manages the escrow of HBAR for grants tracked via Hedera Consensus Service (HCS).
 */
contract GrantEscrow {
    // Emitted when a funder deposits HBAR for a specific grant
    event Deposited(string grantId, address funder, uint256 amount);
    
    // Emitted when funds are released to a recipient
    event Released(string grantId, address recipient, uint256 amount);
    
    // Emitted if a funder reclaims remaining funds
    event Refunded(string grantId, address funder, uint256 amount);

    struct Grant {
        address funder;
        uint256 balance;
    }

    // Mapping from HCS grantId to its on-chain escrow state
    mapping(string => Grant) public grants;

    /**
     * @dev Deposit HBAR into escrow for a newly created grant.
     * @param grantId The unique string identifier from HCS.
     */
    function deposit(string memory grantId) external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(grants[grantId].funder == address(0), "Grant already exists");

        grants[grantId] = Grant({
            funder: msg.sender,
            balance: msg.value
        });

        emit Deposited(grantId, msg.sender, msg.value);
    }

    /**
     * @dev Release a specific amount of HBAR to the recipient.
     * Only the funder who created the grant can call this.
     * @param grantId The unique string identifier from HCS.
     * @param recipient The address of the milestone recipient.
     * @param amount The amount of HBAR/wei to release.
     */
    function release(string memory grantId, address payable recipient, uint256 amount) external {
        Grant storage g = grants[grantId];
        
        require(g.funder == msg.sender, "Only the funder can release funds");
        require(g.balance >= amount, "Insufficient funds in escrow");
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        // Deduct balance before transfer to prevent re-entrancy
        g.balance -= amount;

        // Transfer HBAR
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit Released(grantId, recipient, amount);
    }

    /**
     * @dev Refund the remaining balance of a grant to the funder.
     * @param grantId The unique string identifier from HCS.
     */
    function refund(string memory grantId) external {
        Grant storage g = grants[grantId];
        
        require(g.funder == msg.sender, "Only the funder can refund");
        uint256 amount = g.balance;
        require(amount > 0, "No funds left to refund");

        g.balance = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");

        emit Refunded(grantId, msg.sender, amount);
    }
}
