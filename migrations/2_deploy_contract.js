let KHToken = artifacts.require("KHToken");
let KHToken_EIP20 = artifacts.require("KHToken_EIP20");
let KHToken_StandardToken = artifacts.require("KHToken_StandardToken");
let TAT = artifacts.require("TAT");
module.exports = function(deployer) {
  deployer.deploy(KHToken, "The Kh Token No.X", "KHT", 10000000000, 18);
  deployer.deploy(KHToken_EIP20, "The Kh Token Standard", "KHTS", 10000000000, 18);
  deployer.deploy(KHToken_StandardToken, "The Kh Token Standard", "KHTS", 10000000000, 18); 
};