// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


contract ImageRegistry {
    struct Image {
        address artist;
        bytes32 sha256Hash;
        bytes16 pHash;
        string ipfsHash;
        uint256 timestamp;
    }

    uint public imageCount = 0;
    mapping(uint => Image) public images;

    event ImageRegistered(
        uint indexed imageId,
        address indexed artist,
        bytes32 sha256Hash,
        bytes16 pHash,
        string ipfsHash,
        uint256 timestamp
    );

    function registerImage(bytes32 sha256Hash, bytes16 pHash, string memory ipfsHash) public {
        images[imageCount] = Image(msg.sender, sha256Hash, pHash, ipfsHash, block.timestamp);
        emit ImageRegistered(imageCount, msg.sender, sha256Hash, pHash, ipfsHash, block.timestamp);
        imageCount++;
    }
}
