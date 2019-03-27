export default function (condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion error')
}
