import { expect, test, type Page } from '@playwright/test';

/** hatch → feed → clean → sleep, driven through the real UI with the Dev Panel's clock. */

async function finishOnboarding(page: Page) {
  const onb = page.getByTestId('onboarding');
  await expect(onb).toBeVisible({ timeout: 15_000 });
  while (await onb.count()) {
    await page
      .getByTestId('onboarding-next')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function clearCinematics(page: Page) {
  for (let i = 0; i < 40; i++) {
    const cont = page.getByTestId('cinematic-continue');
    if (await cont.count()) await cont.click().catch(() => {});
    else if (!(await page.getByTestId('cinematic').count())) return;
    await page.waitForTimeout(400);
  }
}

test('hatch → feed → clean → sleep', async ({ page }) => {
  await page.goto('/?dev=1');
  // The Dev Panel covers part of a phone screen; hide it during the intro cards.
  await page.getByRole('button', { name: 'Close dev panel' }).click();
  await finishOnboarding(page);
  await page.keyboard.press('`');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-form', 'egg');
  await expect(page.getByTestId('pet-name')).toHaveText('Dewstone');

  // Hatch: run the egg's clock at 60× until it cracks open (5 minutes of sim time).
  await page.getByTestId('dev-scale-60').click();
  await expect(page.getByTestId('cinematic')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('dev-scale-1').click();
  await page.getByRole('button', { name: 'Close dev panel' }).click();
  await expect(page.getByTestId('name-input')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('name-input').fill('Pebble');
  await page.getByTestId('name-confirm').click();
  await expect(page.getByTestId('pet-name')).toHaveText('Pebble');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-form', 'dewdrop');

  // Feed a meal.
  await page.locator('[data-action=feed]').click();
  await page.getByTestId('food-mossbread').click();
  await expect(page.getByText(/ate every crumb/)).toBeVisible();

  // Clean: the bath follows if the pet itself is grubby; rinse it.
  await page.locator('[data-action=bathe]').click();
  const bath = page.getByTestId('bath');
  if (await bath.isVisible().catch(() => false)) await page.getByTestId('bath-rinse').click();
  await expect(page.getByText(/Squeaky clean|fresh as morning dew/)).toBeVisible();

  // Sleep: jump the clock to Sprig's bedtime and dim the lantern.
  await page.keyboard.press('`');
  await page.getByTestId('dev-next-stage').click();
  await page.keyboard.press('`');
  await clearCinematics(page);
  const notNow = page.getByRole('button', { name: 'Not now' });
  if (await notNow.isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await expect(page.getByTestId('pet')).toHaveAttribute('data-form', 'sprig');
  await expect(notNow)
    .toBeVisible({ timeout: 5000 })
    .catch(() => {});
  if (await notNow.isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await page.evaluate(() => {
    // Move the sim clock to 8:05 pm local time today.
    const d = new Date();
    d.setHours(20, 5, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    (window as unknown as { __mossling: { jumpTo(ms: number): void } }).__mossling.jumpTo(
      d.getTime(),
    );
  });
  await expect(page.getByTestId('pet')).toHaveAttribute('data-pose', 'sleep', { timeout: 15_000 });
  if (await notNow.isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await page.locator('[data-action=lights]').click();
  await expect(page.locator('[data-action=lights]')).toHaveAttribute(
    'aria-label',
    /Light the lantern/,
  );
});
