// contracts/ImageRegistryV2.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ImageRegistryV2 {
    struct Image {
        address artist;
        bytes32 sha256Hash;
        bytes16 pHash;
        string ipfsHash;
        uint256 timestamp;
        bool requireRoyalty;
    }

    uint public imageCount = 0;

    //To keep track of images uploaded on chain
    mapping(uint => Image) public images;

    //To keep track if royalty paid to the oringal artist
    mapping(uint => mapping(address => bool)) public royaltyPaid;

    event ImageRegistered(
        uint indexed imageId,
        address indexed artist,
        bytes32 sha256Hash,
        bytes16 pHash,
        string ipfsHash,
        uint256 timestamp,
        bool requireRoyalty
    );

    event RoyaltyPaid(uint indexed imageId, address indexed payer);

    function registerImage(
        bytes32 sha256Hash,
        bytes16 pHash,
        string memory ipfsHash,
        bool requireRoyalty
    ) public {
        images[imageCount] = Image(
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            requireRoyalty
        );

        emit ImageRegistered(
            imageCount,
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            requireRoyalty
        );

        imageCount++;
    }

    function payRoyalty(uint imageId) public payable {
        require(imageId < imageCount, "Image does not exist");
        require(images[imageId].requireRoyalty, "Royalty not required for this image");
        require(!royaltyPaid[imageId][msg.sender], "Royalty already paid");

        royaltyPaid[imageId][msg.sender] = true;
        emit RoyaltyPaid(imageId, msg.sender);
    }

    function hasPaidRoyalty(uint imageId, address user) external view returns (bool) {
        return royaltyPaid[imageId][user];
    }
}
