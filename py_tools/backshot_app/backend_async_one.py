"""Render web pages using pyppeteer and chrome

https://pyppeteer.github.io/pyppeteer/
https://pyppeteer.github.io/pyppeteer/reference.html

"""
# run a browser request from the backend to render the JS content
#
import asyncio
from pyppeteer import launch
from pathlib import Path

HERE = Path(__file__).parent.absolute()
## MUST BE windows format; forward slash causes a socket fault.
# EXE_PATH = 'C:\\Users\\jay\\AppData\\Local\\Chromium\\Application\\chrome.exe'
EXE_PATH = str(HERE / Path('Chromium\\Application\\chrome.exe'))
SCREENSHOT_DIR =  HERE / Path('screenshots/')

## Causes load of 'basic.com'
# EXE_PATH = 'C:\\Program Files\\Ablaze Floorp\\floorp.exe'
# EXE_PATH = "C:\\Program Files\\Mozilla Firefox\\firefox.exe"

## missing bcryptprimitives.dll (windows 7 issues)
# EXE_PATH = "geckodriver.exe"

ENDPOINT = "http://localhost:8001/"

"""

    width (int): page width in pixel.
    height (int): page height in pixel.
     -- deviceScaleFactor (float): Default to 1.0. --
     -- isMobile (bool): Default to False. --
     -- hasTouch (bool): Default to False. --
     -- isLandscape (bool): Default to False. --

        High Definition (HD)    1,280 × 720
        Full HD (FHD)   1,920 × 1,080
        2K, Quad HD (QHD)   2,560 × 1,440
        4K, Ultra HD (UHD)  3,840 × 2,160
        8K, Ultra HD (UHD)  7,680 × 4,320
"""
SIZES = {
    'high': {
        'label': "High Definition (HD)",
        'width': 1_280,
        'height': 720,
    },
    'full': {
        'label': "Full HD (FHD)",
        'width': 1_920,
        'height': 1_080,
    },
    '2k': {
        'label': "2K, Quad HD (QHD)",
        'width': 2_560,
        'height': 1_440,
    },
    '4k': {
        'label': "4K, Ultra HD (UHD)",
        'width': 3_840,
        'height': 2_160,
    },
    '8k': {
        'label': "8K, Ultra HD (UHD)",
        'width': 7_680,
        'height': 4_320,
    },
}


