import Home from '..';

export default function Page() {
    return Home({
        sem: {
            id: 'gads',
            title: <>The easiest way to <b className="underline">store</b> and <b className="underline">sync</b> Data in Electron</>,
            appName: 'Electron',
            iconUrl: '/files/icons/electron.svg',
            metaTitle: 'Local Electron Database'
        }
    });
}
