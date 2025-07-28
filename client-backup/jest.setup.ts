import '@testing-library/jest-dom';
import 'whatwg-fetch';

import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
});
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
