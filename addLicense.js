const content = new Buffer(`/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

`);

const fs = require('fs');
const path = require('path');
const files = [];
const folders = [];
const extensions = ['js', 'ts', 'tsx', 'jsx', 'css', 'scss'];

const checkFile = filePath => fs.statSync(filePath).isFile();
const sortPath = dir => {
    fs.readdirSync(dir)
        .filter(file => {
            if (file.indexOf('.') !== 0) {
                return file;
            }
        })
        .forEach(res => {
            const filePath = path.join(dir, res);
            if (checkFile(filePath)) {
                const ext = filePath.split('.')[filePath.split('.').length - 1];
                if (extensions.indexOf(ext) > -1) files.push(filePath); // Change the condition as per your file extension
            } else {
                folders.push(filePath);
            }
        });
};

const sortDir = mainDir => {
    folders.push(mainDir);
    let i = 0;
    do {
        sortPath(folders[i]);
        i += 1;
    } while (i < folders.length);
};

sortDir(path.join(__dirname, 'src')); // Change this as per your need

files.forEach(file => {
    fs.readFile(file, (err, data) => {
        if (!err) {
            fs.open(file, 'w+', (err1, fd) => {
                if (!err1) {
                    fs.writeSync(fd, content, 0, content.length, 0);
                    fs.writeSync(fd, data, 0, data.length, content.length);
                    fs.close(fd, err => {
                        if (!err) {
                            console.log('added');
                        }
                    });
                }
            });
        }
    });
});