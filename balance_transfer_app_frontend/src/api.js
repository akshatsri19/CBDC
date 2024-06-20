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

export const freezeAccount = async (freezeAccountId, user) => {
    const response = await fetch(`${apiUrl}/freeze-account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ freezeAccountId, user }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
}

export const unfreezeAccount = async (unfreezeAccountId, user) => {
    const response = await fetch(`${apiUrl}/unfreeze-account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unfreezeAccountId, user }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
    }
    return response.json();
}