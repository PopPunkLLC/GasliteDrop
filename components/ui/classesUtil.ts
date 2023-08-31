export default function cls(...params: (string | boolean)[]) {
  return params.filter(e => e).join(' ');
}
