import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SignupHandler from '../../handlers/signup';
import styles from './Signup.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Signup = () => {

    const navigate = useNavigate();
    const dispatcher = useDispatch();

    const form = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is a required field"),
            email: Yup.string().email("Invalid email address").required("Email is a required field"),
            password: Yup.string().min(3, "Password must be atleast 3 characters").required("Password is a required field"),
            confirmPassword: Yup.string().oneOf([Yup.ref('password')], "Passwords must match").required("Confirm Password is a required field")
        }),
        onSubmit: (values) => SignupHandler(values, navigate, dispatcher)
    });

    return (
        <div className={`${styles.signupContainer}`}>
            <div className={`${styles.pretext}`}>
                <p className={`${styles.text}`}>try</p>
                <p className={`${styles.brace}`}>{'{'}</p>
            </div>
            <div className={`${styles.signupWindow}`}>
                <h1>Sign Up</h1>
                <form onSubmit={form.handleSubmit}>
                    <div>
                        <input type="text" name="name" id="name" value={form.values.name} onChange={form.handleChange} onBlur={form.handleBlur} autoComplete='off' placeholder='Name' />
                        {
                            form.touched.name && form.errors.name && (
                                <p style={{color: 'red'}}>{form.errors.name}</p>
                            )
                        }
                    </div>
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
                    <div>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={form.values.confirmPassword} onChange={form.handleChange} onBlur={form.handleBlur} autoComplete='off' placeholder='Confirm Password' />
                        {
                            form.touched.confirmPassword && form.errors.confirmPassword && (
                                <p style={{color: 'red'}}>{form.errors.confirmPassword}</p>
                            )
                        }
                    </div>
                    <input type="submit" value="Sign Up" />
                    <Link to='/login'>Already registered? Login</Link>
                </form>
            </div>
            <div className={`${styles.posttext}`}>
            <p className={`${styles.brace}`}>{'}'}</p>
            </div>
        </div>
    )
}

export default Signup;