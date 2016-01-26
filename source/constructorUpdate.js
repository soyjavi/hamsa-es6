
const constructorUpdate = (state, className) => {
  let observers = className.observers;
  for (let i = 0, len = observers.length; i < len; i++) {
    let type = state.type;
    if (state.type === 'update' && className.events.indexOf(type) >= 0) {
      delete state.object.observer;
      observers[i](state);
    }
  }
};

export default constructorUpdate;
