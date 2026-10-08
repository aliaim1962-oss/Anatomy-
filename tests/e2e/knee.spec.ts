import { test, expect } from '@playwright/test';

test('renders real WebGL geometry and changes it with the angle control', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The knee, in motion' })).toBeVisible();
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  // Verify a renderer context is present and the canvas has actual rendered pixels.
  const rendered = await canvas.evaluate((element: HTMLCanvasElement) => {
    const gl = element.getContext('webgl2');
    return !!gl && gl.drawingBufferWidth > 0 && !gl.isContextLost();
  });
  expect(rendered).toBe(true);
  const before = await canvas.screenshot();
  await page.getByRole('spinbutton', { name: 'Angle in degrees' }).fill('110');
  await expect(page.getByRole('slider', { name: 'Requested flexion angle' })).toHaveValue('110');
  const after = await canvas.screenshot();
  expect(before.equals(after)).toBe(false);
  await page.getByRole('button', { name: 'Play movement', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause movement', exact: true })).toBeVisible();
  await expect
    .poll(async () =>
      Number(await page.getByRole('spinbutton', { name: 'Angle in degrees' }).inputValue()),
    )
    .not.toBe(110);
  await page.getByRole('button', { name: 'Pause movement', exact: true }).click();
  await page.getByRole('combobox', { name: 'Playback speed' }).selectOption('2');
  await expect(page.getByRole('combobox', { name: 'Playback speed' })).toHaveValue('2');
  await page.getByRole('button', { name: 'Reset movement', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Angle in degrees' })).toHaveValue('0');
  expect(errors).toEqual([]);
});

test('compares restriction and a persistent flexion contracture at synchronized input', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(2);
  await page.getByRole('spinbutton', { name: 'Angle in degrees' }).fill('120');
  await expect(page.getByTestId('angle-reference')).toHaveText('120.0°');
  await expect(page.getByTestId('angle-pathology')).toHaveText('90.0°');
  await expect(page.getByTestId('limit-reached')).toBeVisible();
  await page.getByRole('slider', { name: 'Illustrative flexion ceiling' }).fill('70');
  await expect(page.getByTestId('angle-pathology')).toHaveText('70.0°');
  await page.getByRole('button', { name: 'Flexion contracture', exact: true }).click();
  await page.getByRole('button', { name: 'Reset movement', exact: true }).click();
  await expect(page.getByTestId('angle-reference')).toHaveText('0.0°');
  await expect(page.getByTestId('angle-pathology')).toHaveText('25.0°');
  await page.getByRole('slider', { name: 'Illustrative extension deficit' }).fill('40');
  await expect(page.getByTestId('angle-pathology')).toHaveText('40.0°');
  // Orbiting one view must change both rendered cameras, not just the angle labels.
  await page.getByRole('spinbutton', { name: 'Angle in degrees' }).fill('60');
  const canvases = page.locator('canvas');
  const firstBefore = await canvases.nth(0).screenshot();
  const secondBefore = await canvases.nth(1).screenshot();
  const bounds = (await canvases.nth(0).boundingBox())!;
  await page.mouse.move(bounds.x + 40, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 130, bounds.y + bounds.height / 2 + 20, { steps: 8 });
  await page.mouse.up();
  expect(firstBefore.equals(await canvases.nth(0).screenshot())).toBe(false);
  expect(secondBefore.equals(await canvases.nth(1).screenshot())).toBe(false);
});

test('selects anatomy, toggles layers, changes camera, and exposes source status', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Find a structure…' }).fill('patella');
  await page.getByRole('button', { name: 'Patella', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Patella', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Anterior', exact: true }).click();
  const modelBounds = (await page.locator('canvas').boundingBox())!;
  await page
    .locator('canvas')
    .click({ position: { x: modelBounds.width / 2, y: modelBounds.height / 4 } });
  await expect(page.getByRole('heading', { name: 'Femur', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Find a structure…' }).fill('');
  await page.getByRole('switch', { name: 'Muscles', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Muscles', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByRole('switch', { name: 'Labels', exact: true }).click();
  await expect(page.locator('.model-label').filter({ hasText: 'Patella' })).toBeVisible();
  await page.getByRole('switch', { name: 'Rotation axis', exact: true }).click();
  const canvas = page.locator('canvas');
  const before = await canvas.screenshot();
  await page.getByRole('button', { name: 'Lateral', exact: true }).click();
  const after = await canvas.screenshot();
  expect(before.equals(after)).toBe(false);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await page.getByRole('button', { name: 'Reset camera', exact: true }).click();
  await page.getByRole('tab', { name: 'Sources', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Source transparency' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toContainText('No chapter, page, quotation');
});

test('provides rehabilitation education and a complete Russian interface', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rehabilitation', exact: true }).click();
  await page.getByRole('button', { name: /Mobility & control/ }).click();
  await expect(page.getByRole('heading', { name: 'Mobility & control' })).toBeVisible();
  await page.getByRole('button', { name: 'Observe flexion & extension', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Pause demonstration', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pause demonstration', exact: true }).click();
  await page.getByRole('button', { name: 'RU', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('heading', { name: 'От движения к восстановлению' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Подвижность и контроль' })).toBeVisible();
  await page.getByRole('button', { name: 'Изучение', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Колено в движении' })).toBeVisible();
  await page.getByRole('button', { name: 'Управление просмотром', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('handles invalid assets without breaking the workspace and has no mobile overflow', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Import model', { exact: true }).setInputFiles({
    name: 'broken.glb',
    mimeType: 'model/gltf-binary',
    buffer: Buffer.from('invalid'),
  });
  await expect(
    page.getByRole('alert').filter({ hasText: 'Model could not be loaded' }),
  ).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/kine3d-mobile.png', fullPage: true });
});

test('imports self-contained glTF and GLB as static reference models', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const kneeBefore = await canvas.screenshot();
  // Original fixture: one triangle with embedded positions, not a third-party asset.
  const vertices = Buffer.alloc(36);
  [-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0].forEach((n, i) => vertices.writeFloatLE(n, i * 4));
  const document = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    materials: [
      { doubleSided: true, pbrMetallicRoughness: { baseColorFactor: [0.3, 0.8, 0.7, 1] } },
    ],
    buffers: [
      {
        byteLength: 36,
        uri: `data:application/octet-stream;base64,${vertices.toString('base64')}`,
      },
    ],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: 'VEC3',
        min: [-0.5, 0, 0],
        max: [0.5, 1, 0],
      },
    ],
  };
  await page.getByLabel('Import model', { exact: true }).setInputFiles({
    name: 'original-triangle.gltf',
    mimeType: 'model/gltf+json',
    buffer: Buffer.from(JSON.stringify(document)),
  });
  await expect(page.getByText('Imported static reference', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play movement', exact: true })).toBeDisabled();
  await expect(page.locator('canvas')).toBeVisible();
  expect(kneeBefore.equals(await canvas.screenshot())).toBe(false);
  await page.getByRole('button', { name: 'Return to knee model', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play movement', exact: true })).toBeEnabled();
  const json = JSON.stringify({ ...document, buffers: [{ byteLength: 36 }] });
  const jsonSize = Math.ceil(Buffer.byteLength(json) / 4) * 4;
  const glb = Buffer.alloc(12 + 8 + jsonSize + 8 + 36);
  glb.writeUInt32LE(0x46546c67, 0);
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(glb.length, 8);
  glb.writeUInt32LE(jsonSize, 12);
  glb.writeUInt32LE(0x4e4f534a, 16);
  glb.fill(0x20, 20, 20 + jsonSize);
  glb.write(json, 20);
  glb.writeUInt32LE(36, 20 + jsonSize);
  glb.writeUInt32LE(0x004e4942, 24 + jsonSize);
  vertices.copy(glb, 28 + jsonSize);
  await page
    .getByLabel('Import model', { exact: true })
    .setInputFiles({ name: 'original-triangle.glb', mimeType: 'model/gltf-binary', buffer: glb });
  await expect(page.getByText('Imported static reference', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return to knee model', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play movement', exact: true })).toBeEnabled();
  expect(errors).toEqual([]);
});
