const { test, describe, beforeEach, expect } = require('@playwright/test');
const { loginWith } = require('./helper');
const { createNote } = require('./helper');

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    });

    await page.goto('/');
  });

  test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText('Notes');
    await expect(locator).toBeVisible();
    await expect(
      page.getByText(
        'Note app, Department of Computer Science, University of Helsinki 2024'
      )
    ).toBeVisible();
  });

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'salainen');

    await expect(page.getByText('Matti Luukkainen logged-in')).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'wrong');

    await expect(page.getByText('wrong credentials')).toBeVisible();

    const errorDiv = await page.locator('.error');
    await expect(errorDiv).toContainText('Wrong credentials');
    await expect(errorDiv).toHaveCSS('border-style', 'solid');
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)');

    await expect(
      page.getByText('Matti Luukkainen logged in')
    ).not.toBeVisible();
  });

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');
    });

    test('a new note can be created', async ({ page }) => {
      createNote(page, 'a note created by playwright', true);
      await expect(
        page.getByText('a note created by playwright')
      ).toBeVisible();
    });

    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        createNote(page, 'another note by playwright', true);
      });

      test('importance can be changed', async ({ page }) => {
        await page.getByRole('button', { name: 'make not important' }).click();
        await expect(page.getByText('make important')).toBeVisible();
      });
    });
  });
});
