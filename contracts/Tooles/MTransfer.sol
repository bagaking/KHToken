/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * See https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    
    function allowance(address owner, address spender) public view returns (uint256);
    function approve(address spender, uint256 value) public returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
    
    event Transfer(
        address indexed _from, 
        address indexed _to, 
        uint256 _value
    );
} 

contract MTransfer {
    
    address public admin;
    
    ERC20Basic public contract_instance;
    
    constructor(
        address _contract_addr
    ) public {
        contract_instance = ERC20Basic(_contract_addr);
    }
    
    function transferSingle(address dest, uint256 value) {
        contract_instance.transferFrom(msg.sender, dest, value);
    }
    
    function transfer(address[] dests, uint256[] values) returns (uint256) {
        uint256 count = 0;
        while (count < dests.length) {
            transferSingle(dests[count], values[count]);
            count += 1;
        }
        return count;
    }
    
    function balances(address[] dests) view returns (uint256[]) {
        uint256[] res;
        res.push(0);
        uint256 i = 0;
        while (i++ < dests.length) {
            uint256 b = contract_instance.balanceOf(dests[i]);
            res.push(b);
        }
        return res;
    }
} 

