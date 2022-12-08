"""Helpers for the test of remote entities"""

from playwright.async_api import expect

import json

HOST="http://192.168.1.173:8123/" # Can be replace by localhost if HA is running on the current machine or by some other prefix

AUTH_FILE = "tests/folder/auth_data.json"

async def async_login_homeland(page):
    """Function to login in homeland """
    with open(AUTH_FILE) as fh:
        auth_data = json.load(fh)

    lang_flag = await page.get_by_label("Username").is_visible()
    if lang_flag == True:
        await page.get_by_label("Username").fill(auth_data["username"])
        await page.get_by_label("Password").fill(auth_data["password"])
        await page.get_by_text("Keep me logged in").click() #Might be required
    else: 
        await page.get_by_label("Utilizador").fill(auth_data["username"])
        await page.get_by_label("Palavra-passe").fill(auth_data["password"])
        await page.get_by_text("Manter sessão iniciada").click()


    await page.locator("#button").click()

async def async_goto_test_dashboard(page, edit = True):
    """Function to open the Homeland web app and go to the testing dashboard"""
    page_url = HOST  + "lovelace-test/0"
    if edit == True: 
        page_url += "?edit=1"
    await page.goto(page_url)

async def async_create_broadlink_card(page, empty_dashboard = True):
    """Create a broadlink card
    Assumes the card that will be create is in the first position"""
    if empty_dashboard == True:
        await page.locator("ha-card").click()
    else: 
        await page.locator("ha-fab ha-svg-icon").click()
    await page.get_by_label("Search cards").fill("broadlink remote card")
    await page.locator(".overlay").first.click()
    await page.locator("#actions-save #button").click()

async def async_clean_dashboard(page):
    """Remove cards from the dashboard"""
    await async_goto_test_dashboard(page) #Goto edit mode; I assume here the keep logged in box is ticked off
    empty_dashboard_flag = await page.get_by_text("Add Card").is_visible() #check if the big Add Card button is there
    while empty_dashboard_flag == False:
        flag_single_card = await page.locator("ha-button-menu ha-svg-icon").is_visible() # Set this flag to true if only a card is in the dashboard
        if flag_single_card == True: 
            await page.locator("ha-button-menu ha-svg-icon").click()
        else: 
            await page.locator("ha-button-menu > ha-icon-button > mwc-icon-button > ha-svg-icon").first.click()

        await page.get_by_role("menuitem", name="Delete card").click()
        await page.locator("mwc-button").filter(has_text="Delete").locator("#button").click()
        empty_dashboard_flag = await page.get_by_text("Add Card").is_visible() #At the end update the status



async def async_enter_card_dialog(page):
    """Enter in the leftmost card dialog"""
    if await expect(page.get_by_text("Edit")).to_be_visible(): #Enter in edit mode
        await page.get_by_text("Edit").click()

async def async_create_preset(page, name = "foo"):
    """Create a preset with a set name"""
    await page.locator("#buttons #button").click()
    await page.get_by_label("Name").click()
    await page.get_by_label("Name").fill(name)
    await page.locator("add-remote-dialog #button").click()




