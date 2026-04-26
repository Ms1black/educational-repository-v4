import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authClient } from '../../../shared/api/client';
import Button from '../../../shared/ui/Button';
import styles from './RegisterForm.module.css';

const schema = Yup.object({
  username: Yup.string().min(3, 'Min 3 characters').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Required'),
});

const RegisterForm = ({ onSwitch }) => {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}><i className="bi bi-check-circle" /></div>
          <h3 className={styles.successTitle}>Account created</h3>
          <p className={styles.successText}>You can now sign in to TIAR.</p>
          <Button onClick={onSwitch}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Register</h2>
      <p className={styles.subtitle}>
        <span className="ja">新しいアカウント</span>
      </p>

      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <Formik
        initialValues={{ username: '', password: '', confirm: '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError('');
          try {
            await authClient.post('/register', {
              username: values.username,
              password: values.password,
            });
            setSuccess(true);
          } catch (err) {
            setServerError(err.response?.data?.error ?? 'Registration failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-username">Username</label>
              <Field id="reg-username" name="username" className={styles.input} placeholder="choose_username" />
              <ErrorMessage name="username" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-password">Password</label>
              <Field id="reg-password" name="password" type="password" className={styles.input} placeholder="••••••••" />
              <ErrorMessage name="password" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-confirm">Confirm Password</label>
              <Field id="reg-confirm" name="confirm" type="password" className={styles.input} placeholder="repeat password" />
              <ErrorMessage name="confirm" component="p" className={styles.fieldError} />
            </div>

            <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </Form>
        )}
      </Formik>

      <p className={styles.footer}>
        Already have an account?
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Sign In</button>
      </p>
    </div>
  );
};

export default RegisterForm;
