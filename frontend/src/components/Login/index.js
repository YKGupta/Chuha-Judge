import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoginHandler from '../../handlers/login';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

    const navigate = useNavigate();

    const form = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is a required field"),
            password: Yup.string().min(3, "Password must be atleast 3 characters").required("Password is a required field")
        }),
        onSubmit: (values) => LoginHandler(values, navigate)
    });

    return (
        <div className={`${styles.loginContainer}`}>
            <div className={`${styles.pretext}`}>
                <p className={`${styles.text}`}>try</p>
                <p className={`${styles.brace}`}>{'{'}</p>
            </div>
            <div className={`${styles.loginWindow}`}>
                <h1>Login</h1>
                <form onSubmit={form.handleSubmit}>
                    <div>
                        <input type="email" name="email" id="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} autoComplete='off' placeholder='Email' />
                        {
                            form.touched.email && form.errors.email && (
                                <p style={{color: 'red'}}>{form.errors.email}</p>
                            )
                        }
                    </div>
                    <div>
                        <input type="password" name="password" id="password" value={form.values.password} onChange={form.handleChange} onBlur={form.handleBlur} autoComplete='off' placeholder='Password' />
                        {
                            form.touched.password && form.errors.password && (
                                <p style={{color: 'red'}}>{form.errors.password}</p>
                            )
                        }
                    </div>
                    <input type="submit" value="Login" />
                    <Link to='/signup'>Don&apos;t have an account? Sign up</Link>
                </form>
            </div>
            <div className={`${styles.posttext}`}>
            <p className={`${styles.brace}`}>{'}'}</p>
            </div>
        </div>
    )
}

export default Login;