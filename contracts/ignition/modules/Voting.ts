import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  const initialOwner = m.getAccount(0); // first account from your deployer wallet
  const voting = m.contract("Voting", [initialOwner]); // pass as constructor arg

  return { voting };
});

export default VotingModule;
