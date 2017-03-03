/*
 *  Polyfill for navigator who don't support Object.observe (ES7)
 *
 *  @namespace  Hamsa.Polyfill
 *  @class      Polyfill
 *
 *  @author     Javier Jimenez Villar <javi.jimenez.villar@gmail.com> || @soyjavi
 */

Object.observe || ((O, A, root) => { // eslint-disable-line
  const DEFAULT_EVENTS = ['add', 'update', 'delete'];
  const observed = new Map();
  const handlers = new Map();
  const inArray = A.indexOf || ((array, pivot, start) => A.prototype.indexOf.call(array, pivot, start));

  const nextFrame = (root && (root.requestAnimationFrame || root.webkitRequestAnimationFrame)) || (() => {
    const initial = new Date();
    return func => (setTimeout(() => (func(new Date() - initial)), 17));
  })();

  const observe = (object, handler, events) => {
    let data = observed.get(object);

    if (data) {
      return setHandler(object, data, handler, events);
    }

    const properties = Object.getOwnPropertyNames(object);
    data = {
      handlers: new Map(),
      properties,
      values: Object.keys(object).filter(key => properties.includes(key)).map(key => object[key]),
    };

    observed.set(object, data);
    setHandler(object, data, handler, events);

    if (observed.size === 1) {
      return nextFrame(runGlobalLoop);
    }
  };

  const setHandler = (object, data, handler, events) => {
    const handlerData = handlers.get(handler) || { observed: new Map(), changeRecords: [] };
    handlers.set(handler, handlerData);
    handlerData.observed.set(object, { events, data });
    return data.handlers.set(handler, handlerData);
  };

  const performPropertyChecks = function(data, object, except) {
    if (!data.handlers.size) return;

    const values = data.values;
    const properties = data.properties.slice();
    let propertiesLength = properties.length;

    Object.keys(object).forEach((name) => {
      const index = inArray(properties, name);
      const value = object[name];

      if (index === -1) {
        addChangeRecord(object, data, { name, type: 'add', object }, except);
        data.properties.push(name);
        values.push(value);
      } else {
        const oldValue = values[index];
        properties[index] = null;
        propertiesLength -= 1;
        if ((oldValue === value ? oldValue === 0 && 1 / oldValue !== 1 / value : oldValue === oldValue || value === value)) { // eslint-disable-line
          addChangeRecord(object, data, { name, type: 'update', object, oldValue }, except);
          data.values[index] = value;
        }
      }
    });

    let i = properties.length;
    while (propertiesLength) {
      i -= 1;
      if (properties[i] !== null) {
        addChangeRecord(object, data, {
          name: properties[i],
          type: 'delete',
          object,
          oldValue: values[i],
        }, except);
        data.properties.splice(i, 1);
        data.values.splice(i, 1);
        propertiesLength -= 1;
      }
    }
  };

  const addChangeRecord = (object, data, changeRecord, except) => {
    data.handlers.forEach((handlerData) => {
      const events = handlerData.observed.get(object).events;
      if ((typeof except !== 'string' || inArray(events, except) === -1) && inArray(events, changeRecord.type) > -1) {
        handlerData.changeRecords.push(changeRecord);
      }
    });
  };

  const deliverHandlerRecords = (handlerData, handler) => {
    if (handlerData.changeRecords.length) {
      handler(handlerData.changeRecords);
      handlerData.changeRecords = [];
    }
  };

  const runGlobalLoop = () => {
    if (observed.size) {
      observed.forEach(performPropertyChecks);
      handlers.forEach(deliverHandlerRecords);
      nextFrame(runGlobalLoop);
    }
  };

  /*
  @function Object.observe
  @see http://arv.github.io/ecmascript-object-observe/#Object.observe
   */
  O.observe = (object, handler, events) => {
    if (events == null) {
      events = DEFAULT_EVENTS;
    }
    if (!object || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new TypeError('Object.observe cannot observe non-object');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('Object.observe cannot deliver to non-function');
    }
    if (O.isFrozen && O.isFrozen(handler)) {
      throw new TypeError('Object.observe cannot deliver to a frozen function object');
    }
    if (arguments.length > 2 && typeof events !== 'object') {
      throw new TypeError('Object.observe cannot use non-object accept list');
    }
    observe(object, handler, events);
    return object;
  };

  /*
  @function Object.unobserve
  @see http://arv.github.io/ecmascript-object-observe/#Object.unobserve
   */
  O.unobserve = (object, handler) => {
    if (object === null || (typeof object !== 'object' && typeof object !== 'function')) {
      throw new TypeError('Object.unobserve cannot unobserve non-object');
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Object.unobserve cannot deliver to non-function');
    }

    const handlerData = handlers.get(handler);
    const odata = handlerData.observed.get(object);

    if (handlerData && odata) {
      handlerData.observed.forEach((data, obj) => performPropertyChecks(data.data, obj));
      nextFrame(() => deliverHandlerRecords(handlerData, handler));

      if (handlerData.observed.size === 1 && handlerData.observed.has(object)) {
        handlers.delete(handler);
      } else {
        handlerData.observed.delete(object);
      }

      if (odata.data.handlers.size === 1) {
        observed.delete(object);
      } else {
        odata.data.handlers.delete(handler);
      }
    }
    return object;
  };
})(Object, Array, this);
