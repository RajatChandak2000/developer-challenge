import { ethers } from "hardhat";

async function main() {
  const LikeRegistry_V2 = await ethers.getContractFactory("LikeRegistry_V2");
  const likeRegistry = await LikeRegistry_V2.deploy();

  await likeRegistry.deployed();
  console.log(`LikeRegistry_V2 deployed at ${likeRegistry.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
