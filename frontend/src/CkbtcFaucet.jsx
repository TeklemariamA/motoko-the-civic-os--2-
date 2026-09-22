import React, { useState, useEffect } from 'react';
import { backend } from './declarations/backend/index.js';
import { ShareBar } from './ShareBar.jsx';
import { useTranslation } from './i18n.jsx';

export function CkbtcFaucet() {
  const { t } = useTranslation();
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [withdrawAmt, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleError = (e) => {
    let msg = e.toString();
    if (msg.includes("assertion failed")) {
      setError(t('ckbtc.authRequired', "Internet Identity Required: You are interacting as an Anonymous user. Please use the 'Login II' button in the top right corner to authenticate first."));
    } else {
      setError(msg);
    }
  };

  const getDepositAddress = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const addr = await backend.getBtcDepositAddress();
      setAddress(addr);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const checkDeposit = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await backend.checkBtcDeposit();
      if (res.Ok) {
        setMessage(t('ckbtc.depositSuccess', { count: res.Ok.length }, `Success! Processed ${res.Ok.length} deposits.`));
        await loadBalance();
      } else {
        if (res.Err.NoNewUtxos) {
          setMessage(t('ckbtc.noNewDeposits', "No new Bitcoin deposits found yet. Keep waiting for confirmations."));
        } else {
          setMessage(t('common.status', 'Status: ') + Object.keys(res.Err)[0]);
        }
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const balStr = await backend.getCkbtcBalance();
      setBalance(balStr.toString());
    } catch (e) {
      // silent fail if anonymous
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddr || !withdrawAmt) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await backend.withdrawBtc(withdrawAddr, BigInt(withdrawAmt));
      if (res.Ok) {
        setMessage(t('ckbtc.withdrawSuccess', { blockIndex: res.Ok.block_index }, `Withdrawal successful! Block index: ${res.Ok.block_index}`));
        await loadBalance();
      } else {
        setError(t('ckbtc.withdrawFailed', { reason: Object.keys(res.Err)[0] }, `Withdrawal failed: ${Object.keys(res.Err)[0]}`));
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-orange-500">{t('ckbtc.title', 'ckBTC Faucet & Integration')}</h2>
      <p className="text-gray-600 mb-6 border-b pb-4">
        {t('ckbtc.subtitle', 'Native Bitcoin embedded directly via the Internet Computer. Generates a distinct 1:1 Bitcoin wallet mapped to your Principal.')}
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
          <strong>{t('common.error', 'Error')}:</strong> {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200">
          <strong>{t('ckbtc.notice', 'Notice')}:</strong> {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deposit Flow */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">{t('ckbtc.depositTitle', '1. Deposit BTC')}</h3>
          <p className="text-sm text-gray-500">
            {t('ckbtc.depositDesc', 'Generate your secure distinct address mapped to this smart contract. Send real BTC here.')}
          </p>

          {!address ? (
            <button
              onClick={getDepositAddress}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 disabled:opacity-50"
            >
              {t('ckbtc.generateBtn', 'Generate BTC Address')}
            </button>
          ) : (
            <div className="break-all bg-white p-3 border rounded text-xs font-mono text-gray-800">
              {address}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={checkDeposit}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {t('ckbtc.checkDepositBtn', 'Check for Deposits & Mint ckBTC')}
            </button>
            <p className="text-xs text-center mt-2 text-gray-500">{t('ckbtc.confirmationsNote', 'Run this after your Bitcoin transaction reaches enough confirmations.')}</p>
          </div>
        </div>

        {/* Withdrawal Flow */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{t('ckbtc.withdrawTitle', '2. Withdraw')}</h3>
            <span className="text-sm font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {t('ckbtc.balance', { balance }, `Balance: ${balance} satoshis`)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {t('ckbtc.withdrawDesc', 'Convert your ckBTC back out to the native Bitcoin L1 network. (Min 50,000 sats). 10 sat minter fee applied automatically.')}
          </p>

          <input
            type="text"
            placeholder={t('ckbtc.destAddressPlaceholder', 'Destination bc1q... wallet address')}
            className="w-full p-2 border rounded text-sm"
            value={withdrawAddr}
            onChange={(e) => setWithdrawAddr(e.target.value)}
          />
          <input
            type="number"
            placeholder={t('ckbtc.amountPlaceholder', 'Amount in satoshis (e.g. 100000)')}
            className="w-full p-2 border rounded text-sm"
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          
          <button
            onClick={handleWithdraw}
            disabled={loading || !withdrawAddr || !withdrawAmt}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-black disabled:opacity-50"
          >
            {t('ckbtc.withdrawBtn', 'Approve & Withdraw')}
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        {t('ckbtc.footerNote', 'Connected internally via standard `icrc2_approve` and distinct 32-byte Principal subaccount tracking to `mqygn-kiaaa-aaaar-qaadq-cai` (ic_ckbtc_minter).')}
      </div>

      <ShareBar title={t('share.ckbtcTitle', 'Civic OS ckBTC')} text={t('share.ckbtcText', 'Deposit, mint, and withdraw ckBTC on The Civic OS')} />
    </div>
  );
}
