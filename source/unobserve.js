
const unobserve = (instance, callback) => {
  const observers = instance.observers;
  for (let i = 0, len = observers.length; i < len; i++) {
    let observe = observers[i];
    if (callback) {
      if (observe === callback) {
        Object.unobserve(instance, observe);
        instance.observers.splice(i, 1);
        break;
      }
    } else {
      Object.unobserve(instance, observe);
    }
  }
  if (!callback) {
    instance.observers = [];
  }
  return instance.observers;
};

export default unobserve;

