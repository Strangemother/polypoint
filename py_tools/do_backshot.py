from backshot_app import backend_async_one
import asyncio

import argparse


def main(args, **opts):
    options = {**vars(args), **opts}
    options['headless'] = not options.pop('no_headless', False)
    # print(options)
    backend_async_one.sync_main(options)


def create_parser():
    parser = argparse.ArgumentParser(description="Configure screenshot options.")

    parser.add_argument(
        'url',
        type=str,
        default=['http://localhost:8001/'],
        nargs="*",
        help='URL to take screenshot from (default: http://localhost:8001/screenshot/spectrum-lines/)'
    )

    parser.add_argument(
        '--file',
        type=str,
        default=None,
        nargs="*",
    )

    parser.add_argument(
        '--size',
        type=str,
        default='full',
        help='Size of the screenshot (default: full)'
    )

    parser.add_argument(
        '--file-path',
        type=str,
        default=None, #'filepath.png',
        help='File path to save screenshot (default: filepath.png)'
    )

    parser.add_argument(
        '--no-headless',
        action='store_false',
        help='Run browser in without headless mode (default: False)'
    )

    return parser



if __name__ == '__main__':
    args = create_parser().parse_args()
    main(args)

