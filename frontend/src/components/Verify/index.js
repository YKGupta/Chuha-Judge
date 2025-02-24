import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './Verify.module.css';
import { useNavigate } from 'react-router-dom';

const Verify = () => {

    const { email } = useSelector((state) => state.signup);
    const navigate = useNavigate();

    useEffect(() => {
        if(!email)
            navigate('/login');
        // eslint-disable-next-line
    }, []);

    return (
        <div className={`${styles.verifyContainer}`}>
            <h1 className={`${styles.brace}`}>{'{'}</h1>
            <div className={`${styles.verifyWindow}`}>
                <h1>Please verify your email</h1>
                <p>We have sent an email to <strong>{email}</strong></p>
                <p>Just click on the link to complete verification. You may need to check the your <strong>spam</strong> folder.</p>
            </div>
            <h1 className={`${styles.brace}`}>{'}'}</h1>
        </div>
    )
}

export default Verify;