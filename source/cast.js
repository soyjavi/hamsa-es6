
const cast = (value, attributes = {type: String}) => {
  if (attributes.type !== Date && attributes.type !== Array) {
    return attributes.type(value || attributes['default']);
  } else if (attributes.type === Array) {
    return value || attributes['default'];
  } else {
    return value || attributes.type(attributes['default']);
  }
};

export default cast;
