
const existsObserver = (observers, callback) => {
  let exists = false;

  for (let i = 0, len = observers.length; i < len; i++) {
    if (observers[i] === callback) {
      exists = true;
      break;
    }
  }

  return exists;
};

export default existsObserver;
