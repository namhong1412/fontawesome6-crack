// Import necessary libraries
import { Font } from 'fonteditor-core';
import fs from 'fs';

// Read the font file
const buffer = fs.readFileSync('./fa-duotone-900.otf');
const font = Font.create(buffer, {
    type: 'otf',
    combinePath: false,
});
const fontObject = font.get();

// Specify the character code point you want
const characterCodePoint = 'uniE011';

// Find the glyph for the specified character
const targetGlyph = fontObject.glyf.find((glyph) => glyph.name === characterCodePoint);

if (targetGlyph) {
    // Extract the contours (path) of the glyph
    const { contours } = targetGlyph;

    // Check if there are contours
    if (contours && contours.length > 0) {
        // Convert the contours to SVG path data
        const svgPathData = contours
            .map((contour) =>
                contour.map((point) => `${point.onCurve ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
            )
            .join(' ');

        // Create a complete SVG string
        const completeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                                <path d="${svgPathData}" fill="black"/>
                             </svg>`;

        // Now you have the complete SVG for the character
        console.log('Complete SVG:', completeSVG);
    }
} else {
    console.error('Character not found in the font.');
}
