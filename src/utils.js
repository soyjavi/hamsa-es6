const utils = {

  cast: (value, attributes = { type: String }) => {
    if (attributes.type !== Date && attributes.type !== Array) {
      return attributes.type(value || attributes.default);
    } else if (attributes.type === Array) {
      return value || attributes.default;
    }
    return value || attributes.type(attributes.default);
  },

  constructorUpdate: (state, className) => {
    const observers = className.observers;
    for (let i = 0, len = observers.length; i < len; i += 1) {
      const type = state.type;
      if (state.type === 'update' && className.events.indexOf(type) >= 0) {
        delete state.object.observer;
        observers[i](state);
      }
    }
  },

  existsObserver: (observers, callback) => {
    let exists = false;

    for (let i = 0, len = observers.length; i < len; i += 1) {
      if (observers[i] === callback) {
        exists = true;
        break;
      }
    }

    return exists;
  },

  sort: (items, field, direction, type = String) => (
    items.sort((a, b) => {
      if (type === Number) {
        return (b[field] - a[field]) * direction;
      } else if (a[field] > b[field]) {
        return -1 * direction;
      } else if (a[field] < b[field]) {
        return +1 * direction;
      }
      return 0;
    })
  ),

  uid: () => (
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const r = Math.random() * 16 | 0;
      const v = char === 'x' ? r : (r & 3) | 8;
      return v.toString(16);
    }).toUpperCase()
  ),

  unobserve: (instance, callback) => {
    const observers = instance.observers;

    for (let i = 0, len = observers.length; i < len; i += 1) {
      const observe = observers[i];
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
  },
};

export default utils;
