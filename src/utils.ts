
const circularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  const removeCircularity = (obj) => {
    return JSON.parse(JSON.stringify(obj, circularReplacer()))
  }

  module.exports = {
    removeCircularity
  }