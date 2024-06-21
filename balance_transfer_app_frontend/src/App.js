import React, { useState, useEffect } from 'react';
import { listAccounts, initAccount, transfer, setBalance, enrollUser, freezeAccount, unfreezeAccount } from './api'; // Correct import
import './App.css';
import axios from 'axios';
import canadaCBDCImage from './assets/canada-cbdc.png';

const App = () => {
    const [accounts, setAccounts] = useState([]);
    const [newAccountId, setNewAccountId] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [transferFrom, setTransferFrom] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [setBalanceId, setSetBalanceId] = useState('');
    const [setBalanceValue, setSetBalanceValue] = useState('');
    const [user, setUser] = useState('');
    const [walletAccounts, setWalletAccounts] = useState([]);
    const [error, setError] = useState('');

    // State variables for enrolling a user
    const [enrollMessage, setEnrollMessage] = useState('')
    const [registrarLabel, setRegistrarLabel] = useState('');
    const [identityLabel, setIdentityLabel] = useState('');
    const [enrollmentID, setEnrollmentID] = useState('');
    const [enrollmentSecret, setEnrollmentSecret] = useState('');
    const [enrollmentAttributes, setEnrollmentAttributes] = useState('');

    // State variables for freezing/ unfreezing an account
    const [freezeAccountId, setFreezeAccountId] = useState('');
    const [unfreezeAccountId, setUnfreezeAccountId] = useState('');

    const fetchAccounts = async () => {
        if (user) {
            try {
                const data = await listAccounts(user);
                setAccounts(data);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user]);

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
        setError('');
        setEnrollMessage('');
    };

    const extractErrorMessage = (error) => {
        const errorMatch = error.match(/message=([^,]*)/);
        return errorMatch ? errorMatch[1].split('\n')[0] : error;
    };

    const handleInitAccount = async () => {
        if (newAccountId && newAccountBalance && user) {
            try {
                await initAccount(newAccountId, parseFloat(newAccountBalance), user);
                fetchAccounts();
                setNewAccountId('');
                setNewAccountBalance('');
                setError(''); // Clear error on success
            } catch (err) {
                setError(extractErrorMessage(err.message));
            }
        } else {
            setError('Please provide valid input and select a user.');
        }
    };

    const handleTransfer = async () => {
        if (transferFrom && transferTo && transferAmount && user) {
            try {
                await transfer(transferFrom, transferTo, parseFloat(transferAmount), user);
                fetchAccounts();
                setRegistrarLabel('');
                setTransferFrom('');
                setTransferTo('');
                setTransferAmount('');
                setError(''); // Clear error on success
            } catch (err) {
                setError(extractErrorMessage(err.message));
            }
        } else {
            setError('Please provide valid input and select a user.');
        }
    };

    const handleSetBalance = async () => {
        if (setBalanceId && setBalanceValue && user) {
            try {
                await setBalance(setBalanceId, parseFloat(setBalanceValue), user);
                fetchAccounts();
                setSetBalanceId('');
                setSetBalanceValue('');
                setError(''); // Clear error on success
            } catch (err) {
                setError(extractErrorMessage(err.message));
            }
        } else {
            setError('Please provide valid input and select a user.');
        }
    };

    const handleEnrollUser = async () => {
        try {
            const attributes = enrollmentAttributes ? JSON.parse(enrollmentAttributes) : [];
            const response = await enrollUser(registrarLabel, identityLabel, enrollmentID, enrollmentSecret, attributes);
            setEnrollMessage(response.message);
            setIdentityLabel('');
            setEnrollmentID('');
            setEnrollmentSecret('');
            setError('');
            fetchWalletUsers();
            console.log('User enrolled successfully:', response);
        } catch (error) {
            console.error('Error enrolling user:', error.message);
        }
    };

    const fetchWalletUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/wallet-users`);
            setWalletAccounts(response.data);
        } catch (error) {
            console.error('Error fetching wallet users:', error.message);
        }
    };

    const handleFreezeAccount = async () => {
        if (freezeAccountId && user) {
            try {
                await freezeAccount(freezeAccountId, user);
                setFreezeAccountId('');
                setError(''); // Clear error on success
            } catch (err) {
                setError(extractErrorMessage(err.message));
            }
        } else {
            setError('Please provide valid input and select Admin to freeze account.');
        }
    };

    const handleUnfreezeAccount = async () => {
        if (unfreezeAccountId && user) {
            try {
                await unfreezeAccount(unfreezeAccountId, user);
                setUnfreezeAccountId('');
                setError(''); // Clear error on success
            } catch (err) {
                setError(extractErrorMessage(err.message));
            }
        } else {
            setError('Please provide valid input and select Admin to unfreeze account.');
        }
    };

    useEffect(() => {
        fetchWalletUsers();
    }, []);

    return (
        <div className="App">
            <div className="header">
                <img src={canadaCBDCImage} alt="Canadian CBDC Image" style={{ height: 150, width: 300 }} />
                <h1 style={{marginTop:-10}}>Canadian CBDC</h1>
            </div>

            <div className="section">
                {error && <div className="error">{error}</div>}
                {enrollMessage && <div className="message">{enrollMessage}</div>}

                <label>
                    Select Wallet Account:
                    <select value={user} onChange={handleInputChange(setUser)}>
                        <option value="" disabled>Select user</option>
                        {walletAccounts.map((account) => (
                            <option key={account} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>
                </label>

                <h2>Accounts</h2>
                <ul>
                    {accounts.map(account => (
                        <li key={account.id}>
                            {account.id}: {account.balance}
                        </li>
                    ))}
                </ul>


                <h2>Initialize Account</h2>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
                    <input
                        type="text"
                        placeholder="Account ID"
                        value={newAccountId}
                        onChange={handleInputChange(setNewAccountId)}
                    />
                    <input
                        type="number"
                        placeholder="Balance"
                        value={newAccountBalance}
                        onChange={handleInputChange(setNewAccountBalance)}
                    />
                </div>
                <button onClick={handleInitAccount}>Init Account</button>

                <h2>Transfer</h2>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
                    <input
                        type="text"
                        placeholder="From Account ID"
                        value={transferFrom}
                        onChange={handleInputChange(setTransferFrom)}
                    />
                    <input
                        type="text"
                        placeholder="To Account ID"
                        value={transferTo}
                        onChange={handleInputChange(setTransferTo)}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={transferAmount}
                        onChange={handleInputChange(setTransferAmount)}
                    />
                </div>
                <button onClick={handleTransfer}>Transfer</button>
            </div>

            <div className="section">
                <h2>Update Balance</h2>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
                    <input
                        type="text"
                        placeholder="Account ID"
                        value={setBalanceId}
                        onChange={handleInputChange(setSetBalanceId)}
                    />
                    <input
                        type="number"
                        placeholder="New Balance"
                        value={setBalanceValue}
                        onChange={handleInputChange(setSetBalanceValue)}
                    />
                </div>
                <button onClick={handleSetBalance}>Set Balance</button>

                <h2>Enroll User</h2>
                <div>
                    <input
                        type="text"
                        placeholder="Registrar Label"
                        value={registrarLabel}
                        onChange={handleInputChange(setRegistrarLabel)}
                    />
                    <input
                        type="text"
                        placeholder="Identity Label"
                        value={identityLabel}
                        onChange={handleInputChange(setIdentityLabel)}
                    />
                    <input
                        type="text"
                        placeholder="Enrollment ID"
                        value={enrollmentID}
                        onChange={handleInputChange(setEnrollmentID)}
                    />
                    <input
                        type="password"
                        placeholder="Enrollment Secret"
                        value={enrollmentSecret}
                        onChange={handleInputChange(setEnrollmentSecret)}
                    />
                    <button onClick={handleEnrollUser}>Enroll User</button>
                </div>
            </div>

            <div className="section">
                <h2>Freeze Account</h2>
                <div>
                    <input
                        type="text"
                        placeholder="Account ID"
                        value={freezeAccountId}
                        onChange={handleInputChange(setFreezeAccountId)}
                    />
                    <button onClick={handleFreezeAccount}>Freeze</button>
                </div>

                <h2>Unfreeze Account</h2>
                <div>
                    <input
                        type="text"
                        placeholder="Account ID"
                        value={unfreezeAccountId}
                        onChange={handleInputChange(setUnfreezeAccountId)}
                    />
                    <button onClick={handleUnfreezeAccount}>Unfreeze</button>
                </div>
            </div>
        </div>
    );
};

export default App;
