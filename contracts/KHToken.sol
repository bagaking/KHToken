pragma solidity ^0.4.23; 

library MUI256 {  
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(a >= b); 
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
} 

contract ERC20Base {  
    // region{fields}
    string public name;                         
    string public symbol;            
    uint8 public decimals;              
    uint256 public totalSupply; 
 
    // region{call}
    function balanceOf(address _owner) public view returns (uint256 balance); 
    function allowance(address _owner, address _spender) public view returns (uint256 remaining); 

    // region{transfer}
    function transfer(address _to, uint256 _value) public returns (bool success); 
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success); 
    function approve(address _spender, uint256 _value) public returns (bool success); 
    
    // region{events}
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
} 

contract KHToken is ERC20Base {
    using MUI256 for uint256; 

    uint256 public claimAmount;

    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed; 
 
    // region{Constructor}

    // note : [(final)totalSupply] >> claimAmount * 10 ** decimals
    // example : args << "The Kh Token No.X", "KHTX", "10000000000", "18"
    constructor(
        string _token_name, 
        string _symbol, 
        uint256 _claim_amount, 
        uint8 _decimals
    ) public {
        name = _token_name;                              
        symbol = _symbol;     
        claimAmount = _claim_amount;                                     
        decimals = _decimals;
        totalSupply = claimAmount.mul(10 ** uint256(decimals)); 
        balances[msg.sender] = totalSupply;   
        emit Transfer(0x0, msg.sender, totalSupply); 
    }

    // region{call}

    function balanceOf(
        address _owner
    ) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function allowance(
        address _owner, 
        address _spender
    ) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    // region{transfer}

    function transfer(
        address _to, 
        uint256 _value
    ) public returns (bool success) {  
        _trans(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from, 
        address _to, 
        uint256 _value
    ) public returns (bool success) { 
        require(_value <= allowed[_from][msg.sender]); 
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value); 
        _trans(_from, _to, _value);
        return true;
    } 

    function approve(
        address _spender, 
        uint256 _value
    ) public returns (bool success) { 
        // race condition see : https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require((_value == 0) || (allowed[msg.sender][_spender] == 0), "reset allowance to 0 before change it's value.");
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); 
        return true;
    } 

     // ===== private methods =====
    function _trans(address _from, address _to, uint256 _value) internal {
        require(_to != address(0));
        require(balances[_from] >= _value); 
        require(balances[_to] + _value >= balances[_to]);

        uint256 _previous_total = balances[_from] + balances[_to];
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value); 
        assert(balances[_from] + balances[_to] == _previous_total);
    }
}
