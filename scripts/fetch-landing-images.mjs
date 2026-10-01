// Downloads the landing-page photos into src/assets/landing/ so the site
// stops requesting them from images.pexels.com. Commit the result.
import { mkdir, writeFile } from 'node:fs/promises';

const IMAGES = [
  [33909968, 1920], [9213281, 1920],
  [6392968, 600], [17582358, 600], [21812143, 600],
  [24449044, 800], [9875415, 800], [34674788, 800], [21822434, 800],
];

await mkdir('src/assets/landing', { recursive: true });
for (const [id, w] of IMAGES) {
  const res = await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  await writeFile(`src/assets/landing/pexels-${id}.jpg`, Buffer.from(await res.arrayBuffer()));
  console.log(`saved pexels-${id}.jpg`);
}
