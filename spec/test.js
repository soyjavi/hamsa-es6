import Hamsa from '../source/hamsa';

class User extends Hamsa {

  static fields = {
    id: {type: Number, default: 0},
    username: {type: String},
    active: {type: Boolean, default: true}
  };

  // constructor(x, y, color) {
  //   super(x, y);
  //   this.color = color;
  // }

  // toString() {
  //   return super.toString() + ' in ' + this.color;
  // }
}

const obs_1 = (state) => {
  console.log('obs_1', state);
}

// let i, j;
// for (i = j = 0; j <= 10; i = ++j) {
//   console.log(i);
//   new User({
//     id: i,
//     username: `user_${i}`
//   });
// }


let u = new User({username: 'pyam'}, obs_1);
// u._age = 'i hack your variable :(';


User.findAndModify({
  query: {username: 'soyjavi'},
  update: {username: 'soyjavi', id: 1980},
  upsert: true
})

console.log('findOne', User.findOne());
console.log('findOne', User.findOne({username: 'soyjavi'}));
// console.log('find', User.find({query: {id: 4}}));

console.log('find', User.find());

console.log('fields', u.fields);


