// client/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useForm } from '../hooks/useForm';
import { validateForm } from '../utils/validators';

const RegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  
  const { values, errors, handleChange, handleSubmit, setErrors } = useForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const onSubmit = async () => {
    // Client-side validation
    const validationErrors = validateForm(values);
    
    // Check if passwords match
    if (values.password !== values.confirmPassword) {
      validationErrors.confirmPassword = 'パスワードが一致しません';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      await authService.register(values.username, values.email, values.password);
      navigate('/login', { state: { message: '登録が完了しました。ログインしてください。' } });
    } catch (err) {
      setServerError(err.response?.data?.message || '登録に失敗しました。後でもう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <h1>アカウント登録</h1>
        
        {serverError && <div className="error-message">{serverError}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={values.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="input-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="input-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="input-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録する'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>すでにアカウントをお持ちですか？ <Link to="/login">ログイン</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;