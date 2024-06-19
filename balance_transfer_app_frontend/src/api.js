import axios from 'axios';

const apiUrl = 'http://localhost:3001';

export const listAccounts = async (user) => {
    const response = await fetch(`${apiUrl}/list-accounts?user=${encodeURIComponent(user)}`);
    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
};

export const initAccount = async (id, balance, user) => {
    const response = await fetch(`${apiUrl}/init-account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, balance, user }),
    });
    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
};

export const transfer = async (idFrom, idTo, amount, user) => {
    const response = await fetch(`${apiUrl}/transfer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idFrom, idTo, amount, user }),
    });
    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
};

export const setBalance = async (id, newBalance, user) => {
    const response = await fetch(`${apiUrl}/set-balance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, newBalance, user }),
    });
    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
};

export const enrollUser = async (registrarLabel, identityLabel, enrollmentID, enrollmentSecret, enrollmentAttributes = []) => {
    try {
        const response = await axios.post(`${apiUrl}/enroll-user`, {
            registrarLabel,
            identityLabel,
            enrollmentID,
            enrollmentSecret,
            enrollmentAttributes
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to enroll user: ${error.message}`);
    }
};

// export const deleteUser = async (userId) => {
//     const response = await fetch(`/wallet-users/${userId}`, {
//         method: 'DELETE',
//     });
//     if (!response.ok) {
//         throw new Error('Failed to delete user');
//     }
//     return response.json();
// };