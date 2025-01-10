const tap = fn => args => {
  fn(args)
  return args
}

const pipe = (...fns) => (seed) => fns.reduce((acc, fn) => fn(acc), seed)

module.exports = {
  tap,
  pipe
}
