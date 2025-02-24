import React from 'react';
import { Link, Outlet, useLoaderData, useNavigate } from 'react-router-dom';
import LogoutHandler from '../../handlers/logout';
import styles from './Problems.module.css';

const Problems = () => {

    const user = useLoaderData().user;
    const navigate = useNavigate();

    return (
        <div className={`${styles.problemsContainer}`}>
            <header className={`${styles.header}`}>
                <div className={`${styles.logo}`}>
                    <Link to='/'>{'{'} Chuha Judge {'}'}</Link>
                </div>
                <div className={`${styles.links}`}>
                    {
                        user ? 
                        <>
                            <p>{user.name}</p>
                            <button onClick={() => LogoutHandler(navigate)}>Logout</button>
                        </>
                        :
                        <>
                            <Link to='/login'>Login</Link>
                            <Link to='/signup'>Signup</Link>
                        </>
                    }
                </div>
            </header>
            <main className={`${styles.main}`}>
                <Outlet />
            </main>
            <footer className={`${styles.footer}`}>
                <small>&copy; Yash Kumar Gupta</small>
            </footer>
        </div>
    )
}

export default Problems;