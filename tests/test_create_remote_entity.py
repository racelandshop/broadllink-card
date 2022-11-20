import asyncio

from playwright.async_api import Playwright, async_playwright, expect

from .helpers import (async_goto_test_dashboard,
                      async_create_broadlink_card,
                      async_login_homeland,
                      async_clean_dashboard)

async def run(playwright: Playwright) -> None:
    browser = await playwright.chromium.launch(headless=False)
    context = await browser.new_context(viewport={"width":1200,"height":900})
    page = await context.new_page()

    await async_goto_test_dashboard(page)
    await async_login_homeland(page)
    await async_create_broadlink_card(page)
    await async_clean_dashboard(page)
    await context.close() #Since its the first in the session we are trying to get into homeland we need to login first
    await browser.close()


async def main() -> None:
    async with async_playwright() as playwright:
        await run(playwright)

asyncio.run(main())
