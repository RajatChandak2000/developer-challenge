// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract LikeRegistry_V2 {

    mapping(uint => uint) public likeCount;


    mapping(uint => mapping(address => bool)) public liked;

    event PostLiked(uint indexed imageId, address indexed user, uint totalLikes);


    //Funcito to like a image on-chain and keep track of like count
    function likePost(uint imageId) public {
        require(!liked[imageId][msg.sender], "Already liked");

        liked[imageId][msg.sender] = true;
        likeCount[imageId] += 1;

        emit PostLiked(imageId, msg.sender, likeCount[imageId]);
    }

    //Check if a user as already liked an image on chain
    function hasLiked(uint imageId, address user) external view returns (bool) {
        return liked[imageId][user];
    }

    //To get a like count of image on chain
    function getLikes(uint imageId) external view returns (uint) {
        return likeCount[imageId];
    }
}