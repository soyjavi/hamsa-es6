import createUID from './uid.js'
import cast from './cast.js'
import sort from './sort.js'

const DEFAULT_EVENTS = ['add', 'update', 'delete']

class Hamsa {

  static fields = {};
  static events = [];
  static observers = [];
  static records = {};

  // -- Static
  static all() {
    return this.find();
  };

  static destroyAll() {
    for (let uid in this.records) {
      delete this.records[uid];
    }
    return this.records;
  };

  static find(document = {}) {
    let result = [];

    for (let uid in this.records) {
      let record = this.records[uid];
      let exists = true;
      for (let field in document.query) {
        let value = document.query[field];
        if (exists) {
          if (cast(record[field], this.fields[field]) !== value) {
            exists = false;
          }
        }
      }
      if (exists) {
        result.push(record);
      }
    }

    if (document.sort != null) {
      let field = Object.keys(document.sort)[0];
      result = sort(result, field, document.sort[field], this.fields[field].type);
    }
    if (document.limit != null) {
      result = result.slice(0, document.limit);
    }

    return result;
  };

  static findOne(query) {
    return this.find({query: query})[0]
  };

  static findAndModify(document = {}) {
    let record = this.findOne(document.query);
    if (record) {
      for (key in document.update) {
        record[key] = document.update[key];
      }
    }
    return (record || new this(document.update));
  };

  static observe(callback, events = DEFAULT_EVENTS) {
    this.events = events;
    // @TODO
  }

  static unobserve(callback) {
    // @TODO
  };

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
    const uid = createUID();
    this.uid = uid;
    this.constructor.records[uid] = this;

    const ref = this.constructor.fields;
    for (let field in ref) {
      let define = ref[field];
      if (fields[field] || (define['default'] != null)) {
        if (typeof this[field] === 'function') {
          this[field](fields[field] || define['default']);
        } else {
          this[field] = cast(fields[field], define);
        }
      }
    }

    this.observers = []

    if (callback) {
      this.observe(callback, events);
      this.observers.push(callback);
    } else if (!callback && this.constructor.events.indexOf('update') >= 0) {
      Object.observe(this, (function(_this) {
        return function(states) {
          let i, len, ref, results, state;
          results = [];
          for (i = 0, len = states.length; i < len; i++) {
            state = states[i];
            if (state.object.constructor === _this.constructor) {
              if (ref = state.name, indexOf.call(_this.constructor.names, ref) >= 0) {
                results.push(_constructorUpdate(state, _this.constructor));
              } else {
                results.push(void 0);
              }
            }
          }
          return results;
        };
      })(this), ['update']);
    }

    return this;
  }

  // -- Instance methods
  observe(callback, events = DEFAULT_EVENTS) {
    // @TODO
  }

  unobserve(callback) {
    // @TODO
  }

  destroy(trigger = true) {
    if (trigger) {
      let callbacks = this.observers;
      for (let i = 0, len = callbacks.length; i < len; i++) {
        callbacks[i]({
          type: 'destroy',
          name: this.uid,
          oldValue: this.fields
        });
      }
    }
    return delete this.constructor.records[this.uid];
  }

  get fields() {
    const result = {};
    let fields = Object.keys(this.constructor.fields);
    for (let i = 0, len = fields.length; i < len; i++) {
      let field = fields[i];
      result[field] = this[field];
    }
    return result;
  }
};

export default Hamsa;
