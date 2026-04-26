import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authClient } from '../../../shared/api/client';
import Button from '../../../shared/ui/Button';
import styles from './LoginForm.module.css';

const schema = Yup.object({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

const LoginForm = ({ onLogin, onSwitch }) => {
  const [serverError, setServerError] = useState('');

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Sign in</h2>
      <p className={styles.subtitle}>
        <span className="ja">東京先端ロボティクス研究所</span>
      </p>

      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError('');
          try {
            const res = await authClient.post('/login', values);
            onLogin(res.data.token, res.data.username);
          } catch (err) {
            setServerError(err.response?.data?.error ?? 'Login failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-username">Username</label>
              <Field id="login-username" name="username" className={styles.input} placeholder="your_username" />
              <ErrorMessage name="username" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">Password</label>
              <Field id="login-password" name="password" type="password" className={styles.input} placeholder="••••••••" />
              <ErrorMessage name="password" component="p" className={styles.fieldError} />
            </div>

            <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </Form>
        )}
      </Formik>

      <p className={styles.footer}>
        No account?
        <button type="button" className={styles.switchBtn} onClick={onSwitch}>Register</button>
      </p>
    </div>
  );
};

export default LoginForm;