async def main(options=None, dry=False):
    # browser = await launch()
    # https://github.com/puppeteer/puppeteer/blob/v5.2.1/docs/api.md#puppeteerlaunchoptions
    """
    ignoreHTTPSErrors (bool): Whether to ignore HTTPS errors. Defaults to False.
    headless (bool): Whether to run browser in headless mode.
                     Defaults to True unless appMode or devtools options is True.
    executablePath (str): Path to a Chromium or Chrome executable to run
                          instead of default bundled Chromium.
    slowMo (int|float): Slow down pyppeteer operations by the specified amount
                        of milliseconds.
    args (List[str]): Additional arguments (flags) to pass to the browser process.
    ignoreDefaultArgs (bool): Do not use pyppeteer’s default args.
                              This is dangerous option; use with care.
    handleSIGINT (bool): Close the browser process on Ctrl+C. Defaults to True.
    handleSIGTERM (bool): Close the browser process on SIGTERM. Defaults to True.
    handleSIGHUP (bool): Close the browser process on SIGHUP. Defaults to True.
    dumpio (bool): Whether to pipe the browser process stdout and stderr
                   into process.stdout and process.stderr. Defaults to False.
    userDataDir (str): Path to a user data directory.
    env (dict): Specify environment variables that will be visible
                to the browser. Defaults to same as python process.
    devtools (bool): Whether to auto-open a DevTools panel for each tab.
                     If this option is True, the headless option will be set False.
    logLevel (int|str): Log level to print logs. Defaults to same as the root logger.
    autoClose (bool): Automatically close browser process when script completed.
                      Defaults to True.
    loop (asyncio.AbstractEventLoop): Event loop (experimental).
    appMode (bool): Deprecated.
    """
    options = options or {}
    # unpack file
    files = options.get('file')
    url = options.get('url', ENDPOINT)

    if files is not None:
        urls = read_files(files)
    else:
        urls = [url]
    assert SCREENSHOT_DIR.exists()
    if not dry:
        browser = await launch(
            headless=options.get('headless', True),
            executablePath=EXE_PATH,
            # userDataDir="\\Local\\Google\\Chrome\\User Data"
            # deviceScaleFactor=2
            )
        page = await browser.newPage()

    # https://en.wikipedia.org/wiki/Display_resolution#Common_display_resolutions
    """

    width (int): page width in pixel.
    height (int): page height in pixel.
    deviceScaleFactor (float): Default to 1.0.
    isMobile (bool): Default to False.
    hasTouch (bool): Default to False.
    isLandscape (bool): Default to False.

        High Definition (HD)    1,280 × 720
        Full HD (FHD)   1,920 × 1,080
        2K, Quad HD (QHD)   2,560 × 1,440
        4K, Ultra HD (UHD)  3,840 × 2,160
        8K, Ultra HD (UHD)  7,680 × 4,320
    """
    if not dry:
        await page.setViewport({
            **SIZES.get(options.get('size', 'full')),
            'deviceScaleFactor': options.get('scale', 1)
            });

    for i, url in enumerate(urls):
        print('Heading to', url)
        if not dry:
            await page.goto(url)
        filepath = options.get('file_path')
        full_path = get_safe_filename(url, filepath, i)
        print('writing to', full_path)

        """
        path (str): The file path to save the image to. The screenshot type will be inferred from the file extension.
        type (str): Specify screenshot type, can be either jpeg or png. Defaults to png.
        quality (int): The quality of the image, between 0-100. Not applicable to png image.
        fullPage (bool): When true, take a screenshot of the full scrollable page. Defaults to False.
        clip (dict): An object which specifies clipping region of the page.
            This option should have the following fields:
                x (int): x-coordinate of top-left corner of clip area.
                y (int): y-coordinate of top-left corner of clip area.
                width (int): width of clipping area.
                height (int): height of clipping area.
        omitBackground (bool): Hide default white background and allow capturing screenshot with transparency.
        encoding (str): The encoding of the image, can be either 'base64' or 'binary'. Defaults to 'binary'.
        """
        if not dry:
            await page.screenshot({
                'path': full_path,
                "fullPage": True,
                "omitBackground": True,
            });

    # dimensions = await page.evaluate('''() => {
    #     return {
    #         width: document.documentElement.clientWidth,
    #         height: document.documentElement.clientHeight,
    #         deviceScaleFactor: window.devicePixelRatio,
    #     }
    # }''')

    # print(dimensions)
    if not dry:
        await browser.close()


import unicodedata, re

def read_files(files):
    # open,
    res = ()
    for file in files:
        paths = Path(file).read_text().split('\n')
        res += tuple(paths)
    # read urls
    # return urls.
    return res

def slugify(value):
    """
    Converts to lowercase, removes non-word characters (alphanumerics and
    underscores) and converts spaces to hyphens. Also strips leading and
    trailing whitespace.
    """
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub('[^\w\s-]', '-', value).strip().lower()
    return re.sub('[-\s:]+', '-', value)


def get_safe_filename(url, filepath, i):
    path = filepath
    if path is None:
        path = slugify(url)
    fname = Path(path)
    suffix = '.png' if len(fname.suffix) == 0 else  fname.suffix
    sname = slugify(f'{fname.stem}-{i+1}')
    nname = fname.with_name(f'{sname}{suffix}')

    full_path = str(SCREENSHOT_DIR / nname)
    return full_path


def sync_main(opts=None):
    return asyncio.get_event_loop().run_until_complete(main(opts))

if __name__ == '__main__':
    sync_main()
