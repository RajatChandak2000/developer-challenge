import { ethers } from "hardhat";

async function main() {
  const ImageRegistryV5 = await ethers.getContractFactory("ImageRegistryV5");
  const imageRegistry = await ImageRegistryV5.deploy();

  await imageRegistry.deployed();

  console.log("ImageRegistryV5 deployed to:", imageRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});