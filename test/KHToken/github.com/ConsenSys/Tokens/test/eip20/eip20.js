const { assertRevert } = require('../helpers/assertRevert');
const KHToken = artifacts.require('KHToken');

let KHT;
const MAX_VALUE = 2 ** 256 - 1;

contract('EIP20 test from https://github.com/ConsenSys/Tokens/test/ | master | commit 812791dfbf3c9a9f5e8370e26cda0009bde43f03', (accounts) => {
  beforeEach(async () => {
    KHT = await KHToken.new('KH Token No.X', 'TAT', 1000, 1, { from: accounts[0] });
  });
 
  //kh.
  it('const: 1: MAX_VALUE should correst', async () => { 
    assert.strictEqual(MAX_VALUE, 115792089237316195423570985008687907853269984665640564039457584007913129639935);
  });
  //kh.done

  it('creation: 1: should create an initial balance of 10000 (kh: with decimals == 1) for the creator', async () => {
    const balance = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), 10000);
  });

  it('creation: 2: test correct setting of vanity information', async () => {
    const name = await KHT.name.call();
    assert.strictEqual(name, 'KH Token No.X');

    const symbol = await KHT.symbol.call();
    assert.strictEqual(symbol, 'TAT');

    const decimals = await KHT.decimals.call();
    assert.strictEqual(decimals.toNumber(), 1);

    // kh.
    const claimAmount = await KHT.claimAmount.call();
    assert.strictEqual(claimAmount.toNumber(), 1000);

    const totalSupply = await KHT.totalSupply.call();
    assert.strictEqual(totalSupply.toNumber(), 1000 * 10 ** decimals);
    // kh.end
  });

  it('creation: 3: should succeed in creating over 2^256 - 1 (max) tokens', async () => {
    // 2^256 - 1
    /* const KHT2 = await KHToken.new('KH Token No.X', 'TAT','115792089237316195423570985008687907853269984665640564039457584007913129639935', 1,  { from: accounts[0] }); */
    // kh.
    const KHT2 = await KHToken.new('KH Token No.X', 'TAT','115792089237316195423570985008687907853269984665640564039457584007913129639935', 0,  { from: accounts[0] });
    // kh.end
    const totalSupply2 = await KHT2.totalSupply();
    const match2 = totalSupply2.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
    assert(match2, 'result is not correct'); 
  });

  // TRANSERS
  // normal transfers without approvals
  it('transfers: 1: ether transfer should be reversed.', async () => {
    const balanceBefore = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balanceBefore.toNumber(), 10000);

    await assertRevert(new Promise((resolve, reject) => {
      web3.eth.sendTransaction({ from: accounts[0], to: KHT.address, value: web3.toWei('10', 'Ether') }, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    }));

    const balanceAfter = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balanceAfter.toNumber(), 10000);
  });

  it('transfers: 2: should transfer 10000 to accounts[1] with accounts[0] having 10000', async () => {
    await KHT.transfer(accounts[1], 10000, { from: accounts[0] });
    const balance = await KHT.balanceOf.call(accounts[1]);
    assert.strictEqual(balance.toNumber(), 10000);
  });

  it('transfers: 3: should fail when trying to transfer 10001 to accounts[1] with accounts[0] having 10000', async () => {
    await assertRevert(KHT.transfer.call(accounts[1], 10001, { from: accounts[0] }));
  });

  it('transfers: 4: should handle zero-transfers normally', async () => {
    assert(await KHT.transfer.call(accounts[1], 0, { from: accounts[0] }), 'zero-transfer has failed');
  });

  // NOTE: testing uint256 wrapping is impossible since you can't supply > 2^256 -1
  // todo: transfer max amounts

  // APPROVALS
  it('approvals: 1: msg.sender should approve 100 to accounts[1]', async () => {
    await KHT.approve(accounts[1], 100, { from: accounts[0] });
    const allowance = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance.toNumber(), 100);
  });

  // bit overkill. But is for testing a bug
  it('approvals: 2: msg.sender approves accounts[1] of 100 & withdraws 20 once.', async () => {
    const balance0 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 10000);

    await KHT.approve(accounts[1], 100, { from: accounts[0] }); // 100
    const balance2 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 0, 'balance2 not correct');

    await KHT.transferFrom.call(accounts[0], accounts[2], 20, { from: accounts[1] });
    await KHT.allowance.call(accounts[0], accounts[1]);
    await KHT.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] }); // -20
    const allowance01 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 80); // =80

    const balance22 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 20);

    const balance02 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance02.toNumber(), 9980);
  });

  // should approve 100 of msg.sender & withdraw 50, twice. (should succeed)
  it('approvals: 3: msg.sender approves accounts[1] of 100 & withdraws 20 twice.', async () => {
    await KHT.approve(accounts[1], 100, { from: accounts[0] });
    const allowance01 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 100);

    await KHT.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance012 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance012.toNumber(), 80);

    const balance2 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 20);

    const balance0 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 9980);

    // FIRST tx done.
    // onto next.
    await KHT.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance013 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance013.toNumber(), 60);

    const balance22 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 40);

    const balance02 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance02.toNumber(), 9960);
  });

  // should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it('approvals: 4: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', async () => {
    await KHT.approve(accounts[1], 100, { from: accounts[0] });
    const allowance01 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 100);

    await KHT.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
    const allowance012 = await KHT.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance012.toNumber(), 50);

    const balance2 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 50);

    const balance0 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 9950);

    // FIRST tx done.
    // onto next.
    await assertRevert(KHT.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] }));
  });

  it('approvals: 5: attempt withdrawal from account with no allowance (should fail)', async () => {
    await assertRevert(KHT.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] }));
  });

  it('approvals: 6: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.', async () => {
    await KHT.approve(accounts[1], 100, { from: accounts[0] });
    await KHT.transferFrom(accounts[0], accounts[2], 60, { from: accounts[1] });
    await KHT.approve(accounts[1], 0, { from: accounts[0] });
    await assertRevert(KHT.transferFrom.call(accounts[0], accounts[2], 10, { from: accounts[1] }));
  });

  it('approvals: 7: approve max (2^256 - 1)', async () => {
    await KHT.approve(accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0] });
    const allowance = await KHT.allowance(accounts[0], accounts[1]);
    assert(allowance.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77'));
  });

  // should approve max of msg.sender & withdraw 20 without changing allowance (should succeed).
  it('approvals: 8: msg.sender approves accounts[1] of max (2^256 - 1) & withdraws 20', async () => {
    const balance0 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 10000);

    const max = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
    await KHT.approve(accounts[1], max, { from: accounts[0] });
    const balance2 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 0, 'balance2 not correct');

    await KHT.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance01 = await KHT.allowance.call(accounts[0], accounts[1]);
    //kh. # contract difference
    assert.strictEqual(allowance01.toNumber(), MAX_VALUE - 20);
    //kg.done

    const balance22 = await KHT.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 20);

    const balance02 = await KHT.balanceOf.call(accounts[0]);
    assert.strictEqual(balance02.toNumber(), 9980);
  });

  /* eslint-disable no-underscore-dangle */
  it('events: 1: should fire Transfer event properly', async () => {
    const res = await KHT.transfer(accounts[1], '2666', { from: accounts[0] });
    const transferLog = res.logs.find(element => element.event.match('Transfer'));
    assert.strictEqual(transferLog.args._from, accounts[0]);
    assert.strictEqual(transferLog.args._to, accounts[1]);
    assert.strictEqual(transferLog.args._value.toString(), '2666');
  });

  it('events: 2: should fire Transfer event normally on a zero transfer', async () => {
    const res = await KHT.transfer(accounts[1], '0', { from: accounts[0] });
    const transferLog = res.logs.find(element => element.event.match('Transfer'));
    assert.strictEqual(transferLog.args._from, accounts[0]);
    assert.strictEqual(transferLog.args._to, accounts[1]);
    assert.strictEqual(transferLog.args._value.toString(), '0');
  });

  it('events: 3: should fire Approval event properly', async () => {
    const res = await KHT.approve(accounts[1], '2666', { from: accounts[0] });
    const approvalLog = res.logs.find(element => element.event.match('Approval'));
    assert.strictEqual(approvalLog.args._owner, accounts[0]);
    assert.strictEqual(approvalLog.args._spender, accounts[1]);
    assert.strictEqual(approvalLog.args._value.toString(), '2666');
  });
});