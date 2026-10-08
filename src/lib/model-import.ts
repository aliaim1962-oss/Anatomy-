import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';

/** Only self-contained user-owned assets are accepted; no external URL fetches. */
export async function readModelFile(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024 || file.size === 0) throw new Error('Invalid file size');
  const buffer = await file.arrayBuffer();
  let json: {
    asset?: { version?: string };
    buffers?: { uri?: string }[];
    images?: { uri?: string }[];
  };
  if (file.name.toLowerCase().endsWith('.glb')) {
    if (buffer.byteLength < 20) throw new Error('Invalid GLB');
    const view = new DataView(buffer);
    if (
      view.getUint32(0, true) !== 0x46546c67 ||
      view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) !== buffer.byteLength ||
      view.getUint32(16, true) !== 0x4e4f534a
    )
      throw new Error('Invalid GLB header');
    const size = view.getUint32(12, true);
    if (size > buffer.byteLength - 20) throw new Error('Invalid GLB JSON chunk');
    json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, size)));
  } else if (file.name.toLowerCase().endsWith('.gltf')) {
    json = JSON.parse(new TextDecoder().decode(buffer));
  } else throw new Error('Unsupported file type');
  if (json.asset?.version !== '2.0') throw new Error('glTF 2.0 required');
  for (const resource of [...(json.buffers ?? []), ...(json.images ?? [])]) {
    if (resource.uri && !resource.uri.startsWith('data:'))
      throw new Error('External resources are not accepted');
  }
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  let meshCount = 0;
  gltf.scene.traverse((object) => {
    if ('isMesh' in object && object.isMesh) {
      meshCount++;
      const mesh = object as import('three').Mesh;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => material.dispose());
    }
  });
  if (!meshCount || !Number.isFinite(size.length()) || size.length() === 0)
    throw new Error('No finite mesh geometry');
  return URL.createObjectURL(
    new Blob([buffer], {
      type: file.name.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
    }),
  );
}
