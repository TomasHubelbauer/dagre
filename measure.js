export default function measure(/** @type {HTMLElement} */ label) {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';

  div.append(label);
  document.body.append(div);

  const { width, height } = div.getBoundingClientRect();

  div.remove();

  return { label, width: ~~width, height: ~~height };
}
