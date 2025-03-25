// client/src/utils/validators.js
export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  export const validatePassword = (password) => {
    // At least 8 characters, with at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
  };
  
  export const validateForm = (values) => {
    const errors = {};
    
    if (!values.username) {
      errors.username = 'ユーザー名は必須です';
    }
    
    if (!values.email) {
      errors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(values.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!values.password) {
      errors.password = 'パスワードは必須です';
    } else if (!validatePassword(values.password)) {
      errors.password = 'パスワードは少なくとも8文字で、1文字以上の英字と数字を含む必要があります';
    }
    
    return errors;
  };
  