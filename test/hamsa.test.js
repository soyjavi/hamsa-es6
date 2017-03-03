import Hamsa from '../src/hamsa';

class User extends Hamsa {
  static fields = {
    name: { type: String },
    active: { type: Boolean, default: true },
  };
}

const createUsers = () => {
  new User({ name: 'test' }); // eslint-disable-line no-new
  new User({ name: 'test 2' }); // eslint-disable-line no-new
  new User({ name: 'test 3' }); // eslint-disable-line no-new
};

beforeEach(() => User.destroyAll());

test('default values', () => {
  const user = new User({ name: 'test' });
  expect(user.active).toBe(true);
});

describe('.all()', () => {
  it('returns an empty array if no instances', () => {
    expect(User.all()).toEqual([]);
  });

  it('returns all instances', () => {
    createUsers();
    expect(User.all().length).toBe(3);
  });
});

describe('.find()', () => {
  beforeEach(() => createUsers());

  it('returns an empty array if no matches', () => {
    expect(User.find({ query: { name: 'no user found' } })).toEqual([]);
  });

  it('returns an array of instances if there is a match', () => {
    expect(User.find({ query: { name: 'test' } }).length).toBe(1);
  });

  it('limit: limits the search', () => {
    expect(User.find({ limit: 1 }).length).toBe(1);
  });

  it('sort: sorts the array based on the given field', () => {
    expect(User.find({ sort: { name: -1 } })[0].name).toEqual('test');
    expect(User.find({ sort: { name: 1 } })[0].name).toEqual('test 3');
  });
});

describe('.findOne()', () => {
  beforeEach(() => createUsers());

  it('returns undefined if no matches', () => {
    expect(User.findOne({ name: 'no user found' })).toEqual(undefined);
  });

  it('returns the correct instances if there is a match', () => {
    const testUser = new User({ name: 'test user' });
    expect(User.findOne({ name: 'test user' })).toBe(testUser);
  });
});

describe('.destroyAll()', () => {
  beforeEach(() => createUsers());

  it('destroys all model instances', () => {
    User.destroyAll();
    expect(User.all().length).toBe(0);
  });
});


describe('.findAndModify()', () => {
  beforeEach(() => createUsers());

  it('returns undefined if no matches', () => {
    expect(User.findOne({ query: { name: 'no user found' } })).toEqual(undefined);
  });

  it('updates and returns the correct instance if there is a match', () => {
    const testUser = new User({ name: 'test user' });
    User.findAndModify({ query: { name: 'test user' }, update: { name: 'it works' } });
    expect(testUser.name).toBe('it works');
  });

  it('doesn\'t create a new instance without upsert', () => {
    User.findAndModify({ query: { name: 'testing' }, update: { name: 'it works' } });
    expect(User.all().length).toBe(3);
  });

  it('creates a new instance when using upsert', () => {
    User.findAndModify({ query: { name: 'testing' }, update: { name: 'it works' }, upsert: true });
    expect(User.all().length).toBe(4);
  });
});

describe('.destroy()', () => {
  beforeEach(() => createUsers());

  it('destroys an instance', () => {
    const testUser = new User({ name: 'test user' });
    expect(User.all().length).toBe(4);
    testUser.destroy();
    expect(User.all().length).toBe(3);
  });
});

describe('fields', () => {
  beforeEach(() => createUsers());

  it('returns the model fields', () => {
    expect(User.fields).toEqual({
      active: { default: true, type: Boolean },
      name: { type: String },
    });
  });
});

describe('.observe()', () => {
  it('calls the callback', (done) => {
    const callback = jest.fn((state) => {
      expect(state).not.toBe(undefined);
      done();
    });
    User.observe(callback);
    new User({ name: 'test user' }); // eslint-disable-line no-new
  });
});
