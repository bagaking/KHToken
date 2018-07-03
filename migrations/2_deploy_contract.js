let KHToken = artifacts.require("KHToken");
module.exports = function(deployer) {
  deployer.deploy(KHToken, "The Kh Token No.X", "KHTX", 10000000000, 18);
};