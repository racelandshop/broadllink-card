"""Main test class for broadlink remote car"""

import asyncio

from playwright.async_api import Playwright, async_playwright, expect

from .helpers import (async_goto_test_dashboard,
                      async_create_broadlink_card,
                      async_login_homeland,
                      async_clean_dashboard,
                      async_enter_card_dialog,
                      async_create_preset)

async def run(playwright: Playwright) -> None:
    browser = await playwright.webkit.launch(headless=False, slow_mo=500)
    context = await browser.new_context(viewport={"width":1900,"height":1200})
    page = await context.new_page()

    #Goto homeland landing page. We assume here that when loging in the test page will be in edit mode
    await async_goto_test_dashboard(page, edit = True)
    await async_login_homeland(page) #Since its we are trying to get into Homeland without cache we need to login first
    await async_create_broadlink_card(page)

    #Recorded test (mostly visuals) 

    ## Test the refresh button (dependent on the number of broadlinks in the network)
    await page.locator("#columns #button").click()
    await page.locator("mwc-button").filter(has_text="Refresh broadlinks").locator("#button").click()
    await asyncio.sleep(11) #This ensures the refreshing process is completed
    await page.get_by_role("combobox", name="Remote (MAC)").click() 

    ## Test adding remotes
    tv_remote_card_name = "TV remote"
    ac_remote_card_name = "AC remote"

    await page.locator("#buttons #button").click()
    await page.get_by_role("combobox", name="Remote").filter(has_text="Remote TV").click()
    await page.get_by_role("option", name="TV").click()
    await page.locator("add-remote-dialog #button").click() #This should fail
    # assert await page.get_by_role("alert").locator("ha-svg-icon").is_visible() == True #Assert we see the alert icon
    await page.get_by_label("Name").fill(tv_remote_card_name) # Add remote name
    await page.locator("add-remote-dialog #button").click()
   
    await page.locator("#buttons #button").click()
    await page.get_by_role("combobox", name="Remote").filter(has_text="Remote TV").click()
    await page.get_by_role("option", name="Air conditioner").click()
    await page.get_by_label("Name").fill(tv_remote_card_name) # Try adding a remote with the same name
    await page.locator("add-remote-dialog #button").click() #This should fail
    #assert await page.get_by_role("alert").is_visible() == True  Assert if we see the alert icon
    await page.get_by_label("Name").fill(ac_remote_card_name)
    await page.locator("add-remote-dialog #button").click()
    await page.locator("#actions-save #button").click()
    

    #Check if the correct card is being displayed as well as if learning mode works as intended    
    await page.locator("#button").nth(1).click()
    await page.locator("#editor ha-card").filter(has_text=tv_remote_card_name).click()
    await page.locator("#actions-save #button").click()
    await page.locator(".ha-status-icon-small > ha-icon > ha-svg-icon").first.click()
    await page.locator(".remoteButton > ha-icon > ha-svg-icon").first.click()
    await page.locator(".remoteButton > ha-icon > ha-svg-icon").first.click()
    await page.locator("#cancel ha-svg-icon").click()

    await page.locator("#button").nth(1).click()
    await page.locator("#editor ha-card").filter(has_text=ac_remote_card_name).click()
    await page.locator("#actions-save #button").click()
    await page.locator(".ha-status-icon-small > ha-icon > ha-svg-icon").first.click()
    await page.locator(".remoteButton > ha-icon > ha-svg-icon").first.click()
    await page.locator(".remoteButton > ha-icon > ha-svg-icon").first.click()
    await page.locator("#cancel ha-svg-icon").click()

    ## Test if these remotes appear in a newly created card
    await async_create_broadlink_card(page, empty_dashboard=False) #Since the dashboard is not empty, we need to give this information to the function
    await page.locator("#button").nth(2).click()
    assert await page.locator("#editor").get_by_text(tv_remote_card_name).is_visible() == True
    assert await page.locator("#editor").get_by_text(ac_remote_card_name).is_visible() == True
    await page.locator("#cancelButton #button").click()

    ## Delete remotes
    await page.locator("#button").nth(1).click()
    await page.locator("#editor").get_by_text(tv_remote_card_name).click()
    await page.locator("#button-cancel #button").click()
    await page.locator("#editor").get_by_text(ac_remote_card_name).click()
    await page.locator("#button-cancel #button").click()
    await page.locator("#actions-save #button").click()

    # Open a new remote 
    await page.locator("#button").nth(2).click()
    assert await page.locator("#editor").get_by_text(tv_remote_card_name).is_visible() == False #As the remotes were deleted this should be false
    assert await page.locator("#editor").get_by_text(ac_remote_card_name).is_visible() == False
    await page.locator("#actions-save #button").click()


    #await async_clean_dashboard(page) #Note: This function is not working as intended
    
    await context.close()
    await browser.close()


async def main() -> None:
    async with async_playwright() as playwright:
        await run(playwright)

asyncio.run(main())
