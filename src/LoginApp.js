import React, { useState, useEffect } from 'react';
import { LinkedInApi, NodeServer } from './config';
import axios from 'axios';

const LoginComponent = () => {
    const [user, setUser] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        if (window.opener && window.opener !== window) {
            const code = getCodeFromWindowURL(window.location.href);
            window.opener.postMessage({ 'type': 'code', 'code': code }, '*')
            window.close();
        }
        window.addEventListener('message', handlePostMessage);
    }, []);

    const handlePostMessage = event => {
        if (event.data.type === 'code') {
            const { code } = event.data;
            getUserCredentials(code);
        }
    }

    const getCodeFromWindowURL = url => {
        const popupWindowURL = new URL(url);
        console.log(popupWindowURL)
        return popupWindowURL.searchParams.get("code");
    }

    const showPopup = () => {
        const { clientId, redirectUrl, oauthUrl, scope, state } = LinkedInApi;
        const authUrl = `${oauthUrl}&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUrl}`;
        console.log(authUrl)
        const width = 450,
            height = 730,
            left = window.screen.width / 2 - width / 2,
            top = window.screen.height / 2 - height / 2;
        window.open(
            authUrl,
            'Linkedin',
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
            width +
            ', height=' +
            height +
            ', top=' +
            top +
            ', left=' +
            left
        );
    }

    const getUserCredentials = code => {
        axios
            .get(`${NodeServer.baseURL} + ${NodeServer.getUserCredentials}?code=${code}`)
            .then(res => {
                const user = res.data;
                setLoggedIn(true);
                setUser(user);
            });
    }

    return (
        <div>
            {loggedIn && user !== {} ? <div><img src={user.profileImageURL} alt="Profile image" />
                <h3>{`${user.firstName} ${user.lastName}`}</h3>
                <h3>{user.email}</h3></div> : <button value="Sign in with LinkedIn" alt="Sign in with LinkedIn" onClick={showPopup}>Login to Linkedin</button>}
        </div>
    )
}


export default LoginComponent;