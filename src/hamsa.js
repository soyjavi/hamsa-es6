import './polyfill';
import utils from './utils';

const DEFAULT_EVENTS = ['add', 'update', 'delete'];

export default class Hamsa {

  static fields = {};
  static events = [];
  static observers = [];
  static records = {};

  /*
  Returns all instances of the Class
  @method all
  @return {array}     Array of all repository instances.
  */
  static all() {
    return this.find();
  }

  /*
  Destroy all instances of the Class
  @method destroyAll
  @return {array}     Empty array of all repository instances.
  */
  static destroyAll() {
    Object.keys(this.records).forEach((uid) => {
      if ({}.hasOwnProperty.call(this.records, uid)) {
        delete this.records[uid];
      }
    });
    return this.records;
  }

  /*
  Returns instances of the defined Hamsa Class
  @method find
  @param  {object}  [OPTIONAL] Specifies selection criteria using query operators.
  @return {array}   Array of Hamsa instances
  */
  static find(document = {}) {
    let result = [];
    Object.keys(this.records).forEach((uid) => {
      const record = this.records[uid];
      let exists = true;
      if (document.query) {
        Object.keys(document.query).forEach((field) => {
          const value = document.query[field];
          if (exists) {
            if (utils.cast(record[field], this.fields[field]) !== value) {
              exists = false;
            }
          }
        });
      }
      if (exists) {
        result.push(record);
      }
    });

    if (document.sort != null) {
      const field = Object.keys(document.sort)[0];
      result = utils.sort(result, field, document.sort[field], this.fields[field].type);
    }

    if (document.limit != null) {
      result = result.slice(0, document.limit);
    }

    return result;
  }

  /*
  Returns one instance that satisfies the specified query criteria
  @method findOne
  @param  {object}  [OPTIONAL] Specifies selection criteria using query operators.
  @return {object}  Hamsa instance.
  */
  static findOne(query) {
    return this.find({ query })[0];
  }

  /*
  Modifies and returns a single instance
  @method findAndModify
  @param  {object}  Document parameter with the embedded document fields.
  @return {object}  Hamsa instance.
  */
  static findAndModify(document = {}) {
    let record = this.findOne(document.query);
    if (record) {
      Object.keys(document.update).forEach(key => (record[key] = document.update[key]));
    } else if (document.upsert) {
      record = new this(document.update);
    }
    return record;
  }

  /*
  Observe changes in instance repository.
  @method observe
  @param  {function}  A function to execute each time the object is changed.
  @return {array}     Observers availables.
  */
  static observe(callback, events = DEFAULT_EVENTS) {
    this.events = events;
    Object.observe(this.records, (states) => {
      if (utils.existsObserver(this.observers, callback)) {
        states.forEach((state) => {
          let constructor;
          if (this.records[state.name]) constructor = this.records[state.name].constructor;
          if (!constructor && state.oldValue) constructor = state.oldValue.constructor;
          if (constructor === this) {
            const event = {
              type: state.type,
              name: state.name,
            };
            if (state.type === 'add' || state.type === 'updated') {
              event.object = this.records[state.name];
            } else {
              event.oldValue = state.oldValue;
            }
            callback(event);
          }
        });
      }
    }, this.events);
    this.observers.push(callback);
    return this.observers;
  }

  /*
  Unobserve changes in instance repository.
  @method unobserve
  @return {array}    Observers availables.
  */
  static unobserve(callback) {
    this.observers = utils.unobserve(this, callback);
  }

  // -- Instance
  /*
  Create a nre instance for a Hamsa Class.
  @method constructor
  @param  {object}    Fields for the instance.
  @param  {function}  A function to execute each time the fields change.
  @return {object}    Hamsa instance.
  */
  constructor(fields = {}, callback, events = DEFAULT_EVENTS) {
    this.className = this.constructor.name;
    const uid = utils.uid();
    this.uid = uid;
    this.constructor.records[uid] = this;

    const ref = this.constructor.fields;
    Object.keys(ref).forEach((field) => {
      const define = ref[field];
      if (fields[field] || (define.default != null)) {
        if (typeof this[field] === 'function') {
          this[field](fields[field] || define.default);
        } else {
          this[field] = utils.cast(fields[field], define);
        }
      }
    });

    this.observers = [];
    if (callback) {
      this.observe(callback, events);
      this.observers.push(callback);
    } else if (!callback && this.constructor.events.includes('update')) {
      Object.observe(this, changes => (
        changes.forEach((change) => {
          if (change.object.constructor === this.constructor) {
            const names = Object.keys(this.constructor.fields);
            if (names && names.includes(change.name)) {
              return utils.constructorUpdate(change, this.constructor);
            }
          }
          return undefined;
        })
      ), ['update']);
    }

    return this;
  }

  // -- Instance methods
  /*
    Observe changes in a determinate Hamsa instance.
    @method observe
    @param  {function}  A function to execute each time the fields change.
    @return {array}    Observers availables for the instance.
  */
  observe(callback, events = DEFAULT_EVENTS) {
    Object.observe(this, (states) => {
      if (utils.existsObserver(this.observers, callback)) {
        const fields = Object.keys(this.constructor.fields);

        states.forEach((state) => {
          if (fields.indexOf(state.name) >= 0) {
            delete state.object.observer;
            utils.constructorUpdate(state, this.constructor);
            callback(state);
          }
        });
      }
    }, events);
    this.observers.push(callback);
    return this.observers;
  }

  /*
    Unobserve changes in a determinate Hamsa instance.
    @method unobserve
    @return {array}    Observers availables for the instance.
  */
  unobserve(callback) {
    this.observers = utils.unobserve(this, callback);
  }

  /*
    Destroy current Hamsa instance
    @method destroy
    @return {object}    Current Hamsa instance
  */
  destroy(trigger = true) {
    if (trigger) {
      const callbacks = this.observers;
      callbacks.forEach(callback => callback({
        type: 'delete',
        name: this.uid,
        oldValue: this.fields,
      }));
    }
    return delete this.constructor.records[this.uid];
  }

  /*
  */
  get fields() {
    const fields = Object.keys(this.constructor.fields);
    return fields.reduce((sum, current) => Object.assign(sum, { current: this[current] }), {});
  }
}
