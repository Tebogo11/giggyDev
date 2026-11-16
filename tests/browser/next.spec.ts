import {test,expect} from '@playwright/test';

test('installed Next Webpack consumer captures errors and maps picked JSX to original source',async({page})=>{
  const hydrationErrors:string[]=[];
  page.on('console',message=>{if(/hydration|did not match/i.test(message.text()))hydrationErrors.push(message.text());});
  await page.goto('http://127.0.0.1:3197');
  await page.getByRole('button',{name:'Open giggyDev'}).waitFor();
  await page.getByRole('button',{name:'Trigger console error'}).click();
  await page.getByRole('button',{name:'Open giggyDev'}).click();
  await page.getByRole('button',{name:'Console',exact:true}).click();
  await expect(page.locator('.entry')).toContainText('Next fixture error');
  await page.getByRole('button',{name:/Find component/}).click();
  await page.locator('#next-card').click();
  await expect(page.getByRole('heading',{name:'Elements',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Sources',exact:true}).click();
  await expect(page.getByLabel('Source code')).toContainText('padding:4');
  expect(hydrationErrors).toEqual([]);
});

test('installed Next production consumer has no launcher, source tags or development endpoint',async({page,request})=>{
  const requests:string[]=[];page.on('request',value=>requests.push(value.url()));
  await page.goto('http://127.0.0.1:3198');
  await expect(page.getByRole('heading',{name:'Next.js consumer'})).toBeVisible();
  await expect(page.locator('#giggydev-host')).toHaveCount(0);
  await expect(page.locator('[data-giggy-source]')).toHaveCount(0);
  expect(requests.filter(url=>url.includes('/__giggydev/'))).toEqual([]);
  expect((await request.get('http://127.0.0.1:3198/__giggydev/client.js')).status()).toBe(404);
});
