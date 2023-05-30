"use client";
import { ethers } from "ethers";
import { ABI } from "./ABI";
import { Filelike, Web3Storage } from "web3.storage";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Home() {
  const [mintAddress, setMintAddress] = useState<string>("");
  const [file, setFile] = useState<Iterable<Filelike>>();
  const [ipfsLink, setIpfsLink] = useState<string>("");
  // @ts-ignore to fix web3Provider ts types
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, ABI, signer);

  const getClient = () => {
    return new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN || "",
    });
  };

  const handleUploadImage = async (e: any) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    toast.success("File Uploaded");
  };

  const uploadtoIPFS = async () => {
    const client = getClient();
    if (!file) {
      toast.error("Please upload a file");
      return;
    }
    const cid = await client.put([file]);
    console.log(cid);
    setIpfsLink(`https://ipfs.io/ipfs/${cid}`);
    toast.success("File Uploaded to IPFS");
  };

  const mintToken = async () => {
    uploadtoIPFS();
    if (!mintAddress) {
      toast.error("Please enter a valid address");
      return;
    }
    const tx = await contract.mintToken(mintAddress, ipfsLink);
    console.log(tx);
    toast.promise(tx.wait(), {
      loading: "Minting Token",
      success: "Token Minted",
      error: "Error Minting Token",
    });
  };

  const getNoOfToken = async () => {
    const currentAddress = await signer.getAddress();
    const noOfTokens = await contract.balanceOf(currentAddress);
    toast.success(`No of NFT's in my wallet: ${noOfTokens}`);
  };

  const getToken = async () => {
    const token = await contract._tokenIds();
    toast.success(`Total No of NFT's Available: ${token}`);
  };
  return (
    <div className="m-5 flex-col flex gap-2">
      <div className="flex flex-row gap-5 items-center  bg-grey-lighter">
        <label className="w-64 flex flex-row gap-x-2  justify-center py-2 items-center px-4  bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white hover:bg-[#2590EB]">
          <svg
            className="w-6 h-6 "
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className=" text-base leading-normal">Select a file</span>
          <input type="file" className="hidden" onChange={handleUploadImage} />
        </label>

        <input
          type="text"
          className="border border-gray-300 p-2 rounded-lg w-2/4"
          placeholder="Enter your Address to mint"
          onChange={(e) => setMintAddress(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={mintToken}
        >
          Mint
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={getNoOfToken}
        >
          Token in my wallet
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={getToken}
        >
          Total Supply
        </button>
      </div>

      {/* <Image
        src={`https://ipfs.io/ipfs/bafkreigvftj3lmwifwevmpblkw7lhf4qmybabsuofgnaer6rhi6zv5skry`}
        alt="Picture of the author"
        width={500}
        height={500}
      /> */}
    </div>
  );
}
