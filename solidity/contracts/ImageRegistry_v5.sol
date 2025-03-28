// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ImageRegistryV5 {
    struct Image {
        address uploader;               // Always msg.sender
        bytes32 sha256Hash;
        bytes16 pHash;
        string ipfsHash;
        uint256 timestamp;
        bool requireRoyalty;
        string originalArtistName;
        string originalOrg;
        address originalArtistAddress;
        bool isDerived;
        string duplicatorName;
        string duplicatorOrg;
    }

    uint public imageCount = 0;
    mapping(uint => Image) public images;
    mapping(uint => mapping(address => bool)) public royaltyPaid;

    event ImageRegistered(
        uint indexed imageId,
        address indexed uploader,
        bytes32 sha256Hash,
        bytes16 pHash,
        string ipfsHash,
        uint256 timestamp,
        bool requireRoyalty,
        string originalArtistName,
        string originalOrg,
        address originalArtistAddress,
        bool isDerived,
        string duplicatorName,
        string duplicatorOrg
    );

    event RoyaltyPaid(
        uint indexed imageId,
        address indexed payer,
        string payerName,
        string payerOrg
    );

    // 🔹 Register an original image
    function registerImage(
        bytes32 sha256Hash,
        bytes16 pHash,
        string memory ipfsHash,
        bool requireRoyalty,
        string memory artistName,
        string memory org
    ) public {
        images[imageCount] = Image(
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            requireRoyalty,
            artistName,
            org,
            msg.sender,
            false,
            "",
            ""
        );

        emit ImageRegistered(
            imageCount,
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            requireRoyalty,
            artistName,
            org,
            msg.sender,
            false,
            "",
            ""
        );

        imageCount++;
    }

    // 🔹 Register a derived image (duplicate)
    function registerDerivedImage(
        bytes32 sha256Hash,
        bytes16 pHash,
        string memory ipfsHash,
        string memory originalArtistName,
        string memory originalOrg,
        address originalArtistAddress,
        string memory duplicatorName,
        string memory duplicatorOrg
    ) public {
        images[imageCount] = Image(
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            false, // Derived images cannot require royalty
            originalArtistName,
            originalOrg,
            originalArtistAddress,
            true,
            duplicatorName,
            duplicatorOrg
        );

        emit ImageRegistered(
            imageCount,
            msg.sender,
            sha256Hash,
            pHash,
            ipfsHash,
            block.timestamp,
            false,
            originalArtistName,
            originalOrg,
            originalArtistAddress,
            true,
            duplicatorName,
            duplicatorOrg
        );

        imageCount++;
    }

    // 🔹 Pay royalty (for original images only)
    function payRoyalty(
        uint imageId,
        string memory payerName,
        string memory payerOrg
    ) public payable {
        require(imageId < imageCount, "Image does not exist");
        require(images[imageId].requireRoyalty, "Royalty not required for this image");
        require(!royaltyPaid[imageId][msg.sender], "Royalty already paid");

        royaltyPaid[imageId][msg.sender] = true;

        emit RoyaltyPaid(imageId, msg.sender, payerName, payerOrg);
    }

    // 🔹 Query royalty status
    function hasPaidRoyalty(uint imageId, address user) external view returns (bool) {
        return royaltyPaid[imageId][user];
    }
}
