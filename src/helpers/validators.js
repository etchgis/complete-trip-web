export const validators = {
  /**
   * Validates emails in the form of user@domain.com.
   * Will allow for '+' character such as user+1@domain.com
   * @param email
   */
  isEmail: email => {
    const pattern =
      /^(("[\w-\s]+")|([+\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;
    return pattern.test(email);
  },

  hasLengthEqualTo: (text, length) => {
    return text.length === length;
  },

  hasLengthGreaterThan: (text, length) => {
    return text.length > length;
  },

  hasLowerCase: text => {
    const lowerCasePattern = /[a-z]/;
    return lowerCasePattern.test(text);
  },

  hasUpperCase: text => {
    const upperCasePattern = /[A-Z]/;
    return upperCasePattern.test(text);
  },

  hasNumber: text => {
    const numberPattern = /\d/;
    return numberPattern.test(text);
  },
};
