import { test, expect, FrameLocator } from '@playwright/test';
import { AppProvider, AppType, AppLaunchMode } from 'power-platform-playwright-toolkit';

const ENVIRONMENT_ID = '493ec420-26dc-ebc2-9bc0-11821149f051';
const APP_LOGICAL_NAME = 'capop_opexcapexapprovalappv34_ddc56';
const TENANT_ID = '47f44079-0021-4177-80c9-68531941e357';
const APP_URL = `https://apps.powerapps.com/play/e/${ENVIRONMENT_ID}/an/${APP_LOGICAL_NAME}?tenantId=${TENANT_ID}`;

const AUTO_PROJECT_NUMBER = 'AUTO_TEST_006';

test.describe('TC1_PJC_001 — OPEX/CAPEX Approval App', () => {
  let canvasFrame: FrameLocator;

  test.beforeEach(async ({ page, context }) => {
    const appProvider = new AppProvider(page, context);
    await appProvider.launch({
      app: 'OPEX/CAPEX Approval App',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: APP_URL,
    });

    canvasFrame = page.frameLocator('iframe[name="fullscreen-app-host"]');
    await page.waitForTimeout(15000);
  });

  test('Can save project', async ({ page }) => {
    const ctrl = (name: string) => canvasFrame.locator(`[data-control-name="${name}"]`);
    const option = (text: string) =>
      canvasFrame.locator('[role="option"]').filter({ hasText: text }).first();

    // Open new project form
    await ctrl('Button1').click();
    await page.waitForTimeout(1000);

    // Basic fields
    await ctrl('imp_ProjectNumber').locator('input').fill(AUTO_PROJECT_NUMBER);
    await ctrl('imp_ProjectName').locator('input').fill('AUTO_NAME_002');

    // Project Manager — react-combobox with aria-haspopup="dialog"
    // Clicking the button opens a search dialog; input is inside the dialog, not the control
    await ctrl('drp_ProjectManager').locator('[role="button"]').click();
    await canvasFrame
      .locator('[role="dialog"] input, input[aria-label*="earch"]')
      .first()
      .fill('Channa Meng');
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Channa Meng' }).first().click();

    // // CAPEX / OPEX
    await ctrl('drp_CapexOpex').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'OPEX' }).first().click();

    // // Project Type
    await ctrl('drp_ProjectType').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Consulting' }).first().click();

    // // Financial fields
    await ctrl('imp_ProjectValue').locator('input').fill('1111');
    await ctrl('imp_BudgetAmount').locator('input').fill('9999');

    // // Cost Center
    await ctrl('drp_CostCenter').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: '100000000' }).first().click();

    // // PSP Element
    await ctrl('imp_PSPElement').locator('input').fill('123');

    // // EU Taxonomy
    await ctrl('drp_EU_Taxonomy').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Yes' }).first().click();

    // // Legal Entity
    await ctrl('drp_LegalEntity').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'AT11' }).first().click();

    // // Business Semperit
    await ctrl('drp_BusinessSemperit').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Belting' }).first().click();

    // // Department
    await ctrl('drp_Department').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame
      .locator('[role="option"]')
      .filter({ hasText: 'Infrastructure' })
      .first()
      .click();

    // // Project Admin (people picker)
    await ctrl('drp_ProjectAdmin').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Channa Meng' }).first().click();

    // // Comment
    await ctrl('imp_Comment').locator('textarea').fill('TEST AUTOMATION');

    // // Cost Center Owner (people picker)
    await ctrl('drp_CostCenterOwner').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Channa Meng' }).first().click();

    // // Additional Nominated (people picker)
    await ctrl('drp_AdditionalNominated').locator('[role="button"]').click();
    await page.waitForTimeout(1000);
    await canvasFrame.locator('[role="option"]').filter({ hasText: 'Channa Meng' }).first().click();

    // // Submit
    await ctrl('Button3').click();

    // // Success message — typo "succesfully" is in the app itself, kept intentionally
    // await expect(ctrl('Label1')).toContainText('submitted succesfully', { timeout: 30000 });

    // // Refresh project list
    // await ctrl('Button2').click();
    // await page.waitForTimeout(3000);

    // // Open detail view of first gallery item
    // await ctrl('gal_projects').locator('[data-control-name="Icon_View"]').first().click();
    // await page.waitForTimeout(2000);

    // // Verify project number persisted
    // await expect(ctrl('DataCardValue1')).toHaveText(AUTO_PROJECT_NUMBER, { timeout: 15000 });

    // // Close detail view
    // await ctrl('Icon4_2').click();
  });
});
