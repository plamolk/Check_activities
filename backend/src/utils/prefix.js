exports.splitPrefix = (fullName) => {
  const prefixes = ['นาย', 'นางสาว', 'นาง'];

  for (let p of prefixes) {
    if (fullName.startsWith(p)) {
      return {
        prefix: p,
        first_name: fullName.replace(p, '').trim()
      };
    }
  }

  return {
    prefix: null,
    first_name: fullName
  };
};