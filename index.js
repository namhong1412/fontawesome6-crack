import express from 'express';
import cheerio from 'cheerio';
import TextToSVG from 'text-to-svg';
import {dirname} from 'path';
import {optimize} from 'svgo';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const primaryColor = '#1e3050';
const secondaryColor = '#a6acb9';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

function getSVG(character, iconStyle, color) {
    console.log(character);
    const attributes = {fill: 'red', stroke: 'black'};
    const options = {x: 0, y: 0, fontSize: 200, anchor: 'top', attributes};
    const textToSVG = TextToSVG.loadSync(`./fonts/${iconStyle}.otf`);

    let svg = textToSVG.getSVG(character, options);
    const [svgWidth, svgHeight] = svg.match(/width\=\"\d+\"|height\=\"\d+\"/g).map(match => +match.split('"')[1]);
    svg = svg.replace(/red|black/g, color)
        .replace(`xmlns="http://www.w3.org/2000/svg"`, `viewBox="-5 -5 ${svgWidth + 10} ${svgHeight + 10}"`);

    return svg;
}

app.post('/api/get-svg', (req, res) => {
    const {character, iconStyle} = req.body;
    if (iconStyle !== 'fa-duotone-900') {
        // Generate SVG with a single style
        let svg = getSVG(character, iconStyle, primaryColor);
        svg = optimize(svg, {multipass: true}).data;
        res.json({data: svg});
    } else {
        // Generate SVG with two combined styles
        const backgroundSVG = getSVG(character, 'fa-solid-900', secondaryColor);
        const foregroundSVG = getSVG(character, 'fa-duotone-900', primaryColor);

        const $ = cheerio.load(backgroundSVG);
        $('svg').append(cheerio.load(foregroundSVG, null, false)('svg').html());

        let svg = $('svg').parent().html();
        svg = optimize(svg, {multipass: true}).data;
        res.json({data: svg});
    }
});

app.listen(3002);
