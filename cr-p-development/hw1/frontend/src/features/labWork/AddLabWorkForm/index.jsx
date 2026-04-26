import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { dataClient } from '../../../shared/api/client';
import { CATEGORIES, STATUSES } from '../../../entities/labWork/constants';
import Button from '../../../shared/ui/Button';
import styles from './AddLabWorkForm.module.css';

const schema = Yup.object({
  title:       Yup.string().required('Required'),
  description: Yup.string().min(10, 'At least 10 characters').required('Required'),
  category:    Yup.string().required('Required'),
  status:      Yup.string().required('Required'),
  due_date:    Yup.string(),
});

const AddLabWorkForm = ({ onSuccess, onCancel }) => {
  const [serverError, setServerError] = useState('');

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>New Lab Work</h3>

      <Formik
        initialValues={{
          title: '',
          description: '',
          category: CATEGORIES[0],
          status: 'Not Started',
          due_date: '',
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setServerError('');
          try {
            const res = await dataClient.post('/lab-works/', values);
            onSuccess(res.data);
            resetForm();
          } catch (err) {
            setServerError(err.response?.data?.error ?? 'Failed to add lab work');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            {serverError && <div className={styles.serverError}>{serverError}</div>}

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="lw-title">Title</label>
              <Field id="lw-title" name="title" className={styles.input}
                placeholder="e.g. Haptic Feedback Calibration System" />
              <ErrorMessage name="title" component="p" className={styles.fieldError} />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="lw-description">Description</label>
              <Field id="lw-description" name="description" as="textarea"
                className={styles.textarea}
                placeholder="Describe the objectives, methods and expected results of this lab work…" />
              <ErrorMessage name="description" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lw-category">Category</label>
              <Field id="lw-category" name="category" as="select" className={styles.select}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Field>
              <ErrorMessage name="category" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lw-status">Status</label>
              <Field id="lw-status" name="status" as="select" className={styles.select}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Field>
              <ErrorMessage name="status" component="p" className={styles.fieldError} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lw-due">Due Date (optional)</label>
              <Field id="lw-due" name="due_date" type="date" className={styles.input} />
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding…' : 'Add Lab Work'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddLabWorkForm;
