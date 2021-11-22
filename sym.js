import SnakeRenderer from './lib/SnakeRenderer.js';
import Constants from './lib/Constants.js';

for (const k in Constants.snakes) {
	const s = new SnakeRenderer(Constants.snakes[k]);
}

