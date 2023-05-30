import { Contract } from "ethers";
import { ethers } from "hardhat";
import { promises as fs } from "fs";

async function main() {
  const Mint = await ethers.getContractFactory("Mint");
  const mint = await Mint.deploy();
  await mint.deployed();
  console.log("Mint deployed to:", mint.address);
  await deploymentInfo(mint);
}
async function deploymentInfo(contract: Contract) {
  const data = {
    contract: {
      address: contract.address,
      abi: contract.interface.format(),
      signerAddress: contract.signer.address,
    },
  };
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile("deployment.json", content);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
