"""Helpers for the test of remote entities"""

import json

AUTH_FILE = "tests/folder/auth_data.json"

async def async_login_homeland(page):
    """Function to login in homeland """
    with open(AUTH_FILE) as fh:
        auth_data = json.load(fh)

    await page.get_by_label("Username").fill(auth_data["username"])
    await page.get_by_label("Password").click()
    await page.get_by_label("Password").fill(auth_data["password"])
    await page.get_by_text("Keep me logged in").click() #Might be required
    await page.locator("#button").click()

async def async_goto_test_dashboard(page):
    """Function to open the Homeland web app and go to the testing dashboard"""
    await page.goto("http://localhost:8123/lovelace-test/0")
    await page.goto("http://localhost:8123/auth/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8123%2Flovelace-test%2F0%3Fauth_callback%3D1&client_id=http%3A%2F%2Flocalhost%3A8123%2F&state=eyJoYXNzVXJsIjoiaHR0cDovL2xvY2FsaG9zdDo4MTIzIiwiY2xpZW50SWQiOiJodHRwOi8vbG9jYWxob3N0OjgxMjMvIn0%3D")


async def async_create_broadlink_card(page):
    """Create a broadlink card"""
    await page.locator("#icon").click()
    await page.get_by_label("Search cards").click()
    await page.get_by_label("Search cards").fill("broadlink remote card")
    await page.locator("hui-card-picker #content div").nth(2).click()
    await page.locator("#actions-save #button").click()

async def async_clean_dashboard(page):
    """Remove card (assumes only one card is present in the dashboard)"""
    await page.get_by_text("Edit").click()
    await page.locator("ha-button-menu ha-svg-icon").click()
    await page.get_by_role("menuitem", name="Delete card").click()
    await page.locator("mwc-button").filter(has_text="Delete").locator("#button").click()
    await page.get_by_role("button", name="Done").click()
    await page.locator("ha-card").click()
    await page.locator(".overlay").first.click()
    await page.locator("#actions-save #button").click()