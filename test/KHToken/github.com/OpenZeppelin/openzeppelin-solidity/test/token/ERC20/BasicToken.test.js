const { assertRevert } = require('../../helpers/assertRevert'); 

// const BasicToken = artifacts.require('BasicTokenMock');
// kh. openzeppelin-solidity/contracts/mocks/BasicTokenMock.sol : openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol
const KHToken = artifacts.require('KHToken');

contract(
  'BasicToken : KHToken test from https://github.com/OpenZeppelin/openzeppelin-solidity/test/token/ERC20/ | master | commit 8fd072cf8e48198e3310193cc0ba21610250caf6', 
  function ([_, owner, recipient, anotherAccount]
) {
    
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    this.token = await KHToken.new('KH Token No.X', 'TAT', 10, 1, { from: owner });
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();

      assert.equal(totalSupply, 100);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(anotherAccount);

        assert.equal(balance, 0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner);

        assert.equal(balance, 100);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          const senderBalance = await this.token.balanceOf(owner);
          assert.equal(senderBalance, 0);

          const recipientBalance = await this.token.balanceOf(to);
          assert.equal(recipientBalance, amount);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Transfer');
          // kh. # format
          //assert.equal(logs[0].args.from, owner);
          //assert.equal(logs[0].args.to, to);
          //assert(logs[0].args.value.eq(amount));
          assert.equal(logs[0].args._from, owner);
          assert.equal(logs[0].args._to, to);
          assert(logs[0].args._value.eq(amount)); 
          /* reference 
            [ 
              { 
                logIndex: 0,
                transactionIndex: 0,
                transactionHash: '0xa1cb046876505d9590f4c7626d1bc8afa82ea94c0c14637c056b4ad905754d99',
                blockHash: '0x48804be91a25c42008ad918e71cceb8e98aa8227b3bc4edafd000c58527e23f8',
                blockNumber: 13,
                address: '0x7105a11e8487bfaf8c02aa6a7cda5283f971107c',
                type: 'mined',
                event: 'Transfer',
                args:
                { _from: '0xf17f52151ebef6c7334fad080c5704d77216b732',
                  _to: '0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef',
                  _value: [Object] 
                } 
              } 
            ]
          */
          // kh.done 
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });
});