const fs = require('fs');
const path = require('path');

const layoutFile = path.join(__dirname, 'shared/styles/_layout.scss');
const content = fs.readFileSync(layoutFile, 'utf8');
const lines = content.split('\n');

function writePart(filename, startLine, endLine) {
  const part = lines.slice(startLine - 1, endLine).join('\n');
  fs.writeFileSync(path.join(__dirname, 'shared/styles', filename), part);
}

writePart('base/_reset.scss', 1, 43);
writePart('layout/_sections.scss', 45, 98);
writePart('layout/_hero.scss', 100, 148);
writePart('components/_cards.scss', 150, 196);
writePart('components/_social.scss', 198, 299);
writePart('components/_buttons.scss', 301, 347);
writePart('components/_modals.scss', 349, 396);
writePart('layout/_header.scss', 398, 790);
writePart('base/_document.scss', 792, 814); // Bootstrap overrides
writePart('layout/_footer.scss', 816, 915);
writePart('components/_policy.scss', 917, 955);
writePart('utilities/_responsive.scss', 957, lines.length);

console.log('Done splitting _layout.scss');
