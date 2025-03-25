import { ethers } from "hardhat";

async function main() {
  const ImageRegistryV2 = await ethers.getContractFactory("ImageRegistryV2");
  const imageRegistry = await ImageRegistryV2.deploy();

  await imageRegistry.deployed();

  console.log("✅ ImageRegistryV2 deployed to:", imageRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});