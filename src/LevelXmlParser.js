// LevelXmlParser.js - XML parsing for original Jump Goober Jump level files.
// Mirrors the first step of GameEngine.loadfromXML() in core/GameEngine.as.

const SUPPORTED_TYPES = new Set([
    'activatetrackwall',
    'boost',
    'boostfruit',
    'bossactivate',
    'cloudboss',
    'deathwall',
    'flowerboss',
    'wall',
    'textfield',
    'goal',
    'laserlauncher',
    'rocketlauncher',
    'track',
    'trackblade',
    'trackwall',
]);

export default class LevelXmlParser {
    parse(xmlText, sourceName = 'unknown') {
        if (typeof xmlText !== 'string') {
            throw new Error(`Level data for ${sourceName} must remain XML text during the faithful port.`);
        }

        if (!xmlText.includes('<level')) {
            throw new Error(`Level data for ${sourceName} is not XML level text.`);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'application/xml');
        const parserError = doc.querySelector('parsererror');

        if (parserError) {
            throw new Error('Could not parse level XML.');
        }

        const levelNode = doc.querySelector('level');
        if (!levelNode) {
            throw new Error('Level XML does not contain a <level> root.');
        }

        const objects = [];
        const unsupported = [];
        const counts = {};
        const unsupportedCounts = {};

        for (const node of Array.from(levelNode.children)) {
            const type = node.tagName;
            const record = this._parseNode(type, node);

            counts[type] = (counts[type] || 0) + 1;

            if (SUPPORTED_TYPES.has(type)) {
                objects.push(record);
            } else {
                unsupported.push(record);
                unsupportedCounts[type] = (unsupportedCounts[type] || 0) + 1;
            }
        }

        return {
            name: levelNode.getAttribute('name') || 'Untitled Level',
            bg: this._numberAttribute(levelNode, 'bg', null),
            sourceName,
            objects,
            unsupported,
            counts,
            unsupportedCounts,
        };
    }

    _parseNode(type, node) {
        const record = {
            type,
            x: this._numberAttribute(node, 'x', 0),
            y: this._numberAttribute(node, 'y', 0),
            width: this._numberAttribute(node, 'width', 0),
            height: this._numberAttribute(node, 'height', 0),
            dir: this._numberAttribute(node, 'dir', 0),
            hp: this._numberAttribute(node, 'hp', 0),
            explode: node.getAttribute('explode') || '',
            text: node.getAttribute('text') || '',
        };

        if (type === 'textfield') {
            if (!node.hasAttribute('width')) {
                record.width = 156;
            }
            if (!node.hasAttribute('height')) {
                record.height = 70;
            }
        }

        if (type === 'boostfruit' && !node.hasAttribute('width')) {
            record.width = 24;
        }

        if (type === 'boostfruit' && !node.hasAttribute('height')) {
            record.height = 28;
        }

        if ((type === 'rocketlauncher' || type === 'laserlauncher' || type === 'flowerboss' || type === 'cloudboss') && !node.hasAttribute('width')) {
            record.width = 0;
        }

        if ((type === 'rocketlauncher' || type === 'laserlauncher' || type === 'flowerboss' || type === 'cloudboss') && !node.hasAttribute('height')) {
            record.height = 0;
        }

        return this._normalizeRecord(record);
    }

    _normalizeRecord(record) {
        if (record.width < 0) {
            record.x += record.width;
            record.width = Math.abs(record.width);
        }

        if (record.height < 0) {
            record.y += record.height;
            record.height = Math.abs(record.height);
        }

        return record;
    }

    _numberAttribute(node, name, fallback) {
        if (!node.hasAttribute(name)) {
            return fallback;
        }

        const value = Number(node.getAttribute(name));
        return Number.isFinite(value) ? value : fallback;
    }
}
